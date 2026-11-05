
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

const API_URL = 'http://localhost:5000/api'

function AI() {
  const { token } = useAuth()

  const [resumes, setResumes] = useState([])
  const [selectedResume, setSelectedResume] = useState('')
  const [jobDescription, setJobDescription] = useState('')

  const [loadingResumes, setLoadingResumes] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [matching, setMatching] = useState(false)

  const [analysis, setAnalysis] = useState('')
  const [match, setMatch] = useState('')

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Fetch uploaded resumes
  useEffect(() => {
    async function fetchResumes() {
      try {
        const response = await fetch(`${API_URL}/resumes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Could not fetch resumes.')
        }

        setResumes(data)

        if (data.length > 0) {
          setSelectedResume(data[0].id)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoadingResumes(false)
      }
    }

    if (token) {
      fetchResumes()
    }
  }, [token])

  // Analyze resume
  async function handleAnalyze() {
    if (!selectedResume) {
      setError('Please upload and select a resume first.')
      return
    }

    try {
      setAnalyzing(true)
      setError('')
      setMessage('')
      setAnalysis('')
      setMatch('')

      const response = await fetch(`${API_URL}/ai/analyze-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resumeId: selectedResume,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Resume analysis failed.')
      }

      setAnalysis(data.analysis)
      setMessage('Resume analysis completed successfully!')
    } catch (err) {
      setError(err.message)
    } finally {
      setAnalyzing(false)
    }
  }

  // Match resume with job description
  async function handleMatch() {
    if (!selectedResume) {
      setError('Please select a resume first.')
      return
    }

    if (!jobDescription.trim()) {
      setError('Please enter a job description.')
      return
    }

    try {
      setMatching(true)
      setError('')
      setMessage('')
      setAnalysis('')
      setMatch('')

      const response = await fetch(`${API_URL}/ai/match-job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resumeId: selectedResume,
          jobDescription,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Job matching failed.')
      }

      setMatch(data.match)
      setMessage('Job matching completed successfully!')
    } catch (err) {
      setError(err.message)
    } finally {
      setMatching(false)
    }
  }

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AI-POWERED CAREER TOOLS</p>
          <h1>AI Career Assistant</h1>
          <p className="subtitle">
            Understand your resume and discover how well you match your dream job.
          </p>
        </div>
      </header>

      <section className="applications">

        {/* Resume Selection */}
        <div className="resume-upload-card">
          <h2>Select Your Resume</h2>

          <p>
            Choose an uploaded PDF resume to use with the AI tools.
          </p>

          {loadingResumes ? (
            <p>Loading your resumes...</p>
          ) : resumes.length === 0 ? (
            <div className="empty-state">
              <h3>No resumes found</h3>
              <p>
                Please upload a resume from the My Resumes page first.
              </p>
            </div>
          ) : (
            <select
              value={selectedResume}
              onChange={event => setSelectedResume(event.target.value)}
            >
              {resumes.map(resume => (
                <option key={resume.id} value={resume.id}>
                  {resume.filename}
                </option>
              ))}
            </select>
          )}
        </div>

        {error && (
          <p className="auth-error">{error}</p>
        )}

        {message && (
          <p>{message}</p>
        )}

        {/* AI Resume Analyzer */}
        <div className="resume-upload-card">
          <h2>✦ AI Resume Analyzer</h2>

          <p>
            Get an AI-powered review of your resume, including strengths,
            weaknesses, ATS compatibility and improvement suggestions.
          </p>

          <button
            className="add-button"
            onClick={handleAnalyze}
            disabled={
              analyzing ||
              matching ||
              loadingResumes ||
              resumes.length === 0
            }
          >
            {analyzing ? 'Analyzing Resume...' : 'Analyze My Resume'}
          </button>
        </div>

        {/* AI Job Matcher */}
        <div className="resume-upload-card">
          <h2>✦ AI Job Matcher</h2>

          <p>
            Paste a job description to discover how closely your resume
            matches the role.
          </p>

          <textarea
            rows="8"
            value={jobDescription}
            onChange={event => setJobDescription(event.target.value)}
            placeholder="Paste the complete job description here..."
          />

          <button
            className="add-button"
            onClick={handleMatch}
            disabled={
              matching ||
              analyzing ||
              loadingResumes ||
              resumes.length === 0 ||
              !jobDescription.trim()
            }
          >
            {matching ? 'Finding Your Match...' : 'Match My Resume'}
          </button>
        </div>

        {/* Resume Analysis Result */}
        {analysis && (
          <div className="resume-upload-card">
            <h2>Resume Analysis Results</h2>

            <div className="ai-result">
              <pre>{analysis}</pre>
            </div>
          </div>
        )}

        {/* Job Matching Result */}
        {match && (
          <div className="resume-upload-card">
            <h2>Job Matching Results</h2>

            <div className="ai-result">
              <pre>{match}</pre>
            </div>
          </div>
        )}

      </section>
    </>
  )
}

export default AI
