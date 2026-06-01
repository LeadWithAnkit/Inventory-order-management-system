import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';

function Navbar({ onToggleSidebar }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <button 
          className="menu-toggle-btn" 
          onClick={onToggleSidebar}
        >
          <Menu size={20} />
        </button>
        <Link to="/" className="app-title">
          Inventory Panel
        </Link>
      </div>
      <div className="header-right" />
    </header>
  );
}

export default Navbar;
