import React from 'react';
import { Eye, ReceiptText } from 'lucide-react';
import { EmptyState, LoadingState, StatusBadge } from '../ui';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export const orderStatuses = ['all', 'confirmed', 'fulfilled', 'cancelled', 'pending'];

export function OrderFilters({ value, onChange }) {
  return (
    <div className="filter-bar" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', gap: '8px' }}>
      {orderStatuses.map((status) => (
        <button key={status} className={`btn ${value === status ? 'btn-primary' : 'btn-secondary'}`} style={{ textTransform: 'capitalize', padding: '6px 12px', fontSize: '13px' }} onClick={() => onChange(status)}>
          {status}
        </button>
      ))}
    </div>
  );
}

export default function OrderTable({ orders, loading, statusFilter, onView }) {
  if (loading) return <LoadingState message="Loading orders database..." />;
  if (orders.length === 0) {
    const message = statusFilter === 'all'
      ? 'Register a new customer order to get started.'
      : `No orders found with status '${statusFilter}'.`;
    return <EmptyState icon={ReceiptText} title="No orders found" message={message} />;
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Total Value</th>
            <th>Fulfillment Status</th>
            <th>Date Placed</th>
            <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td style={{ fontWeight: 600 }}>#ORD-{String(order.id).padStart(4, '0')}</td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 500 }}>{order.customer?.name || 'Unknown Customer'}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>{order.customer?.email}</span>
                </div>
              </td>
              <td style={{ fontWeight: 500 }}>{formatCurrency(order.total_amount)}</td>
              <td><StatusBadge status={order.status} /></td>
              <td style={{ color: 'var(--text-light)', fontSize: '13px' }}>{formatDateTime(order.created_at)}</td>
              <td>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button className="btn btn-secondary" style={{ padding: '6px' }} title="View Details" onClick={() => onView(order.id)}>
                    <Eye size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
