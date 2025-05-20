import React, { useState } from 'react'
import './fileupload.css'

const FileUpload = ({
  onFileChange,
  onUpload,
}) => {
  const [fileName, setFileName] = useState('')

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFileName(e.target.files[0].name)
    } else {
      setFileName('')
    }
    onFileChange(e)
  }

  return (
    <div className="upload-container">
      <h2>Upload File</h2>
      <form className="upload-form" onSubmit={(e) => { e.preventDefault(); onUpload() }}>
        <div className="file-input-wrapper">
          <label htmlFor="file-input" className="file-input-label">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {fileName ? 'Change file' : 'Choose a file or drag it here'}
            </span>
          </label>
          <input
            id="file-input"
            className="file-input"
            type="file"
            onChange={handleFileChange}
          />

          {fileName && (
            <div className="file-name-display">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              {fileName}
            </div>
          )}
        </div>

        <button type="submit" className="upload-button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload File
        </button>
      </form>
    </div>
  )
}

export default FileUpload
