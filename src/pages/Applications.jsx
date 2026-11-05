
import { useState } from 'react'

import { useApplications } from '../context/ApplicationContext'

const emptyForm = {
  company: '',
  role: '',
  location: '',
  type: 'Internship',
  status: 'Applied',
  appliedDate: new Date().toISOString().slice(0, 10),
  deadline: '',
  notes: '',
}

function Applications() {
  const {
    applications,
    loading,
    error,
    addApplication,
    updateApplication,
    deleteApplication,
  } = useApplications()

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const filteredApplications = [...applications]
    .filter(app => {
      const text = `${app.company} ${app.role} ${app.location}`.toLowerCase()

      const matchesSearch = text.includes(search.toLowerCase())
      const matchesFilter = filter === 'All' || app.status === filter
      const matchesType = typeFilter === 'All' || app.type === typeFilter

      return matchesSearch && matchesFilter && matchesType
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.appliedDate || 0) - new Date(a.appliedDate || 0)
      }

      if (sortBy === 'oldest') {
        return new Date(a.appliedDate || 0) - new Date(b.appliedDate || 0)
      }

      if (sortBy === 'deadline') {
        if (!a.deadline) return 1
        if (!b.deadline) return -1

        return new Date(a.deadline) - new Date(b.deadline)
      }

      return 0
    })

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(app) {
    setEditingId(app._id)
    setForm({ ...emptyForm, ...app })
    setModalOpen(true)
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm(previous => ({ ...previous, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.company.trim() || !form.role.trim()) {
      alert('Please enter company name and job role.')
      return
    }

    const { _id, ...applicationData } = form

    try {
      if (editingId) {
        await updateApplication(editingId, {
          ...applicationData,
          company: form.company.trim(),
          role: form.role.trim(),
        })
      } else {
        await addApplication({
          ...applicationData,
          company: form.company.trim(),
          role: form.role.trim(),
        })
      }

      setModalOpen(false)
      setEditingId(null)
      setForm(emptyForm)
    } catch (err) {
      alert(err.message || 'Something went wrong. Please try again.')
    }
  }

  async function handleDelete(id) {
    if (window.confirm('Delete this application?')) {
      try {
        await deleteApplication(id)
      } catch (err) {
        alert(err.message || 'Could not delete application.')
      }
    }
  }

  if (loading) {
    return <div className="applications"><p>Loading applications...</p></div>
  }

  if (error) {
    return <div className="applications"><p>Could not load applications: {error}</p></div>
  }

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">YOUR OPPORTUNITIES</p>
          <h1>Applications</h1>
          <p className="subtitle">Manage every opportunity in one place.</p>
        </div>

        <button className="add-button" onClick={openAdd}>
          + Add Application
        </button>
      </header>

      <section className="applications">
        <div className="toolbar">
          <div className="search-box">
            <span>⌕</span>
            <input
              type="search"
              placeholder="Search company, role or location..."
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={filter}
            onChange={event => setFilter(event.target.value)}
          >
            <option>All</option>
            <option>Wishlist</option>
            <option>Applied</option>
            <option>Interview</option>
            <option>Offer</option>
            <option>Rejected</option>
          </select>

          <select
            className="filter-select"
            value={typeFilter}
            onChange={event => setTypeFilter(event.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Internship">Internship</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
          </select>

          <select
            className="filter-select"
            value={sortBy}
            onChange={event => setSortBy(event.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="deadline">Upcoming Deadline</option>
          </select>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="empty-state">
            <h3>No applications found</h3>
            <p>Try another search or add an application.</p>
          </div>
        ) : (
          filteredApplications.map(app => (
            <article className="application-card" key={app._id}>
              <div className="company-mark">
                {app.company.charAt(0).toUpperCase()}
              </div>

              <div className="application-info">
                <h3>{app.role}</h3>
                <p>
                  {app.company} · {app.location || 'Location not specified'}
                </p>

                <div className="application-meta">
                  <span>{app.type}</span>
                  <span>Applied: {app.appliedDate || 'Not set'}</span>
                  {app.deadline && <span>Deadline: {app.deadline}</span>}
                </div>

                {app.notes && (
                  <p className="application-notes">{app.notes}</p>
                )}
              </div>

              <div className="application-actions">
                <span className={`status-select status-${app.status.toLowerCase()}`}>
                  {app.status}
                </span>

                <div className="action-buttons">
                  <button onClick={() => openEdit(app)}>Edit</button>
                  <button
                    className="delete-action"
                    onClick={() => handleDelete(app._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))
        )}

        <p className="results-count">
          Showing {filteredApplications.length} of {applications.length} applications
        </p>
      </section>

      {modalOpen && (
        <div
          className="modal-overlay"
          onMouseDown={event => {
            if (event.target === event.currentTarget) {
              setModalOpen(false)
            }
          }}
        >
          <div className="modal">
            <div className="modal-heading">
              <div>
                <p className="eyebrow">CAREER TRACKER</p>
                <h2>
                  {editingId ? 'Edit Application' : 'Add Application'}
                </h2>
                <p>Enter your opportunity details below.</p>
              </div>

              <button
                className="close-button"
                onClick={() => setModalOpen(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>
                  Company name *
                  <input
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Job role *
                  <input
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Location
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Type
                  <select name="type" value={form.type} onChange={handleChange}>
                    <option>Internship</option>
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                  </select>
                </label>

                <label>
                  Status
                  <select name="status" value={form.status} onChange={handleChange}>
                    <option>Wishlist</option>
                    <option>Applied</option>
                    <option>Interview</option>
                    <option>Offer</option>
                    <option>Rejected</option>
                  </select>
                </label>

                <label>
                  Applied date
                  <input
                    type="date"
                    name="appliedDate"
                    value={form.appliedDate}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Deadline
                  <input
                    type="date"
                    name="deadline"
                    value={form.deadline}
                    onChange={handleChange}
                  />
                </label>

                <label className="full-width">
                  Notes
                  <textarea
                    name="notes"
                    rows="3"
                    value={form.notes}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="add-button">
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Applications
