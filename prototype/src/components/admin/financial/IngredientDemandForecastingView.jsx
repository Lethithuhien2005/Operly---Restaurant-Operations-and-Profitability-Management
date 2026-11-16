import React, { useState, useMemo } from 'react';
import { MOCK_INGREDIENT_DEMAND_FORECAST } from '../../../mock/adminFinancialData';

export const IngredientDemandForecastingView = () => {
  const [forecastHorizon, setForecastHorizon] = useState('7days'); // '7days' | '30days'
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Shortage Warning' | 'Replenish Required' | 'Overstock Risk' | 'Optimal'
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  const statuses = ['All', 'Shortage Warning', 'Replenish Required', 'Overstock Risk', 'Optimal'];

  const filteredIngredients = useMemo(() => {
    return MOCK_INGREDIENT_DEMAND_FORECAST.filter((ing) => {
      if (statusFilter === 'All') return true;
      return ing.status === statusFilter;
    });
  }, [statusFilter]);

  const shortageItemsCount = MOCK_INGREDIENT_DEMAND_FORECAST.filter(
    (i) => i.status === 'Shortage Warning' || i.status === 'Replenish Required'
  ).length;

  const overstockCount = MOCK_INGREDIENT_DEMAND_FORECAST.filter((i) => i.status === 'Overstock Risk').length;

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
              INGREDIENT DEMAND FORECASTING (BOM DECOMPOSITION)
            </h2>
            <span style={{ backgroundColor: '#ccfbf1', color: '#0f766e', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
              Recipe-Driven Procurement
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            Translating predictive dish sales volume into raw ingredient inventory requirements via recipe Bill of Materials.
          </p>
        </div>

        {/* Forecast Period Horizon Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', backgroundColor: '#e2e8f0', borderRadius: '8px', padding: '2px' }}>
            <button
              onClick={() => setForecastHorizon('7days')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: forecastHorizon === '7days' ? '#0f766e' : 'transparent',
                color: forecastHorizon === '7days' ? '#ffffff' : '#475569'
              }}
            >
              7-Day Procurement Horizon
            </button>
            <button
              onClick={() => setForecastHorizon('30days')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: forecastHorizon === '30days' ? '#0f766e' : 'transparent',
                color: forecastHorizon === '30days' ? '#ffffff' : '#475569'
              }}
            >
              30-Day Monthly Master Plan
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Imminent Shortage Alerts
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#dc2626', marginTop: '6px' }}>
            {shortageItemsCount} Critical Items
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11px' }}>
            <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              Action Needed
            </span>
            <span style={{ color: '#64748b' }}>Ribeye, Salmon, Prawns</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Overstock Risk Items
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#d97706', marginTop: '6px' }}>
            {overstockCount} SKU
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11px' }}>
            <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              Spoilage Warning
            </span>
            <span style={{ color: '#64748b' }}>Fresh Oysters (140 pcs on hand)</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Procurement Lead Time Buffer
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
            24 - 48 Hours
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11px' }}>
            <span style={{ backgroundColor: '#ccfbf1', color: '#0f766e', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              Supplier SLA
            </span>
            <span style={{ color: '#64748b' }}>Must issue PO before Friday noon</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            BOM Recipe Coverage
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f766e', marginTop: '6px' }}>
            100% Mapped
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11px' }}>
            <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              Gram-Level Precision
            </span>
            <span style={{ color: '#64748b' }}>Zero untracked inventory ingredients</span>
          </div>
        </div>
      </div>

      {/* Visual BOM Breakdown Pipeline Explainer */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🔄 RECIPE BOM DECOMPOSITION PIPELINE (DISH DEMAND → INGREDIENT INTAKE)</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', fontSize: '12px' }}>
          <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 800, color: '#0284c7' }}>Step 1: Dish Sales Demand</div>
            <div style={{ color: '#475569', marginTop: '4px' }}>
              e.g., Grilled Ribeye Steak forecast: <strong>105 portions</strong> next 7 days.
            </div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 800, color: '#0f766e' }}>Step 2: Recipe BOM Factor</div>
            <div style={{ color: '#475569', marginTop: '4px' }}>
              BOM coefficient: <strong>0.30 kg Ribeye + 0.10 kg Asparagus</strong> per dish.
            </div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 800, color: '#dc2626' }}>Step 3: Stock Gap & PO Requisition</div>
            <div style={{ color: '#475569', marginTop: '4px' }}>
              Required 31.5kg - Stock 6.8kg = <strong>Shortage 24.7kg</strong> (Issue PO).
            </div>
          </div>
        </div>
      </div>

      {/* Ingredient Forecast Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
              RAW INGREDIENT FORECASTED REQUIREMENTS TABLE ({forecastHorizon === '7days' ? 'NEXT 7 DAYS' : 'NEXT 30 DAYS'})
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Current walk-in stock vs. projected kitchen consumption vs. required purchase order volume
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
              <tr>
                <th style={{ padding: '12px 16px' }}>Ingredient Name</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Unit</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Est. Unit Cost</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Current Stock</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Safety Stock</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Required Quantity</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Estimated Shortage</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>BOM Recipe Decomposition</th>
              </tr>
            </thead>
            <tbody>
              {filteredIngredients.map((ing) => {
                const reqQty = forecastHorizon === '7days' ? ing.requiredQuantity7Days : ing.requiredQuantity30Days;
                const shortage = Math.max(0, reqQty - ing.currentStock);
                const isShortage = ing.status === 'Shortage Warning';
                const isOverstock = ing.status === 'Overstock Risk';

                return (
                  <tr key={ing.ingredientId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                      {ing.name}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                      {ing.unit}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#64748b' }}>
                      {formatCurrency(ing.unitCost)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                      {ing.currentStock} {ing.unit}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748b' }}>
                      {ing.safetyStock} {ing.unit}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#0284c7' }}>
                      {reqQty} {ing.unit}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: shortage > 0 ? '#dc2626' : '#166534' }}>
                      {shortage > 0 ? `-${shortage.toFixed(1)} ${ing.unit}` : 'Sufficient'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span
                        style={{
                          backgroundColor: isShortage ? '#fee2e2' : isOverstock ? '#fef3c7' : '#dcfce7',
                          color: isShortage ? '#991b1b' : isOverstock ? '#92400e' : '#166534',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700
                        }}
                      >
                        {ing.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '11px', color: '#475569' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{ing.associatedDishes.join(', ')}</span>
                      <span style={{ color: '#64748b', marginLeft: '6px' }}>({ing.bomRatio})</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
