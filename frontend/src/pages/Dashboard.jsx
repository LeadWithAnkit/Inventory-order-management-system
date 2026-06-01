import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { LoadingState, PageHeader } from '../components/ui';
import { KpiGrid, RecentOrdersCard, StockAlertsCard } from '../components/dashboard/DashboardCards';

function getDashboardMetrics({ products, customers, orders }) {
  return {
    totalOrders: orders.length,
    totalCustomers: customers.length,
    totalSales: orders
      .filter((order) => order.status !== 'cancelled')
      .reduce((sum, order) => sum + parseFloat(order.total_amount), 0),
    activeProducts: products.filter((product) => product.is_active).length,
    lowStockProducts: products.filter((product) => product.is_active && product.stock_quantity <= 10),
    recentOrders: orders.slice(0, 5)
  };
}

function Dashboard({ showToast }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ products: [], customers: [], orders: [] });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [products, customers, orders] = await Promise.all([
          api.getProducts(),
          api.getCustomers(),
          api.getOrders()
        ]);
        setData({ products, customers, orders });
      } catch (err) {
        showToast('Error loading dashboard metrics', err.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const metrics = useMemo(() => getDashboardMetrics(data), [data]);

  if (loading) return <LoadingState message="Loading business analytics..." />;

  return (
    <div className="page-container">
      <PageHeader
        title="System Dashboard"
        subtitle="Overview of inventory, customers, and operations"
        action={<Link to="/orders/new" className="btn btn-primary">Create New Order</Link>}
      />

      <KpiGrid metrics={metrics} />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '24px' }}>
        <RecentOrdersCard orders={metrics.recentOrders} />
        <StockAlertsCard products={metrics.lowStockProducts} />
      </div>
    </div>
  );
}

export default Dashboard;
