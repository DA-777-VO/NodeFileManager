import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import './FileUpload.css'

const FileUpload = () => {
  const [file, setFile] = useState(null)
  const [filesList, setFilesList] = useState([])
  const [fileContent, setFileContent] = useState('')
  const { token } = useSelector(state => state.auth)
  const [selectedFile, setSelectedFile] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true);

  // Получение списка файлов
  useEffect(() => {
    const fetchFiles = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('http://localhost:5000/files', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await response.json()
        if (response.ok) setFilesList(data)
      } catch (error) {
        console.error('Fetch files error:', error)
      } finally {
        setIsLoading(false) // Гарантированно снимаем флаг загрузки
      }
    }

    if (token) fetchFiles()
  }, [token])

  const handleUpload = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })

      const data = await response.json()
      if (response.ok) {
        // setFilesList([...filesList, data.filename])
        setFilesList(prev => [data.file, ...prev])
        setFile(null)
        alert('File uploaded successfully')
      } else {
        alert(data.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
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
    } catch (error) {
      console.error('Download error:', error)
    }
  }

  const handleView = async (filename) => {


    const response = await fetch(`http://localhost:5000/files/${filename}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.ok) {
      const blob = await response.blob()
      const imageUrl = URL.createObjectURL(blob)
      window.open(imageUrl, '_blank')
    }
  }


  // const url = `http://localhost:5000/files/${filename}`
  // window.open(url, '_blank')
  // }


// Форматирование размера
  const formatSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  };

// Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const filteredFiles = filesList
    ? filesList
      .filter(file => {
        const filename = file.filename || ''
        return filename.toLowerCase().includes(searchQuery.toLowerCase())
      })
    : []

  console.log(filesList)

  return (
    <div>
      <h2>File Manager</h2>
      <form onSubmit={handleUpload}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])}/>
        <button type="submit">Upload</button>
      </form>

      <input
        type="text"
        placeholder="Search files..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {isLoading && <div className="loading-status">Loading files...</div>}

      {/* Сообщение если файлов нет */}
      {!isLoading && filteredFiles.length === 0 && (
        <div className="empty-state">No files found matching your search</div>
      )}

      <h3>Your Files:</h3>
      {/*<ul>*/}
      {/*  {filesList.map((file) => (*/}
      {/*    <li key={file}>*/}
      {/*      <span*/}
      {/*        style={{ cursor: 'pointer', color: 'blue' }}*/}
      {/*        onClick={() => handleView(file)}*/}
      {/*      >*/}
      {/*        {file}*/}
      {/*      </span>*/}
      {/*      <button onClick={() => handleDownload(file)}>Download</button>*/}
      {/*    </li>*/}
      {/*  ))}*/}
      {/*</ul>*/}

      {filteredFiles.map(file => (
        <div key={file.filename || 'unknown'} className="file-item">
          <div className="file-header">
            <span onClick={() => handleView(file.filename)}>
             {file.filename || 'Unnamed File'}
            </span>
            <button onClick={() => handleDownload(file.filename)}>Download</button>
          </div>

          {/* Метаданные */}
          <div className="file-meta">
            <span>Size: {formatSize(file.size)}</span>
            <span>Type: {file.type || 'Unknown'}</span>
            <span>
              Uploaded: {new Date(file.upload_date).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default FileUpload