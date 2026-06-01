import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package, Plus, ShoppingCart, Trash2, User } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export function BackToOrders() {
  return (
    <div style={{ marginBottom: '16px' }}>
      <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>
        <ArrowLeft size={16} /> Back to Orders
      </Link>
    </div>
  );
}

export function CustomerSelect({ customers, value, onChange }) {
  return (
    <div className="card">
      <h3 style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <User size={18} color="var(--primary-color)" /> Customer Account
      </h3>
      <div className="form-group">
        <label className="form-label">Select Customer*</label>
        <select className="form-input" value={value} onChange={(e) => onChange(e.target.value)} required>
          <option value="">-- Choose Customer --</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>{customer.name} ({customer.email})</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function CartTable({ items, onQtyChange, onRemove }) {
  if (items.length === 0) {
    return (
      <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-light)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', marginBottom: '24px' }}>
        <p style={{ fontSize: '13px' }}>Cart is empty. Use the form below to add products.</p>
      </div>
    );
  }

  return (
    <div className="table-container" style={{ marginBottom: '24px' }}>
      <table className="order-items-table" style={{ fontSize: '13px' }}>
        <thead>
          <tr><th>Product</th><th>SKU</th><th>Price</th><th style={{ width: '100px' }}>Quantity</th><th style={{ textAlign: 'right' }}>Subtotal</th><th style={{ width: '50px' }}></th></tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.product_id}>
              <td style={{ fontWeight: 500 }}>{item.name}</td>
              <td>{item.sku}</td>
              <td>{formatCurrency(item.price)}</td>
              <td><input type="number" className="form-input" style={{ padding: '4px 6px', fontSize: '12px', textAlign: 'center' }} value={item.quantity} onChange={(e) => onQtyChange(index, e.target.value)} min="1" /></td>
              <td style={{ textAlign: 'right', fontWeight: 500 }}>{formatCurrency(item.price * item.quantity)}</td>
              <td>
                <button className="btn btn-danger" style={{ padding: '4px', border: 'none', background: 'none' }} onClick={() => onRemove(index)}>
                  <Trash2 size={14} color="var(--danger-color)" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CartBuilder({ items, products, selectedProduct, form, onFormChange, onAddItem, onQtyChange, onRemove }) {
  return (
    <div className="card">
      <h3 style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <ShoppingCart size={18} color="var(--primary-color)" /> Cart Items
      </h3>
      <CartTable items={items} onQtyChange={onQtyChange} onRemove={onRemove} />
      <form onSubmit={onAddItem} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px' }}>Add Product to Cart</h4>
        <div className="order-builder-layout" style={{ gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Product Name</label>
            <select className="form-input" value={form.productId} onChange={(e) => onFormChange({ productId: e.target.value, quantity: 1 })}>
              <option value="">-- Choose Product --</option>
              {products.map((product) => (
                <option key={product.id} value={product.id} disabled={product.stock_quantity === 0}>
                  {product.name} - {formatCurrency(product.price)} ({product.stock_quantity === 0 ? 'Out of stock' : `${product.stock_quantity} in stock`})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Quantity</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="number" className="form-input" style={{ maxWidth: '90px' }} value={form.quantity} onChange={(e) => onFormChange({ quantity: e.target.value })} min="1" placeholder="Qty" />
              <button type="submit" className="btn btn-secondary" style={{ whiteSpace: 'nowrap' }}><Plus size={16} /> Add</button>
            </div>
          </div>
        </div>
        {selectedProduct && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '12px', color: selectedProduct.stock_quantity <= 10 ? 'var(--warning-color)' : 'var(--success-text)' }}>
            <Package size={14} />
            <span>Current stock level: <strong>{selectedProduct.stock_quantity}</strong> units available.</span>
          </div>
        )}
      </form>
    </div>
  );
}

export function OrderSummary({ items, submitting, selectedCustomerId, onPlaceOrder }) {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="card" style={{ position: 'sticky', top: '90px' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <ShoppingCart size={18} color="var(--primary-color)" /> Summary
      </h3>
      <div className="summary-row"><span className="details-label">Items Count:</span><span className="details-value">{totalQuantity} items</span></div>
      <div className="summary-row"><span className="details-label">Unique Products:</span><span className="details-value">{items.length} lines</span></div>
      <div className="summary-row summary-total"><span>Total Amount:</span><span>{formatCurrency(totalAmount)}</span></div>
      <button type="button" className="btn btn-primary" style={{ width: '100%', marginTop: '24px', padding: '10px 16px', fontSize: '15px' }} onClick={onPlaceOrder} disabled={submitting || items.length === 0 || !selectedCustomerId}>
        {submitting ? 'Reserving Stock...' : 'Place Order'}
      </button>
    </div>
  );
}
