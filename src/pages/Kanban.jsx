
import { useState } from 'react'
import { useApplications } from '../context/ApplicationContext'

const columns = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected']

function Kanban() {
  const { applications, updateStatus, loading, error } = useApplications()
  const [updatingId, setUpdatingId] = useState(null)
  const [updateError, setUpdateError] = useState('')

  async function handleStatusChange(id, newStatus) {
    try {
      setUpdatingId(id)
      setUpdateError('')

      await updateStatus(id, newStatus)
    } catch (err) {
      setUpdateError('Unable to update status. Please try again.')
      console.error('Status update error:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">VISUAL APPLICATION TRACKER</p>
          <h1>Kanban Board</h1>
          <p className="subtitle">See where every opportunity stands.</p>
        </div>
      </header>

      {loading ? (
        <section className="empty-state">
          <p>Loading your applications...</p>
        </section>
      ) : error ? (
        <section className="empty-state">
          <h3>Unable to load applications</h3>
          <p>{error}</p>
        </section>
      ) : (
        <>
          {updateError && (
            <p role="alert">{updateError}</p>
          )}

          <section className="kanban-board">
            {columns.map(status => {
              const items = applications.filter(app => app.status === status)

              return (
                <div className="kanban-column" key={status}>
                  <div className="kanban-column-heading">
                    <h3>{status}</h3>
                    <span>{items.length}</span>
                  </div>

                  {items.length === 0 && (
                    <p className="kanban-empty">No applications here</p>
                  )}

                  {items.map(app => (
                    <article className="kanban-card" key={app._id}>
                      <div className="company-mark">
                        {app.company.charAt(0).toUpperCase()}
                      </div>

                      <h4>{app.role}</h4>
                      <p>{app.company}</p>

                      <div className="kanban-card-footer">
                        <span>{app.type}</span>

                        <select
                          value={app.status}
                          disabled={updatingId === app._id}
                          onChange={event =>
                            handleStatusChange(app._id, event.target.value)
                          }
                          aria-label={`Change status for ${app.company}`}
                        >
                          {columns.map(column => (
                            <option key={column} value={column}>
                              {column}
                            </option>
                          ))}
                        </select>
                      </div>
                    </article>
                  ))}
                </div>
              )
            })}
          </section>
        </>
      )}
    </>
  )
}

export default Kanban
