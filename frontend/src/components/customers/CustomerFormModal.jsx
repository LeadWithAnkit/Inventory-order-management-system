import React from 'react';
import { Modal } from '../ui';

export const emptyCustomer = { name: '', email: '', phone: '', address: '' };

export function customerToForm(customer) {
  return {
    name: customer.name,
    email: customer.email,
    phone: customer.phone || '',
    address: customer.address || ''
  };
}

export function validateCustomer(formData) {
  const errors = {};
  if (!formData.name.trim()) errors.name = 'Name is required';
  if (!formData.email.trim()) errors.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email address is invalid';
  return errors;
}

function ErrorText({ children }) {
  return children ? <span style={{ fontSize: '12px', color: 'var(--danger-color)' }}>{children}</span> : null;
}

export default function CustomerFormModal({ editingCustomer, formData, errors, submitting, onChange, onClose, onSubmit }) {
  return (
    <Modal title={editingCustomer ? 'Edit Customer Info' : 'Add New Customer'} onClose={onClose}>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name*</label>
          <input type="text" name="name" className="form-input" placeholder="e.g. Ankit Tiwari" value={formData.name} onChange={onChange} required />
          <ErrorText>{errors.name}</ErrorText>
        </div>
        <div className="form-group">
          <label className="form-label">Email Address*</label>
          <input type="email" name="email" className="form-input" placeholder="e.g. ankit.tiwari@example.in" value={formData.email} onChange={onChange} required />
          <ErrorText>{errors.email}</ErrorText>
        </div>
        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input type="text" name="phone" className="form-input" placeholder="e.g. +91 98765 43210" value={formData.phone} onChange={onChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Address</label>
          <textarea name="address" className="form-input" style={{ minHeight: '60px', fontFamily: 'inherit' }} placeholder="Street address, city, state, PIN code" value={formData.address} onChange={onChange} />
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : editingCustomer ? 'Save Changes' : 'Register Customer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
