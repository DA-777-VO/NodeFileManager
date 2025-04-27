import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'


describe('<Blog />', () => {

  //
  // let container
  // let blog
  // let user
  //
  // beforeEach(() => {
  //
  //   blog = {
  //     title: 'Nomernoi',
  //     author: 'Zaur',
  //     url: 'dota2.ru',
  //     likes: '777',
  //     user: {
  //       id: '34564564564'
  //     }
  //   }
  //   user = {
  //     id: 'kkkk'
  //   }
  //
  //   container = render(
  //     <Blog blog={blog} user={user} />
  //   ).container
  // })

  test('renders content', () => {
    const blog = {
      title: 'Nomernoi',
      author: 'Zaur',
      url: 'dota2.ru',
      likes: '777',
      user: {
        id: '34564564564'
      }
    }
    const user = {
      id: 'kkkk'
    }

    const { container } = render(<Blog blog={blog} user={user} />)

    const div = container.querySelector('.blog')
    expect(div).toHaveTextContent('Nomernoi Zaur')

  })

  test('display url and likes when clicking on the button', async () => {
    const blog = {
      title: 'Nomernoi',
      author: 'Zaur',
      url: 'dota2.ru',
      likes: '777',
      user: {
        id: '34564564564'
      }
    }
    const user = {
      id: 'kkkk'
    }

    const { container } = render(<Blog blog={blog} user={user} />)

    const userClick = userEvent.setup()
    const button = screen.getByText('view')
    await userClick.click(button)

    const div = container.querySelector('.fullBlog')
    expect(div).toHaveTextContent('dota2.ru' && '777')

  })

  test('double tap on the like', async () => {

    const blog = {
      title: 'Nomernoi',
      author: 'Zaur',
      url: 'dota2.ru',
      user: {
        id: '34564564564'
      }
    }
    const user = {
      id: 'kkkk'
    }

    const likeClicks = vi.fn()

    render(<Blog blog={blog} user={user} updateBlog={likeClicks} />)

    const userClick = userEvent.setup()
    const button = screen.getByText('view')
    await userClick.click(button)

    const likeButton = screen.getByText('like')

    await userClick.click(likeButton)
    await userClick.click(likeButton)

    expect(likeClicks.mock.calls).toHaveLength(2)
  })

})
