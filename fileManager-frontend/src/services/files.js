import axios from 'axios'
const baseUrl = 'http://localhost:5000'

let token = null
let config

const setToken = newToken => {
  token = `Bearer ${newToken}`

  config = {
    headers: { Authorization: token },
  }

}

const getAll = async () => {
  const response = await axios.get(`${baseUrl}/files`, config)
  return response.data
}

const create = async newObject => {
  const response = await axios.post(`${baseUrl}/upload`, newObject, config)
  return response.data
}

const update = async objectToUpdate => {
  const response = await axios.put(`${baseUrl}/${objectToUpdate.id}`, objectToUpdate, config)
  return response.data
}

const remove = async filename => {
  const response = await axios.delete(`${baseUrl}/files/${filename}`, config)
  return response.data
}

const getFile = async filename => {
  return await axios.get(`${baseUrl}/files/${filename}`, {
    ...config,
    responseType: 'blob' // Важно: указываем тип ответа как blob
  })
}

const downloadFile = async (filename) => {
  return await axios.get(`${baseUrl}/files/${filename}?download=true`, {
    ...config,
    responseType: 'blob'
  })
}

export default { getAll, create, setToken, update, remove, getFile, downloadFile }