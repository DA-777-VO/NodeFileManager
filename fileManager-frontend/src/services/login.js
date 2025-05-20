import axios from 'axios'
// const baseUrl = 'http://localhost:5000/login'
const baseUrl = 'http://localhost:5000'

const login = async credentials => {
  const response = await axios.post(`${baseUrl}/login`, credentials)
  return response.data
}

const register = async credentials => {
  const response = await axios.post(`${baseUrl}/register`, credentials)
  return response.data
}

export default { login, register }