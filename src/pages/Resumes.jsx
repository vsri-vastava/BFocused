
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

const API_URL = 'http://localhost:5000/api/resumes'

function Resumes() {
  const { token } = useAuth()

  const [resumes, setResumes] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Fetch uploaded resumes
  async function fetchResumes() {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not fetch resumes.')
      }

      setResumes(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchResumes()
    }
  }, [token])

  // Select PDF file
  function handleFileChange(event) {
    const file = event.target.files[0]

    setError('')
    setMessage('')

    if (!file) {
      setSelectedFile(null)
      return
    }

    if (file.type !== 'application/pdf' ||
        !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are allowed.')
      setSelectedFile(null)
      event.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5 MB.')
      setSelectedFile(null)
      event.target.value = ''
      return
    }

    setSelectedFile(file)
  }

  // Upload resume
  async function handleUpload(event) {
    event.preventDefault()

    if (!selectedFile) {
      setError('Please select a PDF resume first.')
      return
    }

    const formData = new FormData()
    formData.append('resume', selectedFile)

    try {
      setUploading(true)
      setError('')
      setMessage('')

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Resume upload failed.')
      }

      setMessage('Resume uploaded successfully!')
      setSelectedFile(null)

      event.target.reset()

      await fetchResumes()
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  // Download resume
  async function handleDownload(resume) {
    try {
      setError('')
      setMessage('')

      const response = await fetch(
        `${API_URL}/${resume.id}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Download failed.')
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = resume.filename

      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      setError(err.message)
    }
  }

  // Delete resume
  async function handleDelete(resumeId) {
    if (!window.confirm('Are you sure you want to delete this resume?')) {
      return
    }

    try {
      setError('')
      setMessage('')

      const response = await fetch(`${API_URL}/${resumeId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not delete resume.')
      }

      setResumes(previous =>
        previous.filter(resume => resume.id !== resumeId)
      )

      setMessage('Resume deleted successfully!')
    } catch (err) {
      setError(err.message)
    }
  }

  // Format file size
  function formatFileSize(bytes) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">CAREER RESOURCES</p>
          <h1>My Resumes</h1>
          <p className="subtitle">
            Manage your resumes and keep your career documents organized.
          </p>
        </div>
      </header>

      <section className="applications">

        <div className="resume-upload-card">
          <h2>Upload a Resume</h2>

          <p>
            Upload your resume in PDF format. Maximum file size: 5 MB.
          </p>

          <form onSubmit={handleUpload}>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
            />

            {selectedFile && (
              <p>
                Selected file: <strong>{selectedFile.name}</strong>
              </p>
            )}

            <button
              type="submit"
              className="add-button"
              disabled={uploading || !selectedFile}
            >
              {uploading ? 'Uploading...' : 'Upload Resume'}
            </button>
          </form>
        </div>

        {error && (
          <p className="auth-error">{error}</p>
        )}

        {message && (
          <p>{message}</p>
        )}

        <div className="resume-list">
          <h2>Uploaded Resumes ({resumes.length})</h2>

          {loading ? (
            <p>Loading resumes...</p>
          ) : resumes.length === 0 ? (
            <div className="empty-state">
              <h3>No resumes uploaded yet</h3>
              <p>Upload your first PDF resume to get started.</p>
            </div>
          ) : (
            resumes.map(resume => (
              <article
                className="application-card"
                key={resume.id}
              >
                <div className="company-mark">
                  PDF
                </div>

                <div className="application-info">
                  <h3>{resume.filename}</h3>

                  <p>
                    File size: {formatFileSize(resume.size)}
                  </p>

                  <div className="application-meta">
                    <span>
                      Uploaded: {
                        new Date(resume.uploadedAt).toLocaleDateString()
                      }
                    </span>
                  </div>
                </div>

                <div className="application-actions">
                  <div className="action-buttons">
                    <button
                      onClick={() => handleDownload(resume)}
                    >
                      Download
                    </button>

                    <button
                      className="delete-action"
                      onClick={() => handleDelete(resume.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

      </section>
    </>
  )
}

export default Resumes
