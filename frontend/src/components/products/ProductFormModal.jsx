import React from 'react';
import { Modal } from '../ui';

export const emptyProduct = {
  name: '',
  sku: '',
  description: '',
  price: '',
  stock_quantity: '',
  is_active: true
};

export function productToForm(product) {
  return {
    name: product.name,
    sku: product.sku,
    description: product.description || '',
    price: parseFloat(product.price),
    stock_quantity: product.stock_quantity,
    is_active: product.is_active
  };
}

export function validateProduct(formData) {
  const errors = {};
  if (!formData.name.trim()) errors.name = 'Name is required';
  if (!formData.sku.trim()) errors.sku = 'SKU is required';
  if (formData.price === '' || isNaN(formData.price) || parseFloat(formData.price) < 0) {
    errors.price = 'Price must be a valid non-negative number';
  }
  if (formData.stock_quantity === '' || isNaN(formData.stock_quantity) || parseInt(formData.stock_quantity, 10) < 0) {
    errors.stock_quantity = 'Stock quantity must be a non-negative integer';
  }
  return errors;
}

function ErrorText({ children }) {
  return children ? <span style={{ fontSize: '12px', color: 'var(--danger-color)' }}>{children}</span> : null;
}

export default function ProductFormModal({ editingProduct, formData, errors, submitting, onChange, onClose, onSubmit }) {
  return (
    <Modal title={editingProduct ? 'Edit Product' : 'Add New Product'} onClose={onClose}>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label className="form-label">SKU / Code*</label>
          <input type="text" name="sku" className={`form-input ${errors.sku ? 'border-danger' : ''}`} placeholder="e.g. ELEC-LTP-001" value={formData.sku} onChange={onChange} disabled={!!editingProduct} required />
          <ErrorText>{errors.sku}</ErrorText>
        </div>
        <div className="form-group">
          <label className="form-label">Product Name*</label>
          <input type="text" name="name" className="form-input" placeholder="e.g. Lenovo ThinkPad E14 Laptop" value={formData.name} onChange={onChange} required />
          <ErrorText>{errors.name}</ErrorText>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea name="description" className="form-input" style={{ minHeight: '60px', fontFamily: 'inherit' }} placeholder="Optional product description" value={formData.description} onChange={onChange} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Price (INR)*</label>
            <input type="number" name="price" step="0.01" min="0" className="form-input" placeholder="0.00" value={formData.price} onChange={onChange} required />
            <ErrorText>{errors.price}</ErrorText>
          </div>
          <div className="form-group">
            <label className="form-label">Initial Stock*</label>
            <input type="number" name="stock_quantity" min="0" step="1" className="form-input" placeholder="0" value={formData.stock_quantity} onChange={onChange} required />
            <ErrorText>{errors.stock_quantity}</ErrorText>
          </div>
        </div>
        <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
          <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={onChange} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
          <label htmlFor="is_active" style={{ fontSize: '14px', cursor: 'pointer', userSelect: 'none' }}>Product is active and available for order</label>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
