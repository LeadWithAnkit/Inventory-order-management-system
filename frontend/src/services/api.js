const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }
  
  if (!response.ok) {
    const errorMsg = data?.detail || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }
  
  return data;
}

export const api = {
  // Products API
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    if (params.active_only) query.append('active_only', 'true');
    if (params.search) query.append('search', params.search);
    return request(`/products/?${query.toString()}`);
  },
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (product) => request('/products/', { method: 'POST', body: JSON.stringify(product) }),
  updateProduct: (id, product) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(product) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // Customers API
  getCustomers: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    return request(`/customers/?${query.toString()}`);
  },
  getCustomer: (id) => request(`/customers/${id}`),
  createCustomer: (customer) => request('/customers/', { method: 'POST', body: JSON.stringify(customer) }),
  updateCustomer: (id, customer) => request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(customer) }),
  deleteCustomer: (id) => request(`/customers/${id}`, { method: 'DELETE' }),

  // Orders API
  getOrders: () => request('/orders/'),
  getOrder: (id) => request(`/orders/${id}`),
  createOrder: (order) => request('/orders/', { method: 'POST', body: JSON.stringify(order) }),
  updateOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  cancelOrder: (id) => request(`/orders/${id}`, { method: 'DELETE' }),
  
  // Health
  checkHealth: () => request('/health/').catch(err => ({ status: 'unhealthy', detail: err.message }))
};
export default api;
