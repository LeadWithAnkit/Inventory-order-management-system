import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import api from '../services/api';
import { PageHeader } from '../components/ui';
import CustomerTable from '../components/customers/CustomerTable';
import CustomerFormModal, {
  customerToForm,
  emptyCustomer,
  validateCustomer
} from '../components/customers/CustomerFormModal';

function Customers({ showToast }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState(emptyCustomer);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      setCustomers(await api.getCustomers({ search: searchTerm }));
    } catch (err) {
      showToast('Error loading customers', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const openCreateModal = () => {
    setEditingCustomer(null);
    setFormData(emptyCustomer);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setFormData(customerToForm(customer));
    setFormErrors({});
    setModalOpen(true);
  };

  const handleInputChange = ({ target }) => {
    setFormData((current) => ({ ...current, [target.name]: target.value }));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const errors = validateCustomer(formData);
    setFormErrors(errors);
    if (Object.keys(errors).length) return;

    setIsSubmitting(true);
    try {
      if (editingCustomer) {
        await api.updateCustomer(editingCustomer.id, formData);
        showToast('Success', `Customer '${formData.name}' updated successfully`, 'success');
      } else {
        await api.createCustomer(formData);
        showToast('Success', `Customer '${formData.name}' registered successfully`, 'success');
      }
      setModalOpen(false);
      fetchCustomers();
    } catch (err) {
      showToast('Action failed', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCustomer = async (customer) => {
    if (!window.confirm(`Are you sure you want to delete customer '${customer.name}'?`)) return;

    try {
      await api.deleteCustomer(customer.id);
      showToast('Deleted', `Customer '${customer.name}' deleted successfully`, 'success');
      fetchCustomers();
    } catch (err) {
      showToast('Delete failed', err.message, 'error');
    }
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Customers"
        subtitle="Manage customer directory and contact information"
        action={<button className="btn btn-primary" onClick={openCreateModal}><Plus size={16} /> Add Customer</button>}
      />

      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search by Name or Email..." className="form-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <CustomerTable customers={customers} loading={loading} onEdit={openEditModal} onDelete={handleDeleteCustomer} />

      {modalOpen && (
        <CustomerFormModal
          editingCustomer={editingCustomer}
          formData={formData}
          errors={formErrors}
          submitting={isSubmitting}
          onChange={handleInputChange}
          onClose={() => setModalOpen(false)}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
}

export default Customers;
