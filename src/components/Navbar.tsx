import { Icon } from '@mdi/react';
import { mdiMagnify, mdiChevronDown } from '@mdi/js';
import './Navbar.css';

const navItems = ['Positions', 'Scheduling Center', 'Insights', 'Settings'];

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo">
          <img src="/eightfold-logo.png" alt="Logo" className="navbar-logo-img" />
          <span className="navbar-brand">eightfold.ai</span>
        </div>
        <ul className="navbar-links">
          {navItems.map((item) => (
            <li key={item}>
              <a href="#" className={item === 'Positions' ? 'active' : ''}>
                {item}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="navbar-right">
        <div className="navbar-search">
          <Icon path={mdiMagnify} size={0.75} color="rgba(255,255,255,0.6)" />
          <span className="search-placeholder">Type to search</span>
        </div>
        <div className="navbar-avatar">
          <div className="avatar-circle" />
          <Icon path={mdiChevronDown} size={0.75} color="rgba(255,255,255,0.6)" />
        </div>
      </div>
    </nav>
  );
}
