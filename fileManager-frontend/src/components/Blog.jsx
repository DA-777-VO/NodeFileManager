import { useState } from 'react'

const Blog = ({ blog, updateBlog, deleteBlog, user }) => {
  const [visible, setVisible] = useState(false)

  const hideWhenVisible = { display: visible ? 'none' : '' }
  const showWhenVisible = { display: visible ? '' : 'none' }

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const addLikes = () => {
    //event.preventDefault()
    updateBlog({
      ...blog,
      likes: blog.likes + 1,
    })
  }

  return (
    <div style={blogStyle} data-testid='smallBlogID'>
      <div style={hideWhenVisible} className='blog'>
        {blog.title} {blog.author} <button onClick={toggleVisibility}>view</button>
      </div>

      <div style={showWhenVisible} className={'fullBlog'} data-testid='blogID'>
        <p>{blog.title} {blog.author}
          <button onClick={toggleVisibility}>hide</button>
        </p>
        <p>{blog.url}</p>
        <p>Likes: {blog.likes}
          <button onClick={addLikes}>like</button>
        </p>
        <p>{blog.user && blog.user.name}</p>
        {blog.user.id === user.id && (<button onClick={() => deleteBlog(blog)}>remove</button>)}
      </div>
    </div>
  )

}

export default Blog
