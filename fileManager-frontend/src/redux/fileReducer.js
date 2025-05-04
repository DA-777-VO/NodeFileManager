import { createSlice } from '@reduxjs/toolkit'
import fileService from '../services/files'

const fileSlice = createSlice({
  name: 'file',
  initialState: [],
  reducers: {
    setFiles(state, action) {
      return action.payload
    },
    appendFile(state, action) {
      state.push(action.payload)
    },
    deleteFile(state, action) {
      const filename = action.payload
      return state.filter((file) => file.filename !== filename)
    }
  },
})

export const { setFiles, appendFile, deleteFile } = fileSlice.actions

export const initializeFiles = () => {
  return async (dispatch) => {
    const files = await fileService.getAll()
    dispatch(setFiles(files))
  }
}

export const createFile = (newFile) => {
  return async (dispatch) => {
    const file = await fileService.create(newFile)
    if (file) dispatch(appendFile(file))
  }
}

export const removeFile = (filename) => {
  return async (dispatch) => {
    await fileService.remove(filename)
    dispatch(deleteFile(filename))
  }
}

export default fileSlice.reducer