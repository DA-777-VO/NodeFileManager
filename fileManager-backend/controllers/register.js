const bcrypt = require('bcryptjs')
const sqlite3 = require('sqlite3')
const registerRouter = require('express').Router()
require('dotenv').config()
const db = new sqlite3.Database('./database.sqlite')

registerRouter.post('/register', async (req, res) => {
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

module.exports = registerRouter