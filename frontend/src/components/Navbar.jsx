import React from 'react';
import { Menu } from 'lucide-react';

function Navbar({ onToggleSidebar }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <button 
          className="menu-toggle-btn" 
          onClick={onToggleSidebar}
          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', marginRight: '8px' }}
        >
          <Menu size={20} />
        </button>
        <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-main)' }}>
          Inventory Control Panel
        </span>
      </div>
      <div className="header-right" />
    </header>
  );
}

export default Navbar;
