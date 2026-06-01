import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import api from '../services/api';
import { PageHeader } from '../components/ui';
import ProductTable from '../components/products/ProductTable';
import ProductFormModal, {
  emptyProduct,
  productToForm,
  validateProduct
} from '../components/products/ProductFormModal';

function Products({ showToast }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(emptyProduct);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      setProducts(await api.getProducts({ search: searchTerm, active_only: filterActive }));
    } catch (err) {
      showToast('Error loading products', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, filterActive]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData(emptyProduct);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData(productToForm(product));
    setFormErrors({});
    setModalOpen(true);
  };

  const handleInputChange = ({ target }) => {
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setFormData((current) => ({ ...current, [target.name]: value }));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const errors = validateProduct(formData);
    setFormErrors(errors);
    if (Object.keys(errors).length) return;

    setIsSubmitting(true);
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity, 10)
    };

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        showToast('Success', `Product '${payload.name}' updated successfully`, 'success');
      } else {
        await api.createProduct(payload);
        showToast('Success', `Product '${payload.name}' created successfully`, 'success');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      showToast('Action failed', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    const confirmed = window.confirm(`Are you sure you want to delete product '${product.name}' (SKU: ${product.sku})?`);
    if (!confirmed) return;

    try {
      await api.deleteProduct(product.id);
      showToast('Deleted', `Product '${product.name}' deleted successfully`, 'success');
      fetchProducts();
    } catch (err) {
      showToast('Delete failed', err.message, 'error');
    }
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Products"
        subtitle="Manage products, pricing, and stock levels"
        action={<button className="btn btn-primary" onClick={openCreateModal}><Plus size={16} /> Add Product</button>}
      />

      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search by SKU or Name..." className="form-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', userSelect: 'none' }}>
          <input type="checkbox" checked={filterActive} onChange={(e) => setFilterActive(e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
          Show Active Only
        </label>
      </div>

      <ProductTable products={products} loading={loading} onEdit={openEditModal} onDelete={handleDeleteProduct} />

      {modalOpen && (
        <ProductFormModal
          editingProduct={editingProduct}
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

export default Products;
