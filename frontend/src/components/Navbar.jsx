import React from 'react';
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
        <span className="app-title">
          Inventory Panel
        </span>
      </div>
      <div className="header-right" />
    </header>
  );
}

export default Navbar;
