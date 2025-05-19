const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const sqlite3 = require('sqlite3')
const loginRouter = require('express').Router()
require('dotenv').config()
const db = new sqlite3.Database('./database.sqlite')


loginRouter.post('/login', async (req, res) => {
  const { username, password } = req.body

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.SECRET_KEY )
    res.json({ token, username: user.username, id: user.id })
  })
})

module.exports = loginRouter