import React from 'react'
import './FileUpload.css'

const FileUpload = ({
  onFileChange,
  onUpload,
}) => {
  return (
    <div className="upload-container">
      <h2>File Upload</h2>
      <form onSubmit={(e) => { e.preventDefault(); onUpload(); }}>
        <input type="file" onChange={onFileChange} />
        <button type="submit">Upload</button>
      </form>
    </div>
  )
}

export default FileUpload