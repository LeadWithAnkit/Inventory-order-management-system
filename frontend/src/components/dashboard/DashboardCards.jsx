import React from 'react';
import { AlertTriangle, ArrowRight, CheckCircle, IndianRupee, Package, Receipt, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../ui';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

function KpiCard({ icon: Icon, label, value, bg, color }) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon-wrapper" style={{ backgroundColor: bg, color }}>
        <Icon size={24} />
      </div>
      <div className="kpi-details">
        <span className="kpi-label">{label}</span>
        <span className="kpi-value">{value}</span>
      </div>
    </div>
  );
}

export function KpiGrid({ metrics }) {
  return (
    <div className="kpi-grid">
      <KpiCard icon={IndianRupee} label="Revenue (Confirmed)" value={formatCurrency(metrics.totalSales)} bg="var(--success-bg)" color="var(--success-color)" />
      <KpiCard icon={Receipt} label="Total Orders" value={metrics.totalOrders} bg="var(--primary-bg)" color="var(--primary-color)" />
      <KpiCard icon={Package} label="Active Products" value={metrics.activeProducts} bg="var(--info-bg)" color="var(--info-color)" />
      <KpiCard icon={Users} label="Customers" value={metrics.totalCustomers} bg="rgba(217, 119, 6, 0.1)" color="var(--warning-color)" />
    </div>
  );
}

export function RecentOrdersCard({ orders }) {
  return (
    <div className="card" style={{ height: '100%', marginBottom: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Recent Orders</h2>
        <Link to="/orders" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 500 }}>
          View All <ArrowRight size={14} />
        </Link>
      </div>
      {orders.length === 0 ? <div className="empty-container" style={{ padding: '24px 0' }}><p>No orders registered yet.</p></div> : <RecentOrdersTable orders={orders} />}
    </div>
  );
}

function RecentOrdersTable({ orders }) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td style={{ fontWeight: 500 }}>#ORD-{String(order.id).padStart(4, '0')}</td>
              <td>{order.customer?.name || 'Unknown'}</td>
              <td>{formatCurrency(order.total_amount)}</td>
              <td><StatusBadge status={order.status} /></td>
              <td style={{ color: 'var(--text-light)', fontSize: '13px' }}>{formatDateTime(order.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StockAlertsCard({ products }) {
  return (
    <div className="card" style={{ height: '100%', marginBottom: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <AlertTriangle size={18} color="var(--warning-color)" />
        <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Stock Alerts</h2>
      </div>
      {products.length === 0 ? <HealthyStock /> : <StockList products={products} />}
    </div>
  );
}

function HealthyStock() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '180px', color: 'var(--success-color)', backgroundColor: 'var(--success-bg)', borderRadius: 'var(--radius-md)', border: '1px dashed rgba(22, 163, 74, 0.2)', padding: '16px', textAlign: 'center' }}>
      <CheckCircle size={24} style={{ marginBottom: '8px' }} />
      <p style={{ fontWeight: 500, fontSize: '13px' }}>All active product inventories are healthy!</p>
    </div>
  );
}

function StockList({ products }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
      {products.map((product) => (
        <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: product.stock_quantity === 0 ? 'var(--danger-bg)' : 'var(--bg-app)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '70%' }}>
            <span style={{ fontWeight: 500, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>SKU: {product.sku}</span>
          </div>
          <span className={`badge ${product.stock_quantity === 0 ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '11px', padding: '2px 6px' }}>
            {product.stock_quantity === 0 ? 'Out of stock' : `${product.stock_quantity} left`}
          </span>
        </div>
      ))}
    </div>
  );
}
