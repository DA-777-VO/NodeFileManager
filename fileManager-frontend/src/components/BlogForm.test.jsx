import { render, screen } from '@testing-library/react'
import BlogForm from './BlogForm'
import userEvent from '@testing-library/user-event'

describe('<BlogForm/>', () => {

  test('BlogForm calls event handler with correct details when new blog is created', async () => {

    const createBlog = vi.fn()
    const user = userEvent.setup()

    const { container } = render(<BlogForm createBlog={createBlog} />)

    const title = container.querySelector('#title')
    const author = container.querySelector('#author')
    const url = container.querySelector('#url')
    //const button = container.querySelector('#submitButton')
    const button = screen.getByText('create')


    await user.type(title, 'testing a form...')
    await user.type(author, 'Zaur')
    await user.type(url, 'https://dota2.com')
    await user.click(button)

    expect(createBlog.mock.calls).toHaveLength(1)
    console.log(createBlog.mock.calls)
    expect(createBlog.mock.calls[0][0].title).toBe('testing a form...')
    expect(createBlog.mock.calls[0][0].author).toBe('Zaur')
    expect(createBlog.mock.calls[0][0].url).toBe('https://dota2.com')
  })


})