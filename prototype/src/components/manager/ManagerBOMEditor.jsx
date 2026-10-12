import React from 'react';
import { useMockStore } from '../../store/mockStore';

export const ManagerBOMEditor = () => {
  const { recipeBOM, updateBOMQuantity, showToast } = useMockStore();

  const totalBOMCost = recipeBOM.ingredients.reduce((acc, ing) => acc + ing.lineCost, 0);
  const grossMarginPct = (((recipeBOM.sellingPrice - totalBOMCost) / recipeBOM.sellingPrice) * 100).toFixed(1);

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
              RECIPE BILL OF MATERIALS (BOM) CONFIGURATOR | Dish: {recipeBOM.dishName}
            </h3>
            <span style={{ backgroundColor: '#ccfbf1', color: '#0f766e', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
              SCR-MGR-02
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Automated ingredient depletion specifications triggered upon KDS ticket state advancing to "Cooking"
          </div>
        </div>

        <span style={{ fontSize: '11px', color: '#64748b', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '6px' }}>
          Image Asset: {recipeBOM.imageName}
        </span>
      </div>

      {/* Header Properties */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '18px' }}>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>MENU LIST PRICE (VND)</label>
          <input
            type="text"
            readOnly
            value={`${recipeBOM.sellingPrice.toLocaleString()} VND`}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontWeight: 800, marginTop: '4px', color: '#0f766e' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>MENU CATEGORY</label>
          <input
            type="text"
            readOnly
            value={recipeBOM.category}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontWeight: 600, marginTop: '4px' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>KITCHEN PREPARATION STATION</label>
          <input
            type="text"
            readOnly
            value={recipeBOM.station}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontWeight: 600, marginTop: '4px' }}
          />
        </div>
      </div>

      {/* Ingredients Specification Table */}
      <div style={{ fontSize: '12px', fontWeight: 800, color: '#475569', marginBottom: '8px' }}>
        INGREDIENT RECIPE SPECIFICATION (PORTION STANDARD FOR 1 DISH):
      </div>

      <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 700 }}>Ingredient Name</th>
              <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 700 }}>BOM Quantity</th>
              <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 700 }}>Unit</th>
              <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 700 }}>Preparation Yield %</th>
              <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 700 }}>Unit Inventory Cost</th>
              <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 700 }}>Line Cost</th>
            </tr>
          </thead>
          <tbody>
            {recipeBOM.ingredients.map((ing) => (
              <tr key={ing.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>{ing.name}</td>
                <td style={{ padding: '10px 14px' }}>
                  <input
                    type="number"
                    min="1"
                    value={ing.quantity}
                    onChange={(e) => updateBOMQuantity(ing.id, Math.max(1, parseFloat(e.target.value) || 1))}
                    style={{ width: '90px', padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 700, textAlign: 'center' }}
                  />
                </td>
                <td style={{ padding: '10px 14px', color: '#64748b' }}>{ing.unit}</td>
                <td style={{ padding: '10px 14px', color: '#64748b' }}>{ing.yieldPct}%</td>
                <td style={{ padding: '10px 14px', color: '#64748b' }}>{ing.unitCost.toLocaleString()} VND/{ing.unit === 'Grams' ? 'g' : ing.unit}</td>
                <td style={{ padding: '10px 14px', fontWeight: 800, color: '#0f766e' }}>
                  {ing.lineCost.toLocaleString()} VND
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Financial Margin Simulator Summary */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '14px 18px',
          marginTop: '16px'
        }}
      >
        <div>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Theoretical Food Cost: </span>
          <span style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', marginLeft: '6px' }}>
            {totalBOMCost.toLocaleString()} VND
          </span>
          <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '10px' }}>
            ({((totalBOMCost / recipeBOM.sellingPrice) * 100).toFixed(1)}% of Menu Price)
          </span>
        </div>

        <div>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Target Gross Margin: </span>
          <span style={{ fontSize: '17px', fontWeight: 900, color: grossMarginPct >= 50 ? '#16a34a' : '#ea580c', marginLeft: '6px' }}>
            {grossMarginPct}%
          </span>
          <span style={{ fontSize: '11px', color: '#16a34a', marginLeft: '8px', fontWeight: 600 }}>
            {grossMarginPct >= 50 ? '✓ Exceeds F&B Benchmark' : '⚠️ Below Target Margin'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '18px', justifyContent: 'flex-end' }}>
        <button
          onClick={() => showToast('BOM recipe adjustments reverted.')}
          style={{
            padding: '8px 18px',
            borderRadius: '6px',
            backgroundColor: '#f1f5f9',
            border: '1px solid #cbd5e1',
            fontSize: '12px',
            fontWeight: 600,
            color: '#475569',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>

        <button
          onClick={() =>
            showToast('✓ Recipe BOM saved! Real-time stock depletion activated for Station 2 (Grill).')
          }
          style={{
            padding: '8px 20px',
            borderRadius: '6px',
            backgroundColor: '#0f766e',
            border: 'none',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(15, 118, 110, 0.25)'
          }}
        >
          SAVE RECIPE & ACTIVATE BOM DEPLETION
        </button>
      </div>
    </div>
  );
};
