import React from 'react'
import './file.css'

const File = ({
  file,
  onView,
  onDownload,
  onDelete,
  onToggleFavorite,
}) => {
  const formatSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatFileType = (mimeType) => {
    if (!mimeType) return 'Unknown'
    const parts = mimeType.split('/')
    return parts[parts.length - 1]
  }

  const getFileIcon = (mimeType) => {
    if (!mimeType) return '📄'

    const type = mimeType.split('/')[0]
    switch (type) {
    case 'image':
      return '🖼️'
    case 'video':
      return '🎬'
    case 'mp4':
      return '🎬'
    case 'audio':
      return '🎵'
    case 'text':
      return '📝'
    case 'application':
      if (mimeType.includes('pdf')) return '📑'
      if (mimeType.includes('json')) return '📊'
      return '📦'
    default:
      return '📄'
    }
  }

  const handleViewFile = async () => {
    if (file && file.filename) {
      await onView(file.filename)
    }
  }

  return (
    <div className="file-item" onClick={handleViewFile}>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleFavorite(file.filename, !file.favorite)
        }}
        className={`favorite-button ${file.favorite ? 'active' : ''}`}
        title={file.favorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        {file.favorite ? '★' : '☆'}
      </button>

      <div className="file-icon">{getFileIcon(file.type)}</div>

      <div className="file-name" title={file.filename}>
        {file.filename || 'Unnamed File'}
      </div>

      <div className="file-meta">
        <span className="meta-item">
          <strong>Size:</strong> {formatSize(file.size)}
        </span>
        <span className="meta-item">
          <strong>Type:</strong> {formatFileType(file.type)}
        </span>
      </div>

      <div className="file-actions">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDownload(file.filename)
          }}
          className="action-button download-button"
          title="Download file"
        >
          Download
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(file.filename)
          }}
          className="action-button delete-button"
          title="Delete file"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default File
