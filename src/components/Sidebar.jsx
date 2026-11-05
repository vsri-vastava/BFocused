
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Sidebar() {
  const { logout } = useAuth()

  return (
    <aside className="sidebar">
      <div>
        <h2 className="logo">BFocused<span>.</span></h2>

        <p className="menu-label">WORKSPACE</p>

        <nav>
          <NavLink to="/" end>
            ▦ &nbsp; Dashboard
          </NavLink>

          <NavLink to="/applications">
            ▤ &nbsp; Applications
          </NavLink>

          <NavLink to="/kanban">
            ▥ &nbsp; Kanban Board
          </NavLink>

          <NavLink to="/analytics">
            ◷ &nbsp; Analytics
          </NavLink>

          <NavLink to="/resumes">
            ▧ &nbsp; My Resumes
          </NavLink>

          <NavLink to="/ai">
  ✦       &nbsp; AI Career Assistant
          </NavLink>
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-tip">
          <span>✦</span>
          <p>Stay focused.<br />Stay ahead.</p>
        </div>

        <button
          className="logout-button"
          onClick={logout}
        >
          ↪ &nbsp; Logout
        </button>

        <p className="version">BFocused · Version 2.0</p>
      </div>
    </aside>
  )
}

export default Sidebar
