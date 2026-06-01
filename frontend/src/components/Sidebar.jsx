import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Users, Receipt, PlusCircle, X } from 'lucide-react';

function Sidebar({ isOpen, onClose }) {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Orders', path: '/orders', icon: Receipt },
    { name: 'New Order', path: '/orders/new', icon: PlusCircle },
  ];

  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <Package size={24} color="var(--primary-color)" />
        <span>StockFlow</span>
        <button 
          style={{ marginLeft: 'auto', display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }} 
          className="menu-toggle-btn"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      <nav style={{ flexGrow: 1 }}>
        <ul className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name} className="sidebar-item" onClick={onClose}>
                <NavLink 
                  to={item.path} 
                  className={({ isActive }) => isActive ? 'active' : ''}
                  end={item.path === '/'}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', fontSize: '11px', color: 'var(--text-light)', textAlign: 'center' }}>
        v1.0.0 &copy; 2026
      </div>
    </aside>
  );
}

export default Sidebar;
