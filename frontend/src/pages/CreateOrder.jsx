import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { LoadingState, PageHeader } from '../components/ui';
import {
  BackToOrders,
  CartBuilder,
  CustomerSelect,
  OrderSummary
} from '../components/orders/CreateOrderSections';

function CreateOrder({ showToast }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [builderForm, setBuilderForm] = useState({ productId: '', quantity: 1 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadFormData = async () => {
      setLoading(true);
      try {
        const [customersData, productsData] = await Promise.all([
          api.getCustomers(),
          api.getProducts({ active_only: true })
        ]);
        setCustomers(customersData);
        setProducts(productsData);
      } catch (err) {
        showToast('Failed to load forms data', err.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, []);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === parseInt(builderForm.productId, 10)),
    [products, builderForm.productId]
  );

  const updateBuilderForm = (changes) => {
    setBuilderForm((current) => ({ ...current, ...changes }));
  };

  const handleAddItem = (event) => {
    event.preventDefault();
    if (!builderForm.productId) return showToast('Error', 'Please select a product first', 'error');

    const quantity = parseInt(builderForm.quantity, 10);
    if (isNaN(quantity) || quantity <= 0) return showToast('Error', 'Quantity must be 1 or more', 'error');
    if (!selectedProduct) return;

    const existingIndex = orderItems.findIndex((item) => item.product_id === selectedProduct.id);
    const existingQuantity = existingIndex >= 0 ? orderItems[existingIndex].quantity : 0;
    const targetQuantity = existingQuantity + quantity;

    if (selectedProduct.stock_quantity < targetQuantity) {
      showToast('Insufficient Stock', `Cannot add ${quantity} units. '${selectedProduct.name}' only has ${selectedProduct.stock_quantity} units available in stock, and you already have ${existingQuantity} in your cart.`, 'error');
      return;
    }

    if (existingIndex >= 0) {
      const updated = [...orderItems];
      updated[existingIndex].quantity = targetQuantity;
      setOrderItems(updated);
    } else {
      setOrderItems([...orderItems, {
        product_id: selectedProduct.id,
        name: selectedProduct.name,
        sku: selectedProduct.sku,
        price: parseFloat(selectedProduct.price),
        quantity
      }]);
    }

    setBuilderForm({ productId: '', quantity: 1 });
    showToast('Item Added', `'${selectedProduct.name}' added to order`, 'info');
  };

  const handleRemoveItem = (index) => {
    const item = orderItems[index];
    setOrderItems(orderItems.filter((_, itemIndex) => itemIndex !== index));
    showToast('Item Removed', `'${item.name}' removed from order`, 'info');
  };

  const handleQtyChange = (index, nextQuantity) => {
    const quantity = parseInt(nextQuantity, 10);
    if (isNaN(quantity) || quantity <= 0) return;

    const product = products.find((item) => item.id === orderItems[index].product_id);
    if (!product || product.stock_quantity < quantity) {
      showToast('Insufficient Stock', `Only ${product?.stock_quantity || 0} units of '${product?.name || 'this product'}' are available.`, 'error');
      return;
    }

    const updated = [...orderItems];
    updated[index].quantity = quantity;
    setOrderItems(updated);
  };

  const handlePlaceOrder = async () => {
    if (!selectedCustomerId) return showToast('Validation Error', 'Please select a customer for this order.', 'error');
    if (orderItems.length === 0) return showToast('Validation Error', 'Your order must contain at least one item.', 'error');

    setIsSubmitting(true);
    try {
      await api.createOrder({
        customer_id: parseInt(selectedCustomerId, 10),
        items: orderItems.map(({ product_id, quantity }) => ({ product_id, quantity }))
      });
      showToast('Success', 'Order created and stock reserved successfully!', 'success');
      navigate('/orders');
    } catch (err) {
      showToast('Order Placement Failed', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading order builder variables..." />;

  return (
    <div className="page-container">
      <BackToOrders />
      <PageHeader title="Create Customer Order" subtitle="Assemble products and reserve stock in real-time" />

      <div className="order-builder-layout">
        <div>
          <CustomerSelect customers={customers} value={selectedCustomerId} onChange={setSelectedCustomerId} />
          <CartBuilder items={orderItems} products={products} selectedProduct={selectedProduct} form={builderForm} onFormChange={updateBuilderForm} onAddItem={handleAddItem} onQtyChange={handleQtyChange} onRemove={handleRemoveItem} />
        </div>
        <OrderSummary items={orderItems} submitting={isSubmitting} selectedCustomerId={selectedCustomerId} onPlaceOrder={handlePlaceOrder} />
      </div>
    </div>
  );
}

export default CreateOrder;
