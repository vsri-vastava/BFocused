
import { NavLink } from 'react-router-dom'

function Sidebar() {
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
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-tip">
          <span>✦</span>
          <p>Stay focused.<br />Stay ahead.</p>
        </div>

        <p className="version">BFocused · Version 2.0</p>
      </div>
    </aside>
  )
}

export default Sidebar
