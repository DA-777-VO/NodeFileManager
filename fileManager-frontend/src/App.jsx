import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Auth from './components/Auth.jsx'
import FileUpload from './components/FileUpload.jsx'
import File from './components/File.jsx'
import PrivateRoute from './components/PrivateRoute.jsx'
import Notification from './components/Notification'
import { useDispatch, useSelector } from 'react-redux'
import { initializeUser, loginU, logoutU } from './redux/userReducer'
import { createFile, initializeFiles, removeFile } from './redux/fileReducer'
import { showNotification } from './redux/notificationReducer'
import fileService from './services/files'
import loginService from './services/login'
import Logout from './components/Logout.jsx'

function App() {
  const dispatch = useDispatch()
  const user = useSelector(state => state.user)
  const filesListS = useSelector(state => state.file)
  const [file, setFile] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFileType, setSelectedFileType] = useState(null)
  const [textContent, setTextContent] = useState('')

  // Initialize user on app load
  useEffect(() => {
    dispatch(initializeUser())
  }, [dispatch])

  // Initialize files when user is authenticated
  useEffect(() => {
    if(user && user.token) {
      fileService.setToken(user.token)
      dispatch(initializeFiles())
      setIsLoading(false)
    }
  }, [user, dispatch])

  console.log('user: ', user)

  // Authentication handlers
  const handleLogin = async (username, password) => {
    const success = await dispatch(loginU(username, password))
    return success
  }

  const handleRegister = async (username, password) => {
    try {
      const response = await loginService.register({ username, password })

      if (response.ok) {
        dispatch(showNotification({ type: 'success', message: 'Registration successful! You can now log in.' }, 5))
        return true
      } else {
        dispatch(showNotification({ type: 'error', message: response.error || 'Registration failed' }, 5))
        return false
      }
    } catch (error) {
      console.error('Registration error:', error)
      dispatch(showNotification({ type: 'error', message: 'Registration failed. Please try again.' }, 5))
      return false
    }
  }

  const handleLogout = () => {
    dispatch(logoutU())
  }

  // File management handlers
  const handleFileUpload = async (fileToUpload) => {
    if (!fileToUpload) {
      dispatch(showNotification({ type: 'error', message: 'Please select a file to upload' }, 5))
      return false
    }

    const formData = new FormData()
    formData.append('file', fileToUpload)

    try {
      await dispatch(createFile(formData))
      dispatch(initializeFiles())
      dispatch(showNotification({ type: 'success', message: 'File uploaded successfully' }, 5))
      return true
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
      return false
    }
  }

  const handleFileDownload = async (filename) => {
    try {
      const response = await fetch(`http://localhost:5000/files/${filename}?download=true`, {
        headers: { Authorization: `Bearer ${user.token}` }
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
      return true
    } catch (error) {
      console.error('Download error:', error)
      dispatch(showNotification({ type: 'error', message: 'Failed to download file' }, 5))
      return false
    }
  }

  const handleFileDelete = async (filename) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return false

    try {
      await dispatch(removeFile(filename))
      dispatch(showNotification({ type: 'success', message: 'File deleted successfully' }, 5))
      return true
    } catch (error) {
      console.error('Delete error:', error)
      dispatch(showNotification({ type: 'error', message: 'Failed to delete file. Please try again.' }, 5))
      return false
    }
  }

  const handleFileView = async (filename) => {
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
            const url = URL.createObjectURL(response.data)
            setSelectedImage(url)
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

  // Filter files based on search query
  const filteredFiles = filesListS
    ? filesListS.filter(file => {
      const filename = file.filename || ''
      return filename.toLowerCase().includes(searchQuery.toLowerCase())
    })
    : []

  return (
    <div>
      <Notification />

      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={
            <Auth
              isLogin={true}
              onSubmit={handleLogin}
            />
          } />

          <Route path="/register" element={
            <Auth
              isLogin={false}
              onSubmit={handleRegister}
            />
          } />

          <Route path="/dashboard" element={
            <PrivateRoute>
              <div className="dashboard-container">
                <Logout username={user?.username} onLogout={handleLogout} />
                <FileUpload
                  onFileChange={(e) => setFile(e.target.files[0])}
                  onUpload={() => handleFileUpload(file)}
                />

                {/* File List and Search Section */}
                <div className="file-list-container">
                  <h3>Search</h3>
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />

                  <h3>Your Files:</h3>

                  {isLoading ? (
                    <div className="loading-status">Loading files...</div>
                  ) : (
                    filteredFiles.map(file => (
                      <File
                        key={file.filename || 'unknown'}
                        file={file}
                        onView={handleFileView}
                        onDownload={handleFileDownload}
                        onDelete={handleFileDelete}
                      />
                    ))
                  )}
                </div>

                {/* Modal Window */}
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
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </div>
  )
}

export default App