import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import api from '../services/api';
import { PageHeader } from '../components/ui';
import OrderDetailModal from '../components/orders/OrderDetailModal';
import OrderTable, { OrderFilters } from '../components/orders/OrderTable';

function Orders({ showToast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      setOrders(await api.getOrders());
    } catch (err) {
      showToast('Error loading orders', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return orders;
    return orders.filter((order) => order.status.toLowerCase() === statusFilter.toLowerCase());
  }, [orders, statusFilter]);

  const handleViewDetails = async (orderId) => {
    try {
      setSelectedOrder(await api.getOrder(orderId));
      setDetailModalOpen(true);
    } catch (err) {
      showToast('Error fetching order details', err.message, 'error');
    }
  };

  const refreshSelectedOrder = async (orderId) => {
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(await api.getOrder(orderId));
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    const actionLabel = newStatus === 'cancelled' ? 'cancel' : newStatus === 'fulfilled' ? 'fulfill' : 'confirm';
    if (!window.confirm(`Are you sure you want to ${actionLabel} this order?`)) return;

    setIsUpdatingStatus(true);
    try {
      if (newStatus === 'cancelled') await api.cancelOrder(orderId);
      else await api.updateOrderStatus(orderId, newStatus);

      showToast('Success', `Order status updated to '${newStatus}'`, 'success');
      await refreshSelectedOrder(orderId);
      fetchOrders();
    } catch (err) {
      showToast('Status change failed', err.message, 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Orders"
        subtitle="Track customer orders, fulfillment status, and invoicing"
        action={<Link to="/orders/new" className="btn btn-primary"><Plus size={16} /> Create Order</Link>}
      />

      <OrderFilters value={statusFilter} onChange={setStatusFilter} />
      <OrderTable orders={filteredOrders} loading={loading} statusFilter={statusFilter} onView={handleViewDetails} />

      {detailModalOpen && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          updating={isUpdatingStatus}
          onClose={() => setDetailModalOpen(false)}
          onStatusChange={handleUpdateStatus}
        />
      )}
    </div>
  );
}

export default Orders;
