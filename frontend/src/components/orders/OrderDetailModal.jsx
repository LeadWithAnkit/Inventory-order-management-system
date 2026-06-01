import React from 'react';
import { Ban, CheckCircle, Truck } from 'lucide-react';
import { Modal, StatusBadge } from '../ui';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

function DetailBlock({ order }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
      <div>
        <h4 style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '6px', fontWeight: 600 }}>CUSTOMER DETAILS</h4>
        <p style={{ fontWeight: 500, fontSize: '14px' }}>{order.customer?.name}</p>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{order.customer?.email}</p>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{order.customer?.phone || 'No phone'}</p>
      </div>
      <div>
        <h4 style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '6px', fontWeight: 600 }}>ORDER DETAILS</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <span style={{ fontSize: '13px' }}>Status:</span>
          <StatusBadge status={order.status} />
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Placed: {formatDateTime(order.created_at)}</p>
        <p style={{ fontSize: '14px', fontWeight: 600, marginTop: '4px' }}>Total: {formatCurrency(order.total_amount)}</p>
      </div>
    </div>
  );
}

function ItemsTable({ items }) {
  return (
    <div className="table-container" style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '24px' }}>
      <table className="data-table" style={{ fontSize: '13px' }}>
        <thead>
          <tr style={{ position: 'sticky', top: 0, zIndex: 10 }}>
            <th>Product</th>
            <th>SKU</th>
            <th>Price</th>
            <th>Qty</th>
            <th style={{ textAlign: 'right' }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td style={{ fontWeight: 500 }}>{item.product?.name || 'Deleted Product'}</td>
              <td>{item.product?.sku || 'N/A'}</td>
              <td>{formatCurrency(item.unit_price)}</td>
              <td>{item.quantity}</td>
              <td style={{ textAlign: 'right', fontWeight: 500 }}>{formatCurrency(parseFloat(item.unit_price) * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function OrderDetailModal({ order, updating, onClose, onStatusChange }) {
  return (
    <Modal title={`Order Detail - #ORD-${String(order.id).padStart(4, '0')}`} onClose={onClose} maxWidth="650px">
      <DetailBlock order={order} />
      <h4 style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '8px', fontWeight: 600 }}>ITEMS ORDERED</h4>
      <ItemsTable items={order.items} />

      {order.customer?.address && (
        <div style={{ marginBottom: '24px', padding: '12px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>SHIPPING ADDRESS</h4>
          <p style={{ fontSize: '13px', color: 'var(--text-main)' }}>{order.customer.address}</p>
        </div>
      )}

      <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: 0 }}>
        <div style={{ marginRight: 'auto', display: 'flex', gap: '8px' }}>
          {order.status !== 'cancelled' && order.status !== 'fulfilled' && (
            <>
              <button className="btn btn-secondary" style={{ color: 'var(--success-color)', borderColor: 'rgba(22, 163, 74, 0.2)' }} onClick={() => onStatusChange(order.id, 'fulfilled')} disabled={updating}>
                <Truck size={14} /> Mark Fulfilled
              </button>
              <button className="btn btn-danger" onClick={() => onStatusChange(order.id, 'cancelled')} disabled={updating}>
                <Ban size={14} /> Cancel Order
              </button>
            </>
          )}
          {order.status === 'cancelled' && (
            <button className="btn btn-primary" onClick={() => onStatusChange(order.id, 'confirmed')} disabled={updating} title="This will check stock levels and re-deduct items from inventory">
              <CheckCircle size={14} /> Re-Confirm Order
            </button>
          )}
        </div>
        <button className="btn btn-secondary" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}
