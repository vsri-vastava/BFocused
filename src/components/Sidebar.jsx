
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

function Sidebar() {
  const { logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <aside className="sidebar">
      <div>
        <h2 className="logo">
          BFocused<span>.</span>
        </h2>

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
            ✦ &nbsp; AI Career Assistant
          </NavLink>
        </nav>
      </div>

      <div className="sidebar-bottom">

        {/* Theme Toggle */}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <span>{theme === 'light' ? '☾' : '☀'}</span>
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>

        <div className="sidebar-tip">
          <span>✦</span>
          <p>
            Stay focused.<br />
            Stay ahead.
          </p>
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
