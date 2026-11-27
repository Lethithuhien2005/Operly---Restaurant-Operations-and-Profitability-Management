import React, { useState, useEffect, useCallback } from 'react';
import {
  menuApi,
  inventoryApi,
  staffApi,
  attendanceApi,
  billingApi,
  reservationsApi,
  ordersApi,
  analyticsApi,
} from '../../api/client';
import { useMockStore } from '../../store/mockStore';

const THEME = {
  green: '#263d1c',
  cream: '#f8f4e8',
  gold: '#ead196',
  card: '#ffffff',
  border: '#dfd6be',
  muted: '#5a6b52',
};

const formatVND = (val) => `${Number(val || 0).toLocaleString('vi-VN')} ₫`;

export const ManagerDashboardView = ({ onNavigateTab }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi
      .getDashboard()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 24, color: THEME.muted }}>Loading operational dashboard...</div>;
  const kpis = data?.kpis || {};

  const cards = [
    { label: 'Total Revenue', value: formatVND(kpis.totalRevenue), sub: `Margin: ${kpis.grossMarginPct || 0}%`, tab: 'fi-revenue-analytics' },
    { label: 'Gross Profit', value: formatVND(kpis.grossProfit), sub: `COGS: ${formatVND(kpis.totalCost)}`, tab: 'fi-menu-profitability' },
    { label: 'Orders (Active / Total)', value: `${kpis.activeOrders || 0} / ${kpis.totalOrders || 0}`, sub: `Tables Occupied: ${kpis.occupiedTables || 0}/${kpis.totalTables || 0}`, tab: 'orders' },
    { label: 'Pending Reservations', value: kpis.pendingReservations || 0, sub: 'Upcoming bookings', tab: 'reservations' },
    { label: 'Low Stock Alerts', value: kpis.lowStockCount || 0, sub: 'Ingredients below threshold', tab: 'inventory' },
    { label: 'AI Alerts & Actions', value: `${kpis.openAnomaliesCount || 0} / ${kpis.pendingRecommendationsCount || 0}`, sub: 'Anomalies / Recommendations', tab: 'fi-recommendations' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        {cards.map((c) => (
          <div
            key={c.label}
            onClick={() => onNavigateTab(c.tab)}
            style={{
              backgroundColor: THEME.card,
              border: `1px solid ${THEME.border}`,
              borderLeft: `4px solid ${THEME.green}`,
              borderRadius: 12,
              padding: 16,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(38,61,28,0.05)',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: THEME.muted, textTransform: 'uppercase' }}>{c.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: THEME.green, marginTop: 6 }}>{c.value}</div>
            <div style={{ fontSize: 11, color: THEME.muted, marginTop: 4 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        {/* Top Selling Dishes */}
        <div style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: THEME.green, marginBottom: 12 }}>Top Selling Dishes</h3>
          {!data?.topDishes?.length ? (
            <div style={{ fontSize: 13, color: THEME.muted }}>No order item sales recorded yet.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${THEME.border}`, textAlign: 'left', color: THEME.muted }}>
                  <th style={{ padding: '6px 4px' }}>Dish</th>
                  <th style={{ padding: '6px 4px' }}>Qty</th>
                  <th style={{ padding: '6px 4px', textAlign: 'right' }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.topDishes.map((d) => (
                  <tr key={d.id} style={{ borderBottom: `1px solid ${THEME.cream}` }}>
                    <td style={{ padding: '8px 4px', fontWeight: 700, color: THEME.green }}>{d.name}</td>
                    <td style={{ padding: '8px 4px' }}>{d.qty}</td>
                    <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 700 }}>{formatVND(d.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Low Stock Ingredients */}
        <div style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: THEME.green, marginBottom: 12 }}>Low Stock Warnings</h3>
          {!data?.lowStockItems?.length ? (
            <div style={{ fontSize: 13, color: THEME.muted }}>All inventory items are above minimum thresholds.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.lowStockItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    backgroundColor: THEME.cream,
                    borderRadius: 8,
                    border: `1px solid ${THEME.border}`,
                  }}
                >
                  <span style={{ fontWeight: 700, color: THEME.green }}>{item.itemName}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#991b1b' }}>
                    {item.currentStock} / {item.minAlertThreshold} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ManagerMenuPricingView = () => {
  const { showToast, loadPublicMenu } = useMockStore();
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', categoryId: '', price: '', costPrice: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editCost, setEditCost] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, dRes] = await Promise.all([menuApi.getCategories(), menuApi.getDishes()]);
      const cats = Array.isArray(cRes) ? cRes : cRes?.data || [];
      const dishList = Array.isArray(dRes) ? dRes : dRes?.data || [];
      setCategories(cats);
      setDishes(dishList);
      if (cats.length > 0 && !form.categoryId) {
        setForm((f) => ({ ...f, categoryId: cats[0].id }));
      }
    } catch (err) {
      showToast(`Failed to load menu: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [showToast, form.categoryId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.categoryId || !form.price) return;
    try {
      await menuApi.createDish({
        name: form.name,
        categoryId: form.categoryId,
        price: Number(form.price),
        costPrice: form.costPrice ? Number(form.costPrice) : undefined,
        description: form.description || undefined,
      });
      showToast(`Created dish "${form.name}"`);
      setForm((f) => ({ ...f, name: '', price: '', costPrice: '', description: '' }));
      await loadData();
      await loadPublicMenu();
    } catch (err) {
      showToast(`Create failed: ${err.message}`);
    }
  };

  const handleSavePrice = async (id) => {
    try {
      await menuApi.updateDish(id, {
        price: Number(editPrice),
        ...(editCost ? { costPrice: Number(editCost) } : {}),
      });
      setEditingId(null);
      showToast('Updated dish pricing.');
      await loadData();
      await loadPublicMenu();
    } catch (err) {
      showToast(`Update failed: ${err.message}`);
    }
  };

  const handleToggleAvail = async (dish) => {
    try {
      await menuApi.toggleAvailability(dish.id, !dish.isAvailable);
      showToast(`${dish.name} is now ${!dish.isAvailable ? 'Available' : 'Unavailable (86)'}`);
      await loadData();
      await loadPublicMenu();
    } catch (err) {
      showToast(`Toggle failed: ${err.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <form
        onSubmit={handleCreate}
        style={{
          backgroundColor: THEME.card,
          border: `1px solid ${THEME.border}`,
          borderRadius: 12,
          padding: 16,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 10,
          alignItems: 'end',
        }}
      >
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: THEME.muted }}>Dish Name *</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Wagyu Hotpot"
            required
            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: `1px solid ${THEME.border}`, marginTop: 4 }}
          />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: THEME.muted }}>Category *</label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: `1px solid ${THEME.border}`, marginTop: 4 }}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: THEME.muted }}>Selling Price (VND) *</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="150000"
            required
            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: `1px solid ${THEME.border}`, marginTop: 4 }}
          />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: THEME.muted }}>Cost Price (COGS)</label>
          <input
            type="number"
            value={form.costPrice}
            onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
            placeholder="55000"
            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: `1px solid ${THEME.border}`, marginTop: 4 }}
          />
        </div>
        <button
          type="submit"
          style={{
            backgroundColor: THEME.green,
            color: THEME.cream,
            padding: '9px 14px',
            borderRadius: 8,
            fontWeight: 800,
            fontSize: 13,
          }}
        >
          + Add Dish
        </button>
      </form>

      <div style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 16, overflowX: 'auto' }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: THEME.green, marginBottom: 12 }}>
          Menu & Pricing Catalog ({dishes.length} items)
        </h3>
        {loading ? (
          <div style={{ color: THEME.muted }}>Loading menu items...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${THEME.border}`, textAlign: 'left', color: THEME.muted }}>
                <th style={{ padding: 8 }}>Dish Name</th>
                <th style={{ padding: 8 }}>Category</th>
                <th style={{ padding: 8 }}>Selling Price</th>
                <th style={{ padding: 8 }}>Cost Price</th>
                <th style={{ padding: 8 }}>Status</th>
                <th style={{ padding: 8 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dishes.map((d) => (
                <tr key={d.id} style={{ borderBottom: `1px solid ${THEME.cream}` }}>
                  <td style={{ padding: 8, fontWeight: 700, color: THEME.green }}>{d.name}</td>
                  <td style={{ padding: 8 }}>{d.category?.name || 'General'}</td>
                  <td style={{ padding: 8 }}>
                    {editingId === d.id ? (
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        style={{ width: 100, padding: '4px 6px', border: `1px solid ${THEME.green}`, borderRadius: 4 }}
                      />
                    ) : (
                      <strong>{formatVND(d.price)}</strong>
                    )}
                  </td>
                  <td style={{ padding: 8 }}>
                    {editingId === d.id ? (
                      <input
                        type="number"
                        value={editCost}
                        onChange={(e) => setEditCost(e.target.value)}
                        style={{ width: 100, padding: '4px 6px', border: `1px solid ${THEME.green}`, borderRadius: 4 }}
                      />
                    ) : (
                      formatVND(d.costPrice || 0)
                    )}
                  </td>
                  <td style={{ padding: 8 }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 9999,
                        fontSize: 11,
                        fontWeight: 700,
                        backgroundColor: d.isAvailable ? '#dcfce7' : '#fee2e2',
                        color: d.isAvailable ? '#166534' : '#991b1b',
                      }}
                    >
                      {d.isAvailable ? 'Available' : 'Out of Stock'}
                    </span>
                  </td>
                  <td style={{ padding: 8, display: 'flex', gap: 6 }}>
                    {editingId === d.id ? (
                      <button
                        onClick={() => handleSavePrice(d.id)}
                        style={{ backgroundColor: THEME.green, color: THEME.cream, padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(d.id);
                          setEditPrice(String(Number(d.price)));
                          setEditCost(String(Number(d.costPrice || 0)));
                        }}
                        style={{ backgroundColor: THEME.gold, color: THEME.green, padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}
                      >
                        Edit Price
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleAvail(d)}
                      style={{ backgroundColor: THEME.cream, border: `1px solid ${THEME.border}`, color: THEME.green, padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}
                    >
                      {d.isAvailable ? 'Mark 86' : 'Restore'}
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await menuApi.deleteDish(d.id);
                          showToast(`Deleted dish "${d.name}"`);
                          await loadData();
                          await loadPublicMenu();
                        } catch (err) {
                          showToast(`Cannot delete: ${err.message}`);
                        }
                      }}
                      style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export const ManagerInventoryView = () => {
  const { showToast } = useMockStore();
  const [items, setItems] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [selectedDishId, setSelectedDishId] = useState('');
  const [bomRows, setBomRows] = useState([]);
  const [newItem, setNewItem] = useState({ itemName: '', unit: 'kg', currentStock: '', minAlertThreshold: '' });
  const [receiptForm, setReceiptForm] = useState({ inventoryItemId: '', quantity: '', unitPrice: '', supplierName: '' });

  const loadData = useCallback(async () => {
    try {
      const [invRes, dishRes] = await Promise.all([inventoryApi.getItems(), menuApi.getDishes()]);
      const invList = Array.isArray(invRes) ? invRes : invRes?.data || [];
      const dishList = Array.isArray(dishRes) ? dishRes : dishRes?.data || [];
      setItems(invList);
      setDishes(dishList);
      if (invList.length > 0 && !receiptForm.inventoryItemId) {
        setReceiptForm((r) => ({ ...r, inventoryItemId: invList[0].id }));
      }
      if (dishList.length > 0 && !selectedDishId) {
        setSelectedDishId(dishList[0].id);
      }
    } catch (err) {
      showToast(`Failed to load inventory: ${err.message}`);
    }
  }, [showToast, receiptForm.inventoryItemId, selectedDishId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!selectedDishId) return;
    inventoryApi
      .getRecipe(selectedDishId)
      .then((res) => setBomRows(Array.isArray(res) ? res : res?.recipes || []))
      .catch(() => setBomRows([]));
  }, [selectedDishId]);

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      await inventoryApi.createItem({
        itemName: newItem.itemName,
        unit: newItem.unit,
        currentStock: Number(newItem.currentStock || 0),
        minAlertThreshold: Number(newItem.minAlertThreshold || 0),
      });
      showToast(`Added ingredient "${newItem.itemName}"`);
      setNewItem({ itemName: '', unit: 'kg', currentStock: '', minAlertThreshold: '' });
      loadData();
    } catch (err) {
      showToast(`Error: ${err.message}`);
    }
  };

  const handleStockIn = async (e) => {
    e.preventDefault();
    if (!receiptForm.inventoryItemId || !receiptForm.quantity) return;
    try {
      await inventoryApi.createReceipt({
        supplierName: receiptForm.supplierName || 'Local Supplier',
        items: [
          {
            inventoryItemId: receiptForm.inventoryItemId,
            quantity: Number(receiptForm.quantity),
            unitPrice: Number(receiptForm.unitPrice || 0),
          },
        ],
      });
      showToast('Stock receipt recorded and inventory updated!');
      setReceiptForm((r) => ({ ...r, quantity: '', unitPrice: '' }));
      loadData();
    } catch (err) {
      showToast(`Stock receipt error: ${err.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
        <form onSubmit={handleCreateItem} style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 16 }}>
          <h4 style={{ fontSize: 14, fontWeight: 800, color: THEME.green, marginBottom: 10 }}>+ New Ingredient</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input placeholder="Ingredient Name" required value={newItem.itemName} onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })} style={{ padding: 8, borderRadius: 6, border: `1px solid ${THEME.border}` }} />
            <input placeholder="Unit (kg, L, pcs)" required value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })} style={{ padding: 8, borderRadius: 6, border: `1px solid ${THEME.border}` }} />
            <input type="number" step="0.01" placeholder="Initial Stock" value={newItem.currentStock} onChange={(e) => setNewItem({ ...newItem, currentStock: e.target.value })} style={{ padding: 8, borderRadius: 6, border: `1px solid ${THEME.border}` }} />
            <input type="number" step="0.01" placeholder="Min Alert Threshold" value={newItem.minAlertThreshold} onChange={(e) => setNewItem({ ...newItem, minAlertThreshold: e.target.value })} style={{ padding: 8, borderRadius: 6, border: `1px solid ${THEME.border}` }} />
          </div>
          <button type="submit" style={{ marginTop: 10, backgroundColor: THEME.green, color: THEME.cream, padding: '8px 14px', borderRadius: 8, fontWeight: 700, fontSize: 12 }}>
            Add Ingredient
          </button>
        </form>

        <form onSubmit={handleStockIn} style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 16 }}>
          <h4 style={{ fontSize: 14, fontWeight: 800, color: THEME.green, marginBottom: 10 }}>Stock-In Receipt (Nhập Kho)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <select value={receiptForm.inventoryItemId} onChange={(e) => setReceiptForm({ ...receiptForm, inventoryItemId: e.target.value })} style={{ padding: 8, borderRadius: 6, border: `1px solid ${THEME.border}` }}>
              {items.map((i) => (
                <option key={i.id} value={i.id}>{i.itemName} ({i.unit})</option>
              ))}
            </select>
            <input placeholder="Supplier Name" value={receiptForm.supplierName} onChange={(e) => setReceiptForm({ ...receiptForm, supplierName: e.target.value })} style={{ padding: 8, borderRadius: 6, border: `1px solid ${THEME.border}` }} />
            <input type="number" step="0.01" required placeholder="Quantity" value={receiptForm.quantity} onChange={(e) => setReceiptForm({ ...receiptForm, quantity: e.target.value })} style={{ padding: 8, borderRadius: 6, border: `1px solid ${THEME.border}` }} />
            <input type="number" required placeholder="Unit Price (VND)" value={receiptForm.unitPrice} onChange={(e) => setReceiptForm({ ...receiptForm, unitPrice: e.target.value })} style={{ padding: 8, borderRadius: 6, border: `1px solid ${THEME.border}` }} />
          </div>
          <button type="submit" style={{ marginTop: 10, backgroundColor: THEME.gold, color: THEME.green, padding: '8px 14px', borderRadius: 8, fontWeight: 800, fontSize: 12 }}>
            Record Stock Receipt
          </button>
        </form>
      </div>

      <div style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 16, overflowX: 'auto' }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: THEME.green, marginBottom: 10 }}>Inventory Stock Levels ({items.length})</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${THEME.border}`, textAlign: 'left', color: THEME.muted }}>
              <th style={{ padding: 8 }}>Ingredient</th>
              <th style={{ padding: 8 }}>Unit</th>
              <th style={{ padding: 8 }}>Current Stock</th>
              <th style={{ padding: 8 }}>Min Threshold</th>
              <th style={{ padding: 8 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => {
              const isLow = Number(i.currentStock) <= Number(i.minAlertThreshold);
              return (
                <tr key={i.id} style={{ borderBottom: `1px solid ${THEME.cream}` }}>
                  <td style={{ padding: 8, fontWeight: 700, color: THEME.green }}>{i.itemName}</td>
                  <td style={{ padding: 8 }}>{i.unit}</td>
                  <td style={{ padding: 8, fontWeight: 700 }}>{Number(i.currentStock)}</td>
                  <td style={{ padding: 8 }}>{Number(i.minAlertThreshold)}</td>
                  <td style={{ padding: 8 }}>
                    <span style={{ padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 700, backgroundColor: isLow ? '#fee2e2' : '#dcfce7', color: isLow ? '#991b1b' : '#166534' }}>
                      {isLow ? 'Low Stock' : 'Healthy'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: THEME.green }}>Recipe / BOM Viewer</h3>
          <select value={selectedDishId} onChange={(e) => setSelectedDishId(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${THEME.border}` }}>
            {dishes.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        {bomRows.length === 0 ? (
          <div style={{ fontSize: 13, color: THEME.muted }}>No BOM ingredients mapped for this dish yet.</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {bomRows.map((r) => (
              <div key={r.id} style={{ backgroundColor: THEME.cream, border: `1px solid ${THEME.border}`, padding: '8px 12px', borderRadius: 8, fontSize: 13 }}>
                <strong>{r.inventoryItem?.itemName || 'Ingredient'}</strong>: {Number(r.quantityRequired)} {r.inventoryItem?.unit || ''} / serving
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const ManagerStaffShiftsView = () => {
  const { showToast } = useMockStore();
  const [staff, setStaff] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [sRes, shRes, attRes, lvRes] = await Promise.all([
        staffApi.getStaff(),
        staffApi.getShifts(),
        attendanceApi.getRecords().catch(() => []),
        attendanceApi.getLeaveRequests(),
      ]);
      setStaff(Array.isArray(sRes) ? sRes : sRes?.data || []);
      setShifts(Array.isArray(shRes) ? shRes : shRes?.data || []);
      setAttendance(Array.isArray(attRes) ? attRes : attRes?.data || []);
      setLeaves(Array.isArray(lvRes) ? lvRes : lvRes?.data || []);
    } catch (err) {
      showToast(`Failed to load staff data: ${err.message}`);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleViewSchedule = async (staffMember) => {
    try {
      const res = await staffApi.getSchedule(staffMember.id);
      const list = Array.isArray(res) ? res : res?.schedule || res?.data || [];
      setSelectedSchedule({ name: staffMember.fullName, items: list });
    } catch (err) {
      showToast(`Failed to load schedule: ${err.message}`);
    }
  };

  const handleReviewLeave = async (id, status) => {
    try {
      await attendanceApi.reviewLeaveRequest(id, status, `Reviewed by Manager (${status})`);
      showToast(`Leave request ${status.toLowerCase()}`);
      loadData();
    } catch (err) {
      showToast(`Review failed: ${err.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ backgroundColor: THEME.cream, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 12, color: THEME.muted }}>
        <strong>RBAC Scope:</strong> Managers can view staff directory, shift schedules, attendance records, and approve/reject leave requests. Shift creation and assignment are restricted to Admin/HR provisioning.
      </div>

      <div style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: THEME.green, marginBottom: 10 }}>Restaurant Staff Directory ({staff.length})</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${THEME.border}`, textAlign: 'left', color: THEME.muted }}>
              <th style={{ padding: 8 }}>Name</th>
              <th style={{ padding: 8 }}>Role</th>
              <th style={{ padding: 8 }}>Phone</th>
              <th style={{ padding: 8 }}>Email</th>
              <th style={{ padding: 8 }}>Status</th>
              <th style={{ padding: 8 }}>Schedule</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} style={{ borderBottom: `1px solid ${THEME.cream}` }}>
                <td style={{ padding: 8, fontWeight: 700, color: THEME.green }}>{s.fullName}</td>
                <td style={{ padding: 8 }}><span style={{ backgroundColor: THEME.gold, color: THEME.green, padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 800 }}>{s.role?.name || s.role}</span></td>
                <td style={{ padding: 8 }}>{s.phone}</td>
                <td style={{ padding: 8 }}>{s.email || '—'}</td>
                <td style={{ padding: 8 }}>{s.isActive ? 'Active' : 'Inactive'}</td>
                <td style={{ padding: 8 }}>
                  <button onClick={() => handleViewSchedule(s)} style={{ backgroundColor: THEME.cream, border: `1px solid ${THEME.border}`, color: THEME.green, padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                    View Schedule
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {selectedSchedule && (
          <div style={{ marginTop: 12, padding: 12, backgroundColor: THEME.cream, borderRadius: 8, border: `1px solid ${THEME.border}` }}>
            <strong style={{ color: THEME.green }}>Schedule for {selectedSchedule.name}:</strong>{' '}
            {selectedSchedule.items.length === 0 ? 'No shifts assigned.' : selectedSchedule.items.map((a) => `${new Date(a.assignedDate).toLocaleDateString()} (${a.shift?.name || 'Shift'})`).join(', ')}
          </div>
        )}
      </div>

      <div style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: THEME.green, marginBottom: 10 }}>Shift Definitions ({shifts.length}) & Attendance Records ({attendance.length})</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {shifts.map((sh) => (
            <span key={sh.id} style={{ backgroundColor: THEME.cream, border: `1px solid ${THEME.border}`, padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, color: THEME.green }}>
              {sh.name}: {sh.startTime} - {sh.endTime}
            </span>
          ))}
        </div>
        {attendance.length === 0 ? (
          <div style={{ fontSize: 13, color: THEME.muted }}>No attendance punch records yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {attendance.slice(0, 10).map((att) => (
              <div key={att.id} style={{ fontSize: 12, padding: '6px 10px', backgroundColor: THEME.cream, borderRadius: 6 }}>
                <strong>{att.user?.fullName || 'Staff'}</strong> • {att.status} • In: {att.checkInTime ? new Date(att.checkInTime).toLocaleString() : '—'}
              </div>
            ))}
          </div>
        )}
      </div>

      {leaves.length > 0 && (
        <div style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: THEME.green, marginBottom: 10 }}>Leave Requests</h3>
          {leaves.map((l) => (
            <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderBottom: `1px solid ${THEME.cream}` }}>
              <div>
                <strong>{l.user?.fullName || 'Staff'}</strong> • {new Date(l.startDate).toLocaleDateString()} → {new Date(l.endDate).toLocaleDateString()}
                <div style={{ fontSize: 12, color: THEME.muted }}>{l.reason} ({l.status})</div>
              </div>
              {l.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleReviewLeave(l.id, 'APPROVED')} style={{ backgroundColor: THEME.green, color: THEME.cream, padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>Approve</button>
                  <button onClick={() => handleReviewLeave(l.id, 'REJECTED')} style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const ManagerPromotionsView = () => {
  const { showToast } = useMockStore();
  const [promos, setPromos] = useState([]);
  const [form, setForm] = useState({
    code: '',
    description: '',
    discountPercent: '10',
    minOrderAmount: '200000',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  });

  const loadData = useCallback(async () => {
    try {
      const res = await billingApi.getPromotions();
      setPromos(Array.isArray(res) ? res : res?.data || []);
    } catch (err) {
      showToast(`Failed to load promotions: ${err.message}`);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await billingApi.createPromotion({
        code: form.code,
        description: form.description,
        discountPercent: Number(form.discountPercent),
        minOrderAmount: Number(form.minOrderAmount || 0),
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      });
      showToast(`Promotion "${form.code.toUpperCase()}" created!`);
      setForm((f) => ({ ...f, code: '', description: '' }));
      loadData();
    } catch (err) {
      showToast(`Error: ${err.message}`);
    }
  };

  const handleToggle = async (id) => {
    try {
      await billingApi.togglePromotion(id);
      showToast('Promotion status updated.');
      loadData();
    } catch (err) {
      showToast(`Error: ${err.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <form onSubmit={handleCreate} style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, alignItems: 'end' }}>
        <input required placeholder="Voucher Code (e.g. VIP20)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} style={{ padding: 8, borderRadius: 6, border: `1px solid ${THEME.border}` }} />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ padding: 8, borderRadius: 6, border: `1px solid ${THEME.border}` }} />
        <input type="number" placeholder="Discount %" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: e.target.value })} style={{ padding: 8, borderRadius: 6, border: `1px solid ${THEME.border}` }} />
        <input type="number" placeholder="Min Order (VND)" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} style={{ padding: 8, borderRadius: 6, border: `1px solid ${THEME.border}` }} />
        <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} style={{ padding: 8, borderRadius: 6, border: `1px solid ${THEME.border}` }} />
        <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} style={{ padding: 8, borderRadius: 6, border: `1px solid ${THEME.border}` }} />
        <button type="submit" style={{ backgroundColor: THEME.green, color: THEME.cream, padding: '9px 14px', borderRadius: 8, fontWeight: 800, fontSize: 13 }}>
          + Create Promo
        </button>
      </form>

      <div style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: THEME.green, marginBottom: 10 }}>Promotions & Vouchers ({promos.length})</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${THEME.border}`, textAlign: 'left', color: THEME.muted }}>
              <th style={{ padding: 8 }}>Code</th>
              <th style={{ padding: 8 }}>Description</th>
              <th style={{ padding: 8 }}>Discount</th>
              <th style={{ padding: 8 }}>Validity</th>
              <th style={{ padding: 8 }}>Status</th>
              <th style={{ padding: 8 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {promos.map((p) => (
              <tr key={p.id} style={{ borderBottom: `1px solid ${THEME.cream}` }}>
                <td style={{ padding: 8, fontWeight: 800, color: THEME.green }}>{p.code}</td>
                <td style={{ padding: 8 }}>{p.description || '—'}</td>
                <td style={{ padding: 8 }}>{p.discountPercent ? `${p.discountPercent}%` : formatVND(p.discountAmount)}</td>
                <td style={{ padding: 8, fontSize: 12 }}>{new Date(p.startDate).toLocaleDateString()} → {new Date(p.endDate).toLocaleDateString()}</td>
                <td style={{ padding: 8 }}>
                  <span style={{ padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 700, backgroundColor: p.isActive ? '#dcfce7' : '#fee2e2', color: p.isActive ? '#166534' : '#991b1b' }}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: 8 }}>
                  <button onClick={() => handleToggle(p.id)} style={{ backgroundColor: THEME.gold, color: THEME.green, padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                    {p.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const ManagerReservationsView = () => {
  const { showToast } = useMockStore();
  const [list, setList] = useState([]);

  const loadData = useCallback(async () => {
    try {
      const res = await reservationsApi.getReservations();
      setList(Array.isArray(res) ? res : res?.data || []);
    } catch (err) {
      showToast(`Failed to load reservations: ${err.message}`);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatus = async (id, status) => {
    try {
      await reservationsApi.updateStatus(id, status);
      showToast(`Reservation updated to ${status}`);
      loadData();
    } catch (err) {
      showToast(`Error: ${err.message}`);
    }
  };

  return (
    <div style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 16 }}>
      <h3 style={{ fontSize: 15, fontWeight: 800, color: THEME.green, marginBottom: 12 }}>Table Reservations ({list.length})</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${THEME.border}`, textAlign: 'left', color: THEME.muted }}>
            <th style={{ padding: 8 }}>Guest</th>
            <th style={{ padding: 8 }}>Phone</th>
            <th style={{ padding: 8 }}>Party Size</th>
            <th style={{ padding: 8 }}>Time</th>
            <th style={{ padding: 8 }}>Table</th>
            <th style={{ padding: 8 }}>Status</th>
            <th style={{ padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.map((r) => (
            <tr key={r.id} style={{ borderBottom: `1px solid ${THEME.cream}` }}>
              <td style={{ padding: 8, fontWeight: 700, color: THEME.green }}>{r.guestName}</td>
              <td style={{ padding: 8 }}>{r.guestPhone}</td>
              <td style={{ padding: 8 }}>{r.partySize} guests</td>
              <td style={{ padding: 8 }}>{new Date(r.reservationTime).toLocaleString()}</td>
              <td style={{ padding: 8 }}>{r.table?.tableNumber || 'Unassigned'}</td>
              <td style={{ padding: 8 }}>
                <span style={{ backgroundColor: THEME.gold, color: THEME.green, padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 700 }}>{r.status}</span>
              </td>
              <td style={{ padding: 8, display: 'flex', gap: 6 }}>
                {r.status === 'PENDING' && (
                  <button onClick={() => handleStatus(r.id, 'CONFIRMED')} style={{ backgroundColor: THEME.green, color: THEME.cream, padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                    Confirm
                  </button>
                )}
                {['PENDING', 'CONFIRMED'].includes(r.status) && (
                  <button onClick={() => handleStatus(r.id, 'CANCELLED')} style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                    Cancel
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const ManagerOrdersView = () => {
  const { showToast } = useMockStore();
  const [orders, setOrders] = useState([]);

  const loadData = useCallback(async () => {
    try {
      const res = await ordersApi.getOrders();
      setOrders(Array.isArray(res) ? res : res?.data || []);
    } catch (err) {
      showToast(`Failed to load orders: ${err.message}`);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatus = async (id, status) => {
    try {
      await ordersApi.updateOrder(id, { status });
      showToast(`Order updated to ${status}`);
      loadData();
    } catch (err) {
      showToast(`Error: ${err.message}`);
    }
  };

  return (
    <div style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 16 }}>
      <h3 style={{ fontSize: 15, fontWeight: 800, color: THEME.green, marginBottom: 12 }}>Restaurant Orders ({orders.length})</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${THEME.border}`, textAlign: 'left', color: THEME.muted }}>
            <th style={{ padding: 8 }}>Order Code</th>
            <th style={{ padding: 8 }}>Table</th>
            <th style={{ padding: 8 }}>Items</th>
            <th style={{ padding: 8 }}>Total</th>
            <th style={{ padding: 8 }}>Status</th>
            <th style={{ padding: 8 }}>Created</th>
            <th style={{ padding: 8 }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} style={{ borderBottom: `1px solid ${THEME.cream}` }}>
              <td style={{ padding: 8, fontWeight: 800, color: THEME.green }}>{o.orderCode}</td>
              <td style={{ padding: 8 }}>{o.session?.table?.tableNumber || 'N/A'}</td>
              <td style={{ padding: 8 }}>{o.orderItems?.map((i) => `${i.quantity}x ${i.menuItem?.name || 'Item'}`).join(', ') || '—'}</td>
              <td style={{ padding: 8, fontWeight: 700 }}>{formatVND(o.totalAmount)}</td>
              <td style={{ padding: 8 }}>
                <span style={{ backgroundColor: THEME.gold, color: THEME.green, padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 700 }}>{o.status}</span>
              </td>
              <td style={{ padding: 8, fontSize: 12 }}>{new Date(o.createdAt).toLocaleString()}</td>
              <td style={{ padding: 8 }}>
                {o.status !== 'COMPLETED' && o.status !== 'CANCELLED' && (
                  <button onClick={() => handleStatus(o.id, 'COMPLETED')} style={{ backgroundColor: THEME.green, color: THEME.cream, padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                    Mark Completed
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
