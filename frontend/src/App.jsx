import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import CreateOrder from './pages/CreateOrder';
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast Helper
  const showToast = (title, message, type = 'info') => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, title, message, type }]);
    
    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
  };

  // Toast Icon Picker
  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} color="var(--success-color)" />;
      case 'error':
        return <AlertTriangle size={18} color="var(--danger-color)" />;
      case 'info':
      default:
        return <Info size={18} color="var(--info-color)" />;
    }
  };

  return (
    <Router>
      <div className="app-container">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Top Navbar */}
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Main Content Area */}
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard showToast={showToast} />} />
            <Route path="/products" element={<Products showToast={showToast} />} />
            <Route path="/customers" element={<Customers showToast={showToast} />} />
            <Route path="/orders" element={<Orders showToast={showToast} />} />
            <Route path="/orders/new" element={<CreateOrder showToast={showToast} />} />
          </Routes>
        </main>

        {/* Global Floating Toast Alert List */}
        <div className="toast-container">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast toast-${toast.type}`}>
              {getToastIcon(toast.type)}
              <div className="toast-content">
                <div className="toast-title">{toast.title}</div>
                <div className="toast-message">{toast.message}</div>
              </div>
              <button className="toast-close" onClick={() => removeToast(toast.id)}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </Router>
  );
}

export default App;
