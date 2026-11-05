
import { useApplications } from '../context/ApplicationContext'

function Analytics() {
  const { applications, loading, error } = useApplications()

  const total = applications.length

  const statuses = [
    { name: 'Wishlist', color: '#8a83aa' },
    { name: 'Applied', color: '#c9ae70' },
    { name: 'Interview', color: '#729b7b' },
    { name: 'Offer', color: '#315646' },
    { name: 'Rejected', color: '#d68f81' },
  ]

  const interviews = applications.filter(app => app.status === 'Interview').length
  const offers = applications.filter(app => app.status === 'Offer').length
  const rejected = applications.filter(app => app.status === 'Rejected').length

  const percentage = value => total ? Math.round(value / total * 100) : 0

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">YOUR JOB SEARCH INSIGHTS</p>
          <h1>Analytics</h1>
          <p className="subtitle">Understand your application progress.</p>
        </div>
      </header>

      {loading ? (
        <section className="empty-state">
          <p>Loading your analytics...</p>
        </section>
      ) : error ? (
        <section className="empty-state">
          <h3>Unable to load analytics</h3>
          <p>{error}</p>
        </section>
      ) : (
        <>
          <section className="stats">
            <div className="stat-card">
              <div className="stat-top"><span>Total Applications</span></div>
              <h2>{total}</h2>
              <p>All tracked opportunities</p>
            </div>

            <div className="stat-card">
              <div className="stat-top"><span>Interviews</span></div>
              <h2>{interviews}</h2>
              <p>{percentage(interviews)}% of applications</p>
            </div>

            <div className="stat-card">
              <div className="stat-top"><span>Offers</span></div>
              <h2>{offers}</h2>
              <p>{percentage(offers)}% of applications</p>
            </div>

            <div className="stat-card">
              <div className="stat-top"><span>Rejected</span></div>
              <h2>{rejected}</h2>
              <p>{percentage(rejected)}% of applications</p>
            </div>
          </section>

          <section className="progress-section">
            <div className="progress-heading">
              <div>
                <p className="eyebrow">APPLICATION BREAKDOWN</p>
                <h2>Applications by status</h2>
              </div>
              <span>{total} total</span>
            </div>

            {statuses.map(status => {
              const count = applications.filter(
                app => app.status === status.name
              ).length

              return (
                <div className="analytics-row" key={status.name}>
                  <div className="analytics-label">
                    <span>{status.name}</span>
                    <strong>{count} · {percentage(count)}%</strong>
                  </div>

                  <div className="analytics-track">
                    <div
                      className="analytics-fill"
                      style={{
                        width: `${percentage(count)}%`,
                        background: status.color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </section>
        </>
      )}
    </>
  )
}

export default Analytics
