const logger = require('./logger')
const _ = require('lodash')

const dummy = () => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item
  }

  const blogsLikes = blogs.map(blog => blog.likes)
  logger.info('Blogs Likes:', blogsLikes)

  return blogsLikes.reduce(reducer, 0)
}


const favoriteBlog = (blogs) => {
  if (blogs.length !== 0) {
    const result = blogs.reduce((mostLiked, currentBlog) => currentBlog.likes > mostLiked.likes ? currentBlog : mostLiked, blogs[0])
    return {
      title: result.title,
      author: result.author,
      likes: result.likes
    }
  }else {
    return null
  }
}

const mostBlogs = (blogs) => {

  if (blogs.length === 0) {
    return null
  }

  return _(blogs)
    .groupBy('author')
    .map((group, author) => ({ author, blogs: group.length }))
    .maxBy('blogs')
}

const mostLikes = (blogs) => {

  if (blogs.length === 0) {
    return null
  }

  return _(blogs)
    .groupBy('author')
    .map((group, author) => ({
      author: author,
      likes: group.reduce((sum, blog) => sum + blog.likes, 0)
    }))
    .maxBy('likes')
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}