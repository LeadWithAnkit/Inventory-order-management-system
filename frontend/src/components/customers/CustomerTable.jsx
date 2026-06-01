import React from 'react';
import { Edit2, Trash2, UsersRound } from 'lucide-react';
import { EmptyState, LoadingState } from '../ui';

export default function CustomerTable({ customers, loading, onEdit, onDelete }) {
  if (loading) return <LoadingState message="Loading customers..." />;
  if (customers.length === 0) {
    return <EmptyState icon={UsersRound} title="No customers found" message="Try refining your search terms or add a new customer to get started." />;
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Billing/Shipping Address</th>
            <th style={{ width: '100px', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td style={{ fontWeight: 600 }}>{customer.name}</td>
              <td>{customer.email}</td>
              <td style={{ color: customer.phone ? 'var(--text-main)' : 'var(--text-light)' }}>{customer.phone || 'N/A'}</td>
              <td style={{ color: customer.address ? 'var(--text-main)' : 'var(--text-light)', fontSize: '13px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {customer.address || 'N/A'}
              </td>
              <td>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button className="btn btn-secondary" style={{ padding: '6px' }} title="Edit customer" onClick={() => onEdit(customer)}>
                    <Edit2 size={14} />
                  </button>
                  <button className="btn btn-danger" style={{ padding: '6px' }} title="Delete customer" onClick={() => onDelete(customer)}>
                    <Trash2 size={14} />
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
