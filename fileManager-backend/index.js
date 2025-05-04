const express = require('express')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const path = require('path')
const cors = require('cors')
const fs = require('fs').promises
const fsSync = require('fs') // Добавляем синхронные методы отдельно
const mime = require('mime-types')

const app = express()
const PORT = 5000
const SECRET_KEY = 'your_secret_key'
const upload = multer({ dest: 'uploads/' })

app.use(cors({
  origin: 'http://localhost:5173',
  exposedHeaders: ['Content-Disposition']
}))

app.use(express.json())
app.use('/uploads', express.static('uploads'))


// Настройка Express для работы с UTF-8
app.use(express.json({ charset: 'utf-8' }))
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }))

// Установка заголовков для всех ответов
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  next()
})

const db = new sqlite3.Database('./database.sqlite')

db.serialize(() => {
  db.run('PRAGMA encoding = "UTF-8";')

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `)
  db.run(`
  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    size INTEGER NOT NULL,
    type TEXT NOT NULL,
    upload_date DATETIME NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`)

  // Создание индекса после таблиц
  db.run('CREATE INDEX IF NOT EXISTS idx_user_files ON files(user_id)')

})

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1] || req.query.token

  if (!token) return res.sendStatus(401)

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}


const fileAuthMiddleware = (req, res, next) => {
  try {
    const authorization = req.headers.authorization
    if (!authorization || !authorization.toLowerCase().startsWith('bearer ')) {
      return res.status(401).json({ error: 'Отсутствует токен' })
    }

    const token = authorization.substring(7)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!decodedToken.id) {
      return res.status(401).json({ error: 'Неверный токен' })
    }

    req.user = decodedToken
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Неверный токен' })
  }
}

module.exports = fileAuthMiddleware


app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)

    db.run(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword],
      function(err) {
        if (err) return res.status(400).json({ error: 'Username already exists' })
        res.status(201).json({ id: this.lastID })
      }
    )
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ username: user.username }, SECRET_KEY)
    res.json({ token })
  })
})


app.post('/upload', authenticateJWT, upload.single('file'), async (req, res) => {
  let tempFilePath = null

  try {
    // 1. Проверка наличия файла
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }
    tempFilePath = req.file.path

    // 2. Подготовка путей
    const userDir = path.join(__dirname, 'uploads', req.user.username)
    let originalName = req.file.originalname

    if (Buffer.isBuffer(originalName)) {
      originalName = originalName.toString('utf8')
    } else if (typeof originalName === 'string') {
      // Убедимся, что строка правильно декодирована
      try {
        // Попытка декодировать, если строка закодирована в другой кодировке
        const decoded = decodeURIComponent(escape(originalName))
        originalName = decoded
      } catch (e) {
        // Если декодирование не удалось, оставляем как есть
        console.log('Decoding filename failed, using original:', e)
      }
    }

    console.log('Original filename:', originalName)

    // 3. Валидация имени файла
    if (!originalName || originalName.includes('/') || originalName.includes('\\')) {
      throw new Error('Invalid filename')
    }

    const filePath = path.join(userDir, originalName)

    // 4. Проверка существования файла
    try {
      await fs.access(filePath)
      return res.status(400).json({ error: 'File already exists' })
    } catch (err) {} // Файл не существует - продолжаем

    // 5. Создание директории
    await fs.mkdir(userDir, { recursive: true })

    // 6. Перемещение файла
    await fs.rename(tempFilePath, filePath)
    tempFilePath = null // Сброс временного пути

    // 7. Получение метаданных
    const stats = await fs.stat(filePath)
    const fileType = mime.lookup(originalName) || 'application/octet-stream'

    // 8. Сохранение в БД
    db.run(
      `INSERT INTO files
             (user_id, filename, size, type, upload_date)
         VALUES (
                        (SELECT id FROM users WHERE username = ?),
                        ?, ?, ?, datetime('now')
                )`,
      [req.user.username, originalName, stats.size, fileType],
      async function(err) {
        // 9. Обработка ошибок БД
        if (err) {
          console.error('Database error:', err)
          await fs.unlink(filePath) // Удаляем загруженный файл
          return res.status(500).json({ error: 'Database operation failed' })
        }

        // 10. Получение полной записи из БД
        db.get(
          `SELECT filename, size, type, 
            strftime('%Y-%m-%dT%H:%M:%SZ', upload_date) as upload_date 
           FROM files 
           WHERE id = ?`,
          [this.lastID],
          (err, newFile) => {
            if (err) {
              console.error('Error fetching file data:', err)
              return res.status(500).json({ error: 'Failed to retrieve file data' })
            }

            // 11. Успешный ответ
            res.status(201).json({
              message: 'File uploaded successfully',
              file: {
                filename: newFile.filename,
                size: newFile.size,
                type: newFile.type,
                upload_date: newFile.upload_date
              }
            })
          }
        )
      }
    )

  } catch (error) {
    console.error('Upload error:', error)

    // 12. Очистка временных файлов
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath)
      } catch (cleanupErr) {
        console.error('Cleanup error:', cleanupErr.message)
      }
    }

    // 13. Обработка ошибок клиента
    const statusCode = error.message.includes('Invalid filename') ? 400 : 500
    res.status(statusCode).json({
      error: error.message || 'File upload failed'
    })
  }
})

app.get('/files', authenticateJWT, (req, res) => {
  db.all(
    `SELECT filename, size, type, upload_date 
     FROM files 
     WHERE user_id = (SELECT id FROM users WHERE username = ?)`,
    [req.user.username],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' })

      const processedRows = rows.map(row => {
        return {
          ...row,
          filename: Buffer.from(row.filename, 'binary').toString('utf8')
        }
      })
      res.json(rows)
    }
  )
})

app.get('/files/:filename', authenticateJWT, async (req, res) => {
  try {
    const userDir = path.join(__dirname, 'uploads', req.user.username)
    const filePath = path.join(userDir, req.params.filename)

    await fs.access(filePath)
    res.sendFile(filePath)
  } catch (error) {
    res.status(404).send('File not found')
  }
})

app.delete('/files/:filename', authenticateJWT, async (req, res) => {
  try {
    const userDir = path.join(__dirname, 'uploads', req.user.username)
    const filename = req.params.filename
    const filePath = path.join(userDir, filename)

    // Удаление из базы данных
    db.run(
      `DELETE FROM files 
       WHERE user_id = (SELECT id FROM users WHERE username = ?) 
       AND filename = ?`,
      [req.user.username, filename],
      async function(err) {
        if (err) {
          console.error('Database error:', err)
          return res.status(500).json({ error: 'Failed to delete file from database' })
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'File not found' })
        }

        // Удаление файла из файловой системы
        try {
          await fs.unlink(filePath)
          res.status(200).json({ message: 'File deleted successfully' })
        } catch (fsError) {
          console.error('File deletion error:', fsError)
          res.status(500).json({ error: 'Failed to delete file from storage' })
        }
      }
    )
  } catch (error) {
    console.error('Delete error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})


app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
