import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import './FileUpload.css'
import { createFile, initializeFiles, removeFile } from '../redux/fileReducer'
import fileService from '../services/files'
import { showNotification } from '../redux/notificationReducer.js'
import { navigate } from 'jsdom/lib/jsdom/living/window/navigation.js'
import { logoutU } from '../redux/userReducer.js'

const FileUpload = () => {
  const [file, setFile] = useState(null)
  const filesListS = useSelector(state => state.file)
  const [fileContent, setFileContent] = useState('')
  const { token } = useSelector(state => state.user)
  const user  = useSelector(state => state.user.username)
  const [selectedFile, setSelectedFile] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)


  const dispatch = useDispatch()

  // get file list
  useEffect(() => {
    if(token) {
      fileService.setToken(token)
      dispatch(initializeFiles())
      setIsLoading(false)
    }
  }, [token, dispatch ])



  console.log(user)
  console.log(useSelector(state => state.file))


  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) {
      dispatch(showNotification({ type: 'error', message: 'Please select a file to upload' }, 5))
      return
    }
    console.log('File!!!!!!!!!!!: ', file)

    const formData = new FormData()
    formData.append('file', file)

    console.log('formData: ', formData)

    try {
      await dispatch(createFile(formData))
      setFile(null)
      dispatch(initializeFiles())
      dispatch(showNotification({ type: 'success', message: 'File uploaded successfully' }, 5))
    } catch (error) {
      console.error('Upload error:', error)
      if (error.response && error.response.data && error.response.data.error === 'File already exists') {
        dispatch(showNotification({
          type: 'error',
          message: 'A file with this name already exists on the server.'
        }, 5))
      } else {
        dispatch(showNotification({ type: 'error', message: 'Failed to upload file. Please try again.' }, 5))
      }
    }
  }

  const handleDownload = async (filename) => {
    try {
      const response = await fetch(`http://localhost:5000/files/${filename}?download=true`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      dispatch(showNotification({ type: 'success', message: 'File downloaded successfully' }, 3))
    } catch (error) {
      console.error('Download error:', error)
      dispatch(showNotification({ type: 'error', message: 'Failed to download file' }, 5))
    }
  }


  const [selectedImage, setSelectedImage] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFileType, setSelectedFileType] = useState(null)
  const [textContent, setTextContent] = useState('')

  const handleView = async (filename) => {
    const fileExtension = filename.split('.').pop().toLowerCase()

    const allowedExtensions = {
      'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image', 'bmp': 'image', 'webp': 'image',
      'mp4': 'video', 'webm': 'video', 'mov': 'video',
      'txt': 'text', 'json': 'text',
    }

    if (allowedExtensions[fileExtension]) {
      try {
        const response = await fileService.getFile(filename)

        if (response.status >= 200 && response.status < 300) {
          const fileType = allowedExtensions[fileExtension]

          if (fileType === 'text') {
            // For text files, read the content as text
            const reader = new FileReader()
            reader.onload = (e) => {
              let content = e.target.result

              // Format JSON if the file is JSON
              if (fileExtension === 'json') {
                try {
                  const jsonObj = JSON.parse(content)
                  content = JSON.stringify(jsonObj, null, 2) // Pretty print with 2 spaces
                } catch (err) {
                  console.error('Error parsing JSON:', err)
                }
              }

              setTextContent(content)
              setSelectedFileType(fileType)
              setIsModalOpen(true)
            }
            reader.readAsText(response.data)
          } else {
            // For images and videos, create a blob URL
            const fileUrl = URL.createObjectURL(response.data)
            setSelectedImage(fileUrl)
            setSelectedFileType(fileType)
            setIsModalOpen(true)
          }
        } else {
          dispatch(showNotification({
            type: 'error',
            message: 'Failed to load file'
          }, 5))
        }
      } catch (error) {
        dispatch(showNotification({
          type: 'error',
          message: 'Error loading file'
        }, 5))
      }
    } else {
      dispatch(showNotification({
        type: 'info',
        message: 'Этот тип файла нельзя просмотреть. Нажмите "Скачать" для загрузки файла.'
      }, 5))
    }
  }


  // Форматирование размера
  const formatSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }


  const filteredFiles = filesListS
    ? filesListS
      .filter(file => {
        const filename = file.filename || ''
        return filename.toLowerCase().includes(searchQuery.toLowerCase())
      })
    : []

  console.log('filteredFiles: ', filteredFiles)

  const handleLogout = (event) => {
    event.preventDefault()
    dispatch(logoutU())
    navigate('/login')
  }

  const handleDelete = async (filename) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return

    try {
      await dispatch(removeFile(filename))
      dispatch(showNotification({ type: 'success', message: 'File deleted successfully' }, 5))
    } catch (error) {
      console.error('Delete error:', error)
      dispatch(showNotification({ type: 'error', message: 'Failed to delete file. Please try again.' }, 5))
    }
  }

  const formatFileType = (mimeType) => {
    if (!mimeType) return 'Unknown'
    const parts = mimeType.split('/')
    return parts[parts.length - 1]
  }

  console.log(useSelector(state => state))

  if (isLoading) {
    return <div className="loading-status">Loading files...</div> // Отображаем спиннер, пока isLoading true
  }


  return (
    <div>
      <h2>File Manager</h2>

      <p>{user} logged-in <button onClick={handleLogout}>logout</button></p>

      <form onSubmit={handleUpload}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])}/>
        <button type="submit">Upload</button>
      </form>


      <h3>Search</h3>
      <input
        type="text"
        placeholder="Search files..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <h3>Your Files:</h3>

      {filteredFiles.map(file => (
        <div key={file.filename || 'unknown'} className="file-item">
          <div className="file-header">
            <span onClick={() => handleView(file.filename)}>
              {file.filename || 'Unnamed File'}
            </span>
            <button onClick={() => handleDownload(file.filename)}>Download</button>
            <button
              onClick={() => handleDelete(file.filename)} className="delete-button">
              Delete
            </button>
          </div>

          <div className="file-meta">
            <span>Size: {formatSize(file.size)}</span>
            <span>Type: {formatFileType(file.type) || 'Unknown'}</span>
            <span>
              Uploaded: {new Date(file.upload_date).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}


      {isModalOpen && (
        <div className="image-modal">
          <div className="modal-content">
            <span className="close" onClick={() => {
              if (selectedFileType === 'image' || selectedFileType === 'video') {
                URL.revokeObjectURL(selectedImage)
              }
              setSelectedImage(null)
              setTextContent('')
              setSelectedFileType(null)
              setIsModalOpen(false)
            }}>×</span>

            {selectedFileType === 'image' && (
              <img src={selectedImage} alt="Preview" />
            )}

            {selectedFileType === 'video' && (
              <video
                src={selectedImage}
                controls
                autoPlay
                className="video-preview"
              />
            )}

            {selectedFileType === 'text' && (
              <pre className="text-preview">
                {textContent}
              </pre>
            )}
          </div>
        </div>
      )}


    </div>
  )
}

export default FileUpload