
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAuth } from '../context/AuthContext'

const API_URL = 'http://localhost:5000/api'

function extractScore(text, patterns) {
  for (const pattern of patterns) {
    const result = text.match(pattern)

    if (result) {
      const score = Number(result[1])
      if (score >= 0 && score <= 100) return score
    }
  }

  return null
}

function ScoreCard({ label, score }) {
  if (score === null) return null

  return (
    <div className="ai-score-card">
      <div
        className="ai-score-ring"
        style={{ '--score': `${score}%` }}
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label={`${label}: ${score} out of 100`}
      >
        <span>{score}</span>
      </div>
      <div>
        <h3>{label}</h3>
        <p>Out of 100</p>
      </div>
    </div>
  )
}

function AIResult({ title, content, type }) {
  const overallScore = extractScore(content, [
    /overall(?:\s+resume)?\s+score[^0-9]{0,30}(\d{1,3})\s*(?:\/\s*100|%)/i,
    /resume\s+score[^0-9]{0,30}(\d{1,3})\s*(?:\/\s*100|%)/i,
  ])

  const atsScore = extractScore(content, [
    /ATS(?:\s+compatibility)?(?:\s+score)?[^0-9]{0,30}(\d{1,3})\s*(?:\/\s*100|%)/i,
  ])

  const matchScore = extractScore(content, [
    /(?:job\s+)?match\s+score[^0-9]{0,30}(\d{1,3})\s*(?:\/\s*100|%)/i,
  ])

  return (
    <div className="ai-result-card">
      <div className="ai-result-heading">
        <div>
          <span className="ai-result-label">AI REPORT</span>
          <h2>{title}</h2>
        </div>
        <span className="ai-result-icon">✦</span>
      </div>

      {type === 'analysis' && (
        <div className="ai-score-grid">
          <ScoreCard label="Overall Resume Score" score={overallScore} />
          <ScoreCard label="ATS Compatibility" score={atsScore} />
        </div>
      )}

      {type === 'match' && matchScore !== null && (
        <div className="ai-score-grid">
          <ScoreCard label="Job Match Score" score={matchScore} />
        </div>
      )}

      <div className="ai-markdown">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}

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

      <section className="applications ai-page">

        <div className="resume-upload-card ai-resume-selector">
          <div>
            <span className="ai-section-label">YOUR DOCUMENT</span>
            <h2>Select Your Resume</h2>
            <p>Choose an uploaded PDF resume to use with the AI tools.</p>
          </div>

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
          <div className="ai-alert ai-alert-error" role="alert">
            {error}
          </div>
        )}

        {message && (
          <div className="ai-alert ai-alert-success" role="status">
            ✓ {message}
          </div>
        )}

        <div className="ai-tools-grid">
          <div className="resume-upload-card ai-tool-card">
            <span className="ai-tool-icon">✦</span>
            <span className="ai-section-label">RESUME REVIEW</span>
            <h2>AI Resume Analyzer</h2>
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

          <div className="resume-upload-card ai-tool-card">
            <span className="ai-tool-icon">⌕</span>
            <span className="ai-section-label">JOB COMPATIBILITY</span>
            <h2>AI Job Matcher</h2>
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
        </div>

        {analysis && (
          <AIResult
            title="Resume Analysis Results"
            content={analysis}
            type="analysis"
          />
        )}

        {match && (
          <AIResult
            title="Job Matching Results"
            content={match}
            type="match"
          />
        )}

      </section>
    </>
  )
}

export default AI
