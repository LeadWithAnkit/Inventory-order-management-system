import React from 'react';
import { X } from 'lucide-react';

export function LoadingState({ message }) {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="card">
      <div className="empty-container">
        {Icon && <Icon size={32} style={{ marginBottom: '12px', color: 'var(--text-light)' }} />}
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
    </div>
  );
}

export function Modal({ title, onClose, children, maxWidth }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={maxWidth ? { maxWidth } : undefined}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const badgeClass =
    status === 'fulfilled' ? 'badge-success' :
    status === 'confirmed' ? 'badge-info' :
    status === 'cancelled' ? 'badge-danger' : 'badge-warning';

  return <span className={`badge ${badgeClass}`}>{status}</span>;
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="title">{title}</h1>
        <p className="subtitle">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
