
import { Link } from 'react-router-dom'
import { useApplications } from '../context/ApplicationContext'

function Dashboard() {
  const { applications, loading, error } = useApplications()

  const total = applications.length
  const applied = applications.filter(app => app.status === 'Applied').length
  const interviews = applications.filter(app => app.status === 'Interview').length
  const offers = applications.filter(app => app.status === 'Offer').length

  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate))
    .slice(0, 5)

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">YOUR CAREER WORKSPACE</p>
          <h1>Dashboard</h1>
          <p className="subtitle">Your career journey, organized.</p>
        </div>
        <div className="profile">VS</div>
      </header>

      <section className="welcome">
        <p className="welcome-label">YOUR NEXT OPPORTUNITY STARTS HERE</p>
        <h2>Welcome back! <span>✦</span></h2>
        <p>Keep track of your applications and move closer to your goals.</p>
      </section>

      <section className="stats">
        <div className="stat-card">
          <div className="stat-top"><span>Total Applications</span><span>▤</span></div>
          <h2>{total}</h2>
          <p>All your opportunities</p>
        </div>

        <div className="stat-card">
          <div className="stat-top"><span>Applied</span><span>↗</span></div>
          <h2>{applied}</h2>
          <p>Applications submitted</p>
        </div>

        <div className="stat-card">
          <div className="stat-top"><span>Interviews</span><span>◎</span></div>
          <h2>{interviews}</h2>
          <p>Opportunities progressing</p>
        </div>

        <div className="stat-card">
          <div className="stat-top"><span>Offers</span><span>✦</span></div>
          <h2>{offers}</h2>
          <p>Offers received</p>
        </div>
      </section>

      <section className="applications">
        <div className="section-heading">
          <div>
            <p className="eyebrow">KEEP MOVING FORWARD</p>
            <h2>Recent Applications</h2>
          </div>

          <Link to="/applications" className="add-button">
            Manage Applications
          </Link>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Loading your applications...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <h3>Unable to load applications</h3>
            <p>{error}</p>
          </div>
        ) : recentApplications.length === 0 ? (
          <div className="empty-state">
            <h3>No applications yet</h3>
            <p>Start tracking your opportunities.</p>
          </div>
        ) : (
          recentApplications.map(app => (
            <div className="application-card" key={app._id}>
              <div className="company-mark">
                {app.company.charAt(0).toUpperCase()}
              </div>

              <div className="application-info">
                <h3>{app.role}</h3>
                <p>
                  {app.company} · {app.location || 'Location not specified'}
                </p>
              </div>

              <span className={`status-select status-${app.status.toLowerCase()}`}>
                {app.status}
              </span>
            </div>
          ))
        )}
      </section>
    </>
  )
}

export default Dashboard
