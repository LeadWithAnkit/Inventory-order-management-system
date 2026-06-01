import React from 'react';
import { Edit2, Trash2, PackageOpen } from 'lucide-react';
import { EmptyState, LoadingState } from '../ui';
import { formatCurrency } from '../../utils/formatters';

function StockBadge({ quantity }) {
  const className = quantity === 0 ? 'badge badge-danger' : quantity <= 10 ? 'badge badge-warning' : '';
  return <span className={className} style={{ fontSize: '13px' }}>{quantity}</span>;
}

export default function ProductTable({ products, loading, onEdit, onDelete }) {
  if (loading) return <LoadingState message="Loading inventory..." />;
  if (products.length === 0) {
    return (
      <EmptyState
        icon={PackageOpen}
        title="No products found"
        message="Try refining your search terms or add a new product to get started."
      />
    );
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th style={{ width: '100px', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td style={{ fontWeight: 600 }}>{product.sku}</td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 500 }}>{product.name}</span>
                  {product.description && (
                    <span style={{ fontSize: '12px', color: 'var(--text-light)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {product.description}
                    </span>
                  )}
                </div>
              </td>
              <td>{formatCurrency(product.price)}</td>
              <td><StockBadge quantity={product.stock_quantity} /></td>
              <td>
                <span className={`badge ${product.is_active ? 'badge-success' : 'badge-danger'}`}>
                  {product.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button className="btn btn-secondary" style={{ padding: '6px' }} title="Edit product" onClick={() => onEdit(product)}>
                    <Edit2 size={14} />
                  </button>
                  <button className="btn btn-danger" style={{ padding: '6px' }} title="Delete product" onClick={() => onDelete(product)}>
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
