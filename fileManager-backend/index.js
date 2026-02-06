const express = require('express')
const sqlite3 = require('sqlite3')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const loginRouter = require('./controllers/login')
const registerRouter = require('./controllers/register')
const filesRouter = require('./controllers/files')
const middleware = require('./utils/middleware')
const db = new sqlite3.Database('./database.sqlite')
require('dotenv').config()

const app = express()
const PORT = 5000


app.use(cors({
  origin: 'http://localhost:5173',
  exposedHeaders: ['Content-Disposition']
}))

app.use(express.json())
app.use('/uploads', express.static('uploads'))

app.use(middleware.tokenExtractor)
app.use('/', registerRouter)
app.use('/', loginRouter)
app.use('/', filesRouter)


app.use(middleware.requestLogger)
app.use(middleware.errorHandler)

app.use(express.json({ charset: 'utf-8' }))
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }))


app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  next()
})

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
    favorite BOOLEAN DEFAULT FALSE NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`)
  db.run('CREATE INDEX IF NOT EXISTS idx_user_files ON files(user_id)')

})



const fileAuthMiddleware = (req, res, next) => {
  try {
    const authorization = req.headers.authorization
    if (!authorization || !authorization.toLowerCase().startsWith('bearer ')) {
      return res.status(401).json({ error: 'Отсутствует токен' })
    }

    const token = authorization.substring(7)
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY)

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


app.get('/health', (req, res) => {
  res.status(200).send('OK')
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
