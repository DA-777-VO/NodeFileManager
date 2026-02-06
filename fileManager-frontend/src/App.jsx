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
  const [activeCategory, setActiveCategory] = useState('all') // 'all', 'favorites', 'images', 'documents', 'videos', 'audio'

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
        message: 'Этот тип файла нельзя просмотреть. Нажмите "Download" для загрузки файла.'
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


  const getFileCategory = (file) => {
    if (!file.type) return 'other'

    const type = file.type.split('/')[0]
    const extension = (file.filename || '').split('.').pop().toLowerCase()

    if (type === 'image' || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return 'images'
    } else if (type === 'video' || ['mp4', 'webm', 'mov', 'avi'].includes(extension)) {
      return 'videos'
    } else if (type === 'audio' || ['mp3', 'wav', 'ogg', 'flac'].includes(extension)) {
      return 'audio'
    } else if (type === 'text' || type === 'application' ||
              ['txt', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'json', 'md'].includes(extension)) {
      return 'documents'
    }
    return 'other'
  }


  const filteredFiles = filesListS
    ? filesListS.filter(file => {
      const filename = file.filename || ''

      const matchesSearch = filename.toLowerCase().includes(searchQuery.toLowerCase())


      const matchesFavorite = activeCategory === 'favorites' ? file.favorite : true


      let matchesCategory = true
      if (['images', 'documents', 'videos', 'audio'].includes(activeCategory)) {
        matchesCategory = getFileCategory(file) === activeCategory
      }

      return matchesSearch && matchesFavorite && matchesCategory
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
                {/* Sidebar */}
                <div className="dashboard-sidebar">
                  <div className="sidebar-section">
                    <h3 className="sidebar-title">Locations</h3>
                    <ul className="sidebar-menu">
                      <li
                        className={`sidebar-menu-item ${activeCategory === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('all')}
                      >
                        <span className="sidebar-menu-icon">📁</span>
                        All Files
                      </li>
                      <li
                        className={`sidebar-menu-item ${activeCategory === 'favorites' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('favorites')}
                      >
                        <span className="sidebar-menu-icon">⭐</span>
                        Favorites
                      </li>
                    </ul>
                  </div>

                  <div className="sidebar-section">
                    <h3 className="sidebar-title">Categories</h3>
                    <ul className="sidebar-menu">
                      <li
                        className={`sidebar-menu-item ${activeCategory === 'images' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('images')}
                      >
                        <span className="sidebar-menu-icon">🖼️</span>
                        Images
                      </li>
                      <li
                        className={`sidebar-menu-item ${activeCategory === 'documents' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('documents')}
                      >
                        <span className="sidebar-menu-icon">📄</span>
                        Documents
                      </li>
                      <li
                        className={`sidebar-menu-item ${activeCategory === 'videos' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('videos')}
                      >
                        <span className="sidebar-menu-icon">🎬</span>
                        Videos
                      </li>
                      <li
                        className={`sidebar-menu-item ${activeCategory === 'audio' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('audio')}
                      >
                        <span className="sidebar-menu-icon">🎵</span>
                        Audio
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="dashboard-header">
                  <div className="search-section">
                    <input
                      className="search-input"
                      type="text"
                      placeholder="Search files..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <Logout username={user?.username} onLogout={handleLogout} />
                </div>

                <div className="dashboard-content">
                  <FileUpload
                    onFileChange={(e) => setFile(e.target.files[0])}
                    onUpload={() => handleFileUpload(file)}
                  />

                  <div className="file-controls">
                    <div className="search-section">
                      <h3>
                        {activeCategory === 'all' && 'Your Files'}
                        {activeCategory === 'favorites' && 'Your Favorite Files'}
                        {activeCategory === 'images' && 'Your Images'}
                        {activeCategory === 'documents' && 'Your Documents'}
                        {activeCategory === 'videos' && 'Your Videos'}
                        {activeCategory === 'audio' && 'Your Audio Files'}
                      </h3>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="loading-status">Loading files...</div>
                  ) : (
                    filteredFiles.length > 0 ? (
                      <div className="file-grid">
                        {filteredFiles.map(file => (
                          <File
                            key={file.filename || 'unknown'}
                            file={file}
                            onView={handleFileView}
                            onDownload={handleFileDownload}
                            onDelete={handleFileDelete}
                            onToggleFavorite={handleToggleFavorite}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="no-files-message">
                        {activeCategory === 'favorites'
                          ? 'No favorite files found. Mark some files as favorites!'
                          : activeCategory === 'all'
                            ? 'No files found. Upload some files to get started!'
                            : `No ${activeCategory} found. Upload some ${activeCategory} to get started!`}
                      </div>
                    )
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
