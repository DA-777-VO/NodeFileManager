const { authenticateJWT } = require('../utils/middleware')
const filesRouter = require('express').Router()
const sqlite3 = require('sqlite3')
const path = require('path')
const { promises: fs } = require('fs')
const multer = require('multer')
require('dotenv').config()
const db = new sqlite3.Database('./database.sqlite')
const upload = multer({ dest: 'uploads/' })
const mime = require('mime-types')


filesRouter.get('/files', authenticateJWT, (req, res) => {
  db.all(
    `SELECT filename, size, type, upload_date, favorite 
     FROM files 
     WHERE user_id = (SELECT id FROM users WHERE username = ?)`,
    [req.user.username],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' })
      res.json(rows)
    }
  )
})

filesRouter.patch('/files/:filename/favorite', authenticateJWT, async (req, res) => {
  try {
    const { filename } = req.params
    const { favorite } = req.body

    db.run(
      `UPDATE files 
       SET favorite = ?
       WHERE filename = ? 
       AND user_id = (SELECT id FROM users WHERE username = ?)`,
      [favorite, filename, req.user.username],
      function(err) {
        if (err) {
          console.error('Database error:', err)
          return res.status(500).json({ error: 'Failed to update favorite status' })
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'File not found' })
        }

        res.json({
          message: 'Favorite status updated',
          filename,
          favorite
        })
      }
    )
  } catch (error) {
    console.error('Favorite update error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})


filesRouter.get('/files/:filename', authenticateJWT, async (req, res) => {
  try {
    const userDir = path.join(process.cwd(), 'uploads', req.user.username)
    const filePath = path.join(userDir, req.params.filename)

    await fs.access(filePath)
    res.sendFile(filePath)
  } catch (error) {
    res.status(404).send('File not found')
  }
})

filesRouter.delete('/files/:filename', authenticateJWT, async (req, res) => {
  try {
    const userDir = path.join(process.cwd(), 'uploads', req.user.username)
    const filename = req.params.filename
    const filePath = path.join(userDir, filename)

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

filesRouter.post('/upload', authenticateJWT, upload.single('file'), async (req, res) => {
  let tempFilePath = null

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }
    tempFilePath = req.file.path

    const userDir = path.join(process.cwd(), 'uploads', req.user.username)
    let originalName = req.file.originalname

    if (Buffer.isBuffer(originalName)) {
      originalName = originalName.toString('utf8')
    } else if (typeof originalName === 'string') {
      try {
        const decoded = decodeURIComponent(escape(originalName))
        originalName = decoded
      } catch (e) {
        console.log('Decoding filename failed, using original:', e)
      }
    }

    console.log('Original filename:', originalName)

    if (!originalName || originalName.includes('/') || originalName.includes('\\')) {
      throw new Error('Invalid filename')
    }

    const filePath = path.join(userDir, originalName)

    try {
      await fs.access(filePath)
      return res.status(400).json({ error: 'File already exists' })
    } catch (err) {}

    await fs.mkdir(userDir, { recursive: true })

    await fs.rename(tempFilePath, filePath)
    tempFilePath = null

    const stats = await fs.stat(filePath)
    const fileType = mime.lookup(originalName) || 'application/octet-stream'

    db.run(
      `INSERT INTO files
             (user_id, filename, size, type, upload_date)
         VALUES (
                        (SELECT id FROM users WHERE username = ?),
                        ?, ?, ?, datetime('now')
                )`,
      [req.user.username, originalName, stats.size, fileType],
      async function(err) {
        if (err) {
          console.error('Database error:', err)
          await fs.unlink(filePath) // Удаляем загруженный файл
          return res.status(500).json({ error: 'Database operation failed' })
        }

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

    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath)
      } catch (cleanupErr) {
        console.error('Cleanup error:', cleanupErr.message)
      }
    }

    const statusCode = error.message.includes('Invalid filename') ? 400 : 500
    res.status(statusCode).json({
      error: error.message || 'File upload failed'
    })
  }
})

module.exports = filesRouter