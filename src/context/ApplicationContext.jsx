
import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'

const ApplicationContext = createContext(null)

const API_URL = 'http://localhost:5000/api/applications'

export function ApplicationProvider({ children }) {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { token } = useAuth()

  // Get JWT token from AuthContext
  function getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  }

  // Fetch applications
  useEffect(() => {
    async function fetchApplications() {
      if (!token) {
        setApplications([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(API_URL, {
          headers: getAuthHeaders(),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch applications')
        }

        const data = await response.json()
        setApplications(data)
      } catch (err) {
        setError(err.message)
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [token])

  // Add application
  async function addApplication(application) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(application),
      })

      if (!response.ok) {
        throw new Error('Failed to add application')
      }

      const savedApplication = await response.json()

      setApplications(previous => [
        savedApplication,
        ...previous,
      ])
    } catch (err) {
      console.error('Add error:', err)
      throw err
    }
  }

  // Update application
  async function updateApplication(id, updatedData) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedData),
      })

      if (!response.ok) {
        throw new Error('Failed to update application')
      }

      const updatedApplication = await response.json()

      setApplications(previous =>
        previous.map(app =>
          app._id === id ? updatedApplication : app
        )
      )
    } catch (err) {
      console.error('Update error:', err)
      throw err
    }
  }

  // Delete application
  async function deleteApplication(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error('Failed to delete application')
      }

      setApplications(previous =>
        previous.filter(app => app._id !== id)
      )
    } catch (err) {
      console.error('Delete error:', err)
      throw err
    }
  }

  // Update application status
  async function updateStatus(id, status) {
    const application = applications.find(app => app._id === id)

    if (!application) return

    await updateApplication(id, {
      ...application,
      status,
    })
  }

  return (
    <ApplicationContext.Provider
      value={{
        applications,
        loading,
        error,
        addApplication,
        updateApplication,
        deleteApplication,
        updateStatus,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  )
}

export function useApplications() {
  const context = useContext(ApplicationContext)

  if (!context) {
    throw new Error(
      'useApplications must be used inside ApplicationProvider'
    )
  }

  return context
}
