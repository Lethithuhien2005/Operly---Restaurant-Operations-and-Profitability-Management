import React, { useState, useMemo } from 'react';
import { MOCK_INVENTORY_OPTIMIZATION_DATA } from '../../../mock/adminFinancialData';
import { useMockStore } from '../../../store/mockStore';

export const InventoryOptimizationView = () => {
  const { showToast } = useMockStore();
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All'); // 'All' | 'High' | 'Medium' | 'Low'
  const [draftedPO, setDraftedPO] = useState(null);

  const categories = ['All', 'Meat & Poultry', 'Seafood', 'Produce', 'Dry Goods & Beverages'];

  const filteredItems = useMemo(() => {
    return MOCK_INVENTORY_OPTIMIZATION_DATA.filter((item) => {
      const matchCat = categoryFilter === 'All' || item.category === categoryFilter;
      const matchRisk = riskFilter === 'All' || item.riskLevel === riskFilter;
      return matchCat && matchRisk;
    });
  }, [categoryFilter, riskFilter]);

  const criticalLowCount = MOCK_INVENTORY_OPTIMIZATION_DATA.filter((i) => i.stockStatus === 'Critical Low').length;
  const reorderNeededCount = MOCK_INVENTORY_OPTIMIZATION_DATA.filter(
    (i) => i.stockStatus === 'Critical Low' || i.stockStatus === 'Low Stock' || i.stockStatus === 'Reorder Point Met'
  ).length;
  const overstockCount = MOCK_INVENTORY_OPTIMIZATION_DATA.filter((i) => i.stockStatus === 'Overstock Risk').length;

  const handleCreateDraftPO = (item) => {
    setDraftedPO(item);
    showToast(`Draft Purchase Order generated for ${item.name} (${item.recommendedOrderQty} ${item.unit})`);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              INVENTORY OPTIMIZATION & REORDER PLANNING
            </h2>
            <span style={{ backgroundColor: '#ccfbf1', color: '#0f766e', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
              ROP & Safety Stock Engine
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            Reorder point formulas (ROP = Lead Time Demand + Safety Stock) and automated Economic Order Quantity (EOQ).
          </p>
        </div>

        {/* Global Action */}
        <button
          onClick={() => showToast('Batch Purchase Orders dispatched for all 4 items below ROP threshold.')}
          style={{
            backgroundColor: '#0f766e',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>📦</span>
          <span>Generate Batch Replenishment PO</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Critical Stockouts Imminent
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#dc2626', marginTop: '6px' }}>
            {criticalLowCount} SKUs
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11px' }}>
            <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              Below Min Threshold
            </span>
            <span style={{ color: '#64748b' }}>US Choice Ribeye Beef</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Reorder Point (ROP) Breaches
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#d97706', marginTop: '6px' }}>
            {reorderNeededCount} Items
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11px' }}>
            <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              Action Ready
            </span>
            <span style={{ color: '#64748b' }}>Stock &lt;= calculated ROP</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Overstock Spoilage Exposure
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#7c3aed', marginTop: '6px' }}>
            {overstockCount} SKU
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11px' }}>
            <span style={{ backgroundColor: '#f3e8ff', color: '#6b21a8', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              Capital Tied Up
            </span>
            <span style={{ color: '#64748b' }}>Fresh Oysters (140 pcs)</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Target Replenishment Capital
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f766e', marginTop: '6px' }}>
            24,100,000 VND
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11px' }}>
            <span style={{ backgroundColor: '#ccfbf1', color: '#0f766e', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              Optimized EOQ
            </span>
            <span style={{ color: '#64748b' }}>Minimizes holding cost</span>
          </div>
        </div>
      </div>

      {/* ROP Algorithm Methodology Card */}
      <div style={{ backgroundColor: '#f8fafc', borderRadius: '10px', padding: '14px 18px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>📐</span>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
              Formula Specification: Reorder Point (ROP) = (Daily Average Consumption × Lead Time) + Safety Stock
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              Safety Stock buffers against 95% demand variance spikes during supplier delivery lead times.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ fontSize: '11px', backgroundColor: '#e2e8f0', padding: '3px 8px', borderRadius: '4px', fontWeight: 600, color: '#334155' }}>
            Lead Time: 1 - 3 Days
          </span>
          <span style={{ fontSize: '11px', backgroundColor: '#e2e8f0', padding: '3px 8px', borderRadius: '4px', fontWeight: 600, color: '#334155' }}>
            Service Level: 95%
          </span>
        </div>
      </div>

      {/* Inventory Table with Actionable Replenishment */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
              INVENTORY HEALTH & ACTIONABLE REORDER TABLE
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Itemized stock levels, safety buffers, calculated reorder thresholds, and suggested orders
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Risk Level:</span>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              >
                <option value="All">All Risk Levels</option>
                <option value="High">High Risk Only</option>
                <option value="Medium">Medium Risk Only</option>
                <option value="Low">Low Risk (Optimal)</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
              <tr>
                <th style={{ padding: '12px 16px' }}>SKU / Ingredient</th>
                <th style={{ padding: '12px 16px' }}>Category</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Current Stock</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Min Stock</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Safety Stock</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Reorder Point (ROP)</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Recommended PO</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Stock Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Risk</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const isCritical = item.stockStatus === 'Critical Low';
                const isOverstock = item.stockStatus === 'Overstock Risk';
                const isLow = item.stockStatus === 'Low Stock' || item.stockStatus === 'Reorder Point Met';

                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                      <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>{item.sku}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{item.category}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: isCritical ? '#dc2626' : isOverstock ? '#7c3aed' : '#0f172a' }}>
                      {item.currentStock} {item.unit}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748b' }}>
                      {item.minStock} {item.unit}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748b' }}>
                      {item.safetyStock} {item.unit}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                      {item.reorderPoint} {item.unit}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#0f766e' }}>
                      {item.recommendedOrderQty > 0 ? `+${item.recommendedOrderQty} ${item.unit}` : 'None'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span
                        style={{
                          backgroundColor: isCritical ? '#fee2e2' : isOverstock ? '#f3e8ff' : isLow ? '#fef3c7' : '#dcfce7',
                          color: isCritical ? '#991b1b' : isOverstock ? '#6b21a8' : isLow ? '#92400e' : '#166534',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700
                        }}
                      >
                        {item.stockStatus}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span
                        style={{
                          backgroundColor: item.riskLevel === 'High' ? '#fee2e2' : item.riskLevel === 'Medium' ? '#fef3c7' : '#f1f5f9',
                          color: item.riskLevel === 'High' ? '#991b1b' : item.riskLevel === 'Medium' ? '#92400e' : '#475569',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 700
                        }}
                      >
                        {item.riskLevel}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {item.recommendedOrderQty > 0 ? (
                        <button
                          onClick={() => handleCreateDraftPO(item)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '4px',
                            backgroundColor: '#0f766e',
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: 700
                          }}
                        >
                          Draft PO
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>Adequate</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suggested Replenishment Action Details */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
          SUGGESTED REPLENISHMENT & PROCUREMENT ACTIONS
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: item.stockStatus === 'Critical Low' ? '#fef2f2' : item.stockStatus === 'Overstock Risk' ? '#faf5ff' : '#f8fafc',
                border: '1px solid',
                borderColor: item.stockStatus === 'Critical Low' ? '#fecaca' : item.stockStatus === 'Overstock Risk' ? '#e9d5ff' : '#e2e8f0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px' }}>
                  {item.stockStatus === 'Critical Low' ? '🚨' : item.stockStatus === 'Overstock Risk' ? '⏳' : '📦'}
                </span>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                    {item.name} ({item.sku})
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>
                    {item.suggestedAction}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
                  Lead Time: {item.leadTimeDays}d • Shelf Life: {item.shelfLifeDays}d
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
