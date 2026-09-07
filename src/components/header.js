import * as React from "react"
import { useState } from "react"
import { Link, navigate } from "gatsby"
import ThemeToggle from "./ThemeToggle"
import AuthButton from "./AuthButton"
import ProgressControls from "./ProgressControls"
import { DOMAINS } from "../data/domains"

const Header = ({ siteTitle }) => {
  const [open, setOpen] = useState(false)

  return (
    <header>
      <div className="nav">
        <div className="container-nav">
          <Link to="/" className="nav-links pagename">
            <img
              src="/favicon.gif"
              style={{
                border: '0px solid white',
                padding: '0px',
                marginRight: '10px',
                borderRadius: '7px',
                height: '35px',
                width: '35px'
              }}
              alt="BRAINSTELLAR"
            />{' '}
            <img
              src="/images/cover_transparent.png"
              alt="BRAINSTELLAR"
              className="nav-wordmark"
            />
          </Link>

          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-label="Menu"
            onClick={() => setOpen(o => !o)}
          >
            {open ? '✕' : '☰'}
          </button>

          <div className={`nav-menu${open ? ' nav-menu-open' : ''}`} onClick={() => setOpen(false)}>
            <Link to="/" className="nav-links">Dashboard</Link>
            <Link to="/all" className="nav-links">All Questions</Link>
            <Link to="/cheatsheets" className="nav-links">Cheatsheets</Link>
            <select
              className="nav-select"
              defaultValue=""
              onChange={e => {
                if (e.target.value) navigate(e.target.value);
                e.target.value = '';
              }}
            >
              <option value="" disabled>Domains</option>
              {DOMAINS.map(d => (
                <option key={d.slug} value={`/q/${d.slug}`}>{d.icon} {d.label}</option>
              ))}
            </select>

            <ThemeToggle />
            <AuthButton />
            <ProgressControls />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
