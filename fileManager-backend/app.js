const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const blogsRoute = require('./controllers/blogs')
const usersRoute = require('./controllers/users')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

const fileAuthMiddleware = require('./index')
const { join } = require('node:path')




mongoose.set('strictQuery', false)

logger.info('connecting to', config.MONGODB_URL)


mongoose.connect(config.MONGODB_URL)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.error('error connecting to MongoDB', error.message)
  })



app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)
//app.use(middleware.userExtractor)

//app.use('/api/blogs', blogsRoute)

app.use('/files', fileAuthMiddleware, express.static(join(__dirname, 'files')))

app.use('/api/blogs', middleware.userExtractor, blogsRoute)
app.use('/api/users', usersRoute)
app.use('/api/login', loginRouter)

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app