import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Auth from './components/Auth.jsx'
import FileUpload from './components/FileUpload.jsx'
import File from './components/File.jsx'
import PrivateRoute from './components/PrivateRoute.jsx'
import Notification from './components/Notification'
import { useDispatch, useSelector } from 'react-redux'
import { initializeUser, loginU, logoutU } from './redux/userReducer'
import { createFile, initializeFiles, removeFile, setFiles } from './redux/fileReducer'
import { setNotification, showNotification } from './redux/notificationReducer'
import fileService from './services/files'
import loginService from './services/login'
import Logout from './components/Logout.jsx'
import './app.css'

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
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  useEffect(() => {
    dispatch(initializeUser())
  }, [dispatch])

  useEffect(() => {
    if(user && user.token) {
      fileService.setToken(user.token)
      dispatch(initializeFiles())
      setIsLoading(false)
    }
  }, [user, dispatch])


  console.log('user: ', user)

  const handleLogin = async (username, password) => {
    const success = await dispatch(loginU(username, password))
    return success
  }

  const handleRegister = async (username, password) => {
    try {
      const response = await loginService.register({ username, password })

      console.log('response: ', response)

      if (response.id) {
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
            const reader = new FileReader()
            reader.onload = (e) => {
              let content = e.target.result

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


  const handleToggleFavorite = async (filename, favorite) => {
    try {
      await fileService.toggleFavorite(filename, favorite)
      const updatedFiles = filesListS.map(file =>
        file.filename === filename
          ? { ...file, favorite }
          : file
      )
      dispatch(setFiles(updatedFiles))
    } catch (error) {
      console.error('Error toggling favorite:', error)
      dispatch(setNotification('Error updating favorite status', 'error'))
    }
  }

  const filteredFiles = filesListS
    ? filesListS.filter(file => {
      const filename = file.filename || ''
      const matchesSearch = filename.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFavorite = showFavoritesOnly ? file.favorite : true
      return matchesSearch && matchesFavorite
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

                <div className="file-list-container">
                  <div className="file-controls">
                    <div className="search-section">
                      <h3>Search</h3>
                      <input
                        type="text"
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <div className="favorites-toggle">
                      <button
                        className={`toggle-button ${showFavoritesOnly ? 'active' : ''}`}
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                      >
                        {showFavoritesOnly ? 'Show All Files' : 'Show Favorites Only'}
                      </button>
                    </div>
                  </div>

                  <h3>{showFavoritesOnly ? 'Your Favorite Files:' : 'Your Files:'}</h3>

                  {isLoading ? (
                    <div className="loading-status">Loading files...</div>
                  ) : (
                    filteredFiles.length > 0 ? (
                      filteredFiles.map(file => (
                        <File
                          key={file.filename || 'unknown'}
                          file={file}
                          onView={handleFileView}
                          onDownload={handleFileDownload}
                          onDelete={handleFileDelete}
                          onToggleFavorite={handleToggleFavorite}
                        />
                      ))
                    ) : (
                      <div className="no-files-message">
                        {showFavoritesOnly
                          ? 'No favorite files found. Mark some files as favorites!'
                          : 'No files found.'}
                      </div>
                    )
                  )}
                </div>

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