const API_BASE = import.meta.env.VITE_API_URL || '';

const ACCESS_KEY = 'operly_access_token';
const REFRESH_KEY = 'operly_refresh_token';

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  setTokens: (accessToken, refreshToken) => {
    if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

let refreshPromise = null;

async function tryRefreshToken() {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) return null;
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        tokenStorage.clear();
        return null;
      }
      const data = await res.json();
      tokenStorage.setTokens(data.accessToken, data.refreshToken);
      return data.accessToken;
    } catch {
      tokenStorage.clear();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, headers = {}, auth = true, retry = true } = options;

  const reqHeaders = {
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...headers,
  };

  if (auth) {
    const token = tokenStorage.getAccess();
    if (token) {
      reqHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: reqHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth && retry && tokenStorage.getRefresh()) {
    const newAccess = await tryRefreshToken();
    if (newAccess) {
      return apiRequest(path, { ...options, retry: false });
    }
  }

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && (Array.isArray(data.message) ? data.message.join(', ') : data.message)) ||
      `Request failed with status ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const authApi = {
  login: (identifier, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      auth: false,
      body: { email: identifier, password },
    }),
  register: (payload) =>
    apiRequest('/auth/register', {
      method: 'POST',
      auth: false,
      body: payload,
    }),
  logout: () =>
    apiRequest('/auth/logout', {
      method: 'POST',
      body: { refreshToken: tokenStorage.getRefresh() || undefined },
    }),
  getMe: () => apiRequest('/auth/me'),
};

export const menuApi = {
  getCategories: () => apiRequest('/api/v1/categories', { auth: false }),
  createCategory: (payload) => apiRequest('/api/v1/categories', { method: 'POST', body: payload }),
  updateCategory: (id, payload) => apiRequest(`/api/v1/categories/${id}`, { method: 'PATCH', body: payload }),
  deleteCategory: (id) => apiRequest(`/api/v1/categories/${id}`, { method: 'DELETE' }),

  getDishes: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries({ limit: 100, ...params }).filter(([, v]) => v !== undefined && v !== ''),
    ).toString();
    return apiRequest(`/api/v1/dishes?${qs}`, { auth: false });
  },
  createDish: (payload) => apiRequest('/api/v1/dishes', { method: 'POST', body: payload }),
  updateDish: (id, payload) => apiRequest(`/api/v1/dishes/${id}`, { method: 'PATCH', body: payload }),
  toggleAvailability: (id, isAvailable) =>
    apiRequest(`/api/v1/dishes/${id}/availability`, { method: 'PATCH', body: { isAvailable } }),
  deleteDish: (id) => apiRequest(`/api/v1/dishes/${id}`, { method: 'DELETE' }),
};

export const tablesApi = {
  getTables: () => apiRequest('/api/v1/tables'),
  createTable: (payload) => apiRequest('/api/v1/tables', { method: 'POST', body: payload }),
  updateTable: (id, payload) => apiRequest(`/api/v1/tables/${id}`, { method: 'PATCH', body: payload }),
  updateTableStatus: (id, status) =>
    apiRequest(`/api/v1/tables/${id}/status`, { method: 'PATCH', body: { status } }),
};

export const ordersApi = {
  getOrders: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries({ limit: 100, ...params }).filter(([, v]) => v !== undefined && v !== ''),
    ).toString();
    return apiRequest(`/api/v1/orders?${qs}`);
  },
  createOrder: (payload) => apiRequest('/api/v1/orders', { method: 'POST', body: payload }),
  updateOrder: (id, payload) => apiRequest(`/api/v1/orders/${id}`, { method: 'PATCH', body: payload }),
  addOrderItems: (id, items) => apiRequest(`/api/v1/orders/${id}/items`, { method: 'POST', body: { items } }),
  updateOrderItemStatus: (orderId, itemId, status, rejectionReason) =>
    apiRequest(`/api/v1/orders/${orderId}/items/${itemId}/status`, {
      method: 'PATCH',
      body: { itemStatus: status, ...(rejectionReason ? { rejectionReason } : {}) },
    }),
};

export const kitchenApi = {
  getQueue: () => apiRequest('/api/v1/kitchen/queue'),
  updateItemStatus: (itemId, itemStatus, rejectionReason) =>
    apiRequest(`/api/v1/kitchen/items/${itemId}/status`, {
      method: 'PATCH',
      body: { itemStatus, ...(rejectionReason ? { rejectionReason } : {}) },
    }),
};

export const reservationsApi = {
  getReservations: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries({ limit: 100, ...params }).filter(([, v]) => v !== undefined && v !== ''),
    ).toString();
    return apiRequest(`/api/v1/reservations?${qs}`);
  },
  createReservation: (payload) => apiRequest('/api/v1/reservations', { method: 'POST', body: payload }),
  updateReservation: (id, payload) => apiRequest(`/api/v1/reservations/${id}`, { method: 'PATCH', body: payload }),
  updateStatus: (id, status) =>
    apiRequest(`/api/v1/reservations/${id}/status`, { method: 'PATCH', body: { status } }),
  cancelReservation: (id, reason) =>
    apiRequest(`/api/v1/reservations/${id}/cancel`, { method: 'PATCH', body: { reason } }),
};

export const inventoryApi = {
  getItems: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries({ limit: 100, ...params }).filter(([, v]) => v !== undefined && v !== ''),
    ).toString();
    return apiRequest(`/api/v1/inventory/items?${qs}`);
  },
  getLowStock: () => apiRequest('/api/v1/inventory/items/low-stock'),
  createItem: (payload) => apiRequest('/api/v1/inventory/items', { method: 'POST', body: payload }),
  updateItem: (id, payload) => apiRequest(`/api/v1/inventory/items/${id}`, { method: 'PATCH', body: payload }),
  createReceipt: (payload) => apiRequest('/api/v1/inventory/receipts', { method: 'POST', body: payload }),
  getReceipts: () => apiRequest('/api/v1/inventory/receipts'),
  createAdjustment: (payload) => apiRequest('/api/v1/inventory/adjustments', { method: 'POST', body: payload }),
  getMovements: () => apiRequest('/api/v1/inventory/movements'),
  setRecipe: (payload) => apiRequest('/api/v1/inventory/recipes', { method: 'POST', body: payload }),
  getRecipe: (menuItemId) => apiRequest(`/api/v1/inventory/recipes/${menuItemId}`),
};

export const billingApi = {
  getBills: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries({ limit: 100, ...params }).filter(([, v]) => v !== undefined && v !== ''),
    ).toString();
    return apiRequest(`/api/v1/billing/bills?${qs}`);
  },
  createBill: (payload) => apiRequest('/api/v1/billing/bills', { method: 'POST', body: payload }),
  processPayment: (billId, payload) =>
    apiRequest(`/api/v1/billing/bills/${billId}/payments`, { method: 'POST', body: payload }),
  createRefund: (paymentId, payload) =>
    apiRequest(`/api/v1/billing/payments/${paymentId}/refund`, { method: 'POST', body: payload }),
  getPromotions: () => apiRequest('/api/v1/billing/promotions'),
  getActivePromotions: () => apiRequest('/api/v1/billing/promotions/active'),
  createPromotion: (payload) => apiRequest('/api/v1/billing/promotions', { method: 'POST', body: payload }),
  togglePromotion: (id) => apiRequest(`/api/v1/billing/promotions/${id}/toggle`, { method: 'PATCH' }),
};

export const staffApi = {
  getStaff: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries({ limit: 100, ...params }).filter(([, v]) => v !== undefined && v !== ''),
    ).toString();
    return apiRequest(`/api/v1/staff?${qs}`);
  },
  createStaff: (payload) => apiRequest('/api/v1/staff', { method: 'POST', body: payload }),
  updateStaff: (id, payload) => apiRequest(`/api/v1/staff/${id}`, { method: 'PATCH', body: payload }),
  getShifts: () => apiRequest('/api/v1/staff/shifts'),
  createShift: (payload) => apiRequest('/api/v1/staff/shifts', { method: 'POST', body: payload }),
  assignShift: (payload) => apiRequest('/api/v1/staff/shifts/assign', { method: 'POST', body: payload }),
  getSchedule: (id) => apiRequest(`/api/v1/staff/${id}/schedule`),
};

export const attendanceApi = {
  getRecords: () => apiRequest('/api/v1/attendance/records'),
  getLeaveRequests: () => apiRequest('/api/v1/attendance/leave-requests'),
  reviewLeaveRequest: (id, status, reviewNote) =>
    apiRequest(`/api/v1/attendance/leave-requests/${id}/review`, {
      method: 'PATCH',
      body: { status, reviewNote },
    }),
};

export const analyticsApi = {
  getDashboard: () => apiRequest('/api/v1/analytics/dashboard'),
  getRevenue: (period = 'daily') => apiRequest(`/api/v1/analytics/revenue?period=${period}`),
  getRevenueForecast: (horizon = '7d') =>
    apiRequest(`/api/v1/analytics/revenue-forecast?horizon=${horizon}`),
  getDemandForecast: (days = 7) => apiRequest(`/api/v1/analytics/demand-forecast?days=${days}`),
  getProfitability: () => apiRequest('/api/v1/analytics/profitability'),
  getInventoryIntelligence: (days = 7) =>
    apiRequest(`/api/v1/analytics/inventory-intelligence?days=${days}`),
  getAnomalies: () => apiRequest('/api/v1/analytics/anomalies'),
  runAnomalyScan: () => apiRequest('/api/v1/analytics/anomalies/scan', { method: 'POST' }),
  updateAnomalyStatus: (id, status) =>
    apiRequest(`/api/v1/analytics/anomalies/${id}`, { method: 'PATCH', body: { status } }),
  getRecommendations: () => apiRequest('/api/v1/analytics/recommendations'),
  updateRecommendationStatus: (id, status) =>
    apiRequest(`/api/v1/analytics/recommendations/${id}`, { method: 'PATCH', body: { status } }),
};

export const adminApi = {
  getUsers: () => apiRequest('/api/v1/admin/users'),
  createUser: (payload) => apiRequest('/api/v1/admin/users', { method: 'POST', body: payload }),
  updateUser: (id, payload) => apiRequest(`/api/v1/admin/users/${id}`, { method: 'PATCH', body: payload }),
  toggleUserStatus: (id, isActive) =>
    apiRequest(`/api/v1/admin/users/${id}/status`, { method: 'PATCH', body: { isActive } }),
  getRoles: () => apiRequest('/api/v1/admin/roles'),
  getPermissions: () => apiRequest('/api/v1/admin/permissions'),
  updateRolePermissions: (id, permissionIds) =>
    apiRequest(`/api/v1/admin/roles/${id}/permissions`, {
      method: 'PATCH',
      body: { permissionIds },
    }),
  getAuditLogs: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== ''),
    ).toString();
    return apiRequest(`/api/v1/admin/audit-logs?${qs}`);
  },
  getConfig: () => apiRequest('/api/v1/admin/config'),
  updateConfig: (payload) => apiRequest('/api/v1/admin/config', { method: 'PATCH', body: payload }),
};
