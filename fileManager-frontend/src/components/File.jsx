import React from 'react'
import './FileUpload.css' // Reusing existing styles

const File = ({
  file,
  onView,
  onDownload,
  onDelete
}) => {
  // Helper functions
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

  // Get file icon based on type
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

  // Handle view file
  const handleViewFile = async () => {
    if (file && file.filename) {
      await onView(file.filename)
    }
  }

  return (
    <div className="file-item">
      <div className="file-header">
        <span className="file-icon">{getFileIcon(file.type)}</span>
        <span
          className="file-name"
          onClick={handleViewFile}
          title="Click to view file"
        >
          {file.filename || 'Unnamed File'}
        </span>
        <div className="file-actions">
          <button
            onClick={() => onDownload(file.filename)}
            className="action-button download-button"
            title="Download file"
          >
            Download
          </button>
          <button
            onClick={() => onDelete(file.filename)}
            className="action-button delete-button"
            title="Delete file"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="file-meta">
        <span className="meta-item">
          <strong>Size:</strong> {formatSize(file.size)}
        </span>
        <span className="meta-item">
          <strong>Type:</strong> {formatFileType(file.type) || 'Unknown'}
        </span>
        <span className="meta-item">
          <strong>Uploaded:</strong> {new Date(file.upload_date).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}

export default File