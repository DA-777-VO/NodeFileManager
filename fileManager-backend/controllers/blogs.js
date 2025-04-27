const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })

  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response, next) => {
  try{
    const blog = await Blog.findById(request.params.id)
    if (blog) {
      response.json(blog)
    } else {
      response.status(404).end()
    }
  } catch (exception) {
    next(exception)
  }
})

blogsRouter.post('/', async (request, response, next ) => {
  const body = request.body
  const user = request.user

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    user: user,
    // user: user._id,
    likes: body.likes
  })

  try {
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
  } catch (exception) {
    next(exception)
  }
})

// blogsRouter.delete('/:id', async (request, response, next) => {
//
//   const user = request.user
//
//   const blogToDelete = await Blog.findById(request.params.id)
//
//   if (user._id.toString() === blogToDelete.user.toString()) {
//     try {
//       await Blog.findByIdAndDelete(request.params.id)
//       response.status(204).end()
//     } catch (exception){
//       next(exception)
//     }
//   } else {
//     return response.status(401).json({ error: 'Unauthorized' })
//   }
//
// })

blogsRouter.put('/:id', async (request, response, next) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  }

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new:true })
      .populate('user', { username: 1, name: 1 })
    response.json(updatedBlog)
  } catch (exception) {
    next(exception)
  }

})

module.exports = blogsRouter