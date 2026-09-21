import React from 'react';
import { useMockStore } from '../store/mockStore';
import { MOCK_MANAGER_METRICS, MOCK_AI_FORECAST } from '../mock/data';

export const ManagerPortalScreen = () => {
  const {
    managerTab,
    setManagerTab,
    recipeBOM,
    updateBOMQuantity,
    showToast
  } = useMockStore();

  const metrics = MOCK_MANAGER_METRICS;
  const forecast = MOCK_AI_FORECAST;

  // Calculate BOM totals
  const totalBOMCost = recipeBOM.ingredients.reduce((acc, ing) => acc + ing.lineCost, 0);
  const grossMarginPct = (((recipeBOM.sellingPrice - totalBOMCost) / recipeBOM.sellingPrice) * 100).toFixed(1);

  return (
    <div className="device-desktop" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Header matching SCR-MGR-01 */}
      <div
        style={{
          backgroundColor: '#0f766e',
          color: '#fff',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '18px', fontWeight: 800 }}>OPERLY MANAGER PORTAL</span>
          <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
            Branch: {metrics.branch}
          </span>
          <span style={{ fontSize: '12px', opacity: 0.85 }}>Manager: {metrics.managerName}</span>
        </div>

        <div style={{ fontSize: '12px', opacity: 0.9 }}>
          Today: {metrics.date} • Live Operational Analytics
        </div>
      </div>

      {/* Sub-bar / Navigation Tabs */}
      <div
        style={{
          backgroundColor: '#f1f5f9',
          borderBottom: '1px solid #e2e8f0',
          padding: '8px 20px',
          display: 'flex',
          gap: '8px'
        }}
      >
        <button
          onClick={() => setManagerTab('forecast')}
          style={{
            padding: '6px 16px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            backgroundColor: managerTab === 'forecast' ? '#0f766e' : '#ffffff',
            color: managerTab === 'forecast' ? '#ffffff' : '#475569',
            border: '1px solid',
            borderColor: managerTab === 'forecast' ? '#0f766e' : '#cbd5e1'
          }}
        >
          📊 Executive BI & AI Forecast (SCR-MGR-01)
        </button>

        <button
          onClick={() => setManagerTab('bom')}
          style={{
            padding: '6px 16px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            backgroundColor: managerTab === 'bom' ? '#0f766e' : '#ffffff',
            color: managerTab === 'bom' ? '#ffffff' : '#475569',
            border: '1px solid',
            borderColor: managerTab === 'bom' ? '#0f766e' : '#cbd5e1'
          }}
        >
          🥩 Menu & Recipe BOM Editor (SCR-MGR-02)
        </button>
      </div>

      {/* Main View Area */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#ffffff' }}>
        {managerTab === 'forecast' ? (
          /* ======================================================== */
          /* SCR-MGR-01: Executive BI & AI Predictive Analytics Board */
          /* ======================================================== */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Today's Real-Time Metrics Cards */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '10px' }}>
                TODAY'S REAL-TIME OPERATIONAL METRICS:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>GROSS SALES</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f766e', marginTop: '4px' }}>
                    {metrics.grossSales.toLocaleString()} VND
                  </div>
                  <div style={{ fontSize: '10px', color: '#16a34a', marginTop: '2px' }}>+12% vs last Saturday</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>TABLES SERVED</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                    {metrics.tablesServed} Tables
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Avg Turnover: 52 mins</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>AVG TICKET (SPEND)</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                    {metrics.avgTicket.toLocaleString()} VND
                  </div>
                  <div style={{ fontSize: '10px', color: '#16a34a', marginTop: '2px' }}>Cover size: 3.4 diners</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>KITCHEN SPOILAGE LOSS</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#dc2626', marginTop: '4px' }}>
                    {metrics.wasteLoss.toLocaleString()} VND
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>FR-013 Spoilage Ledger</div>
                </div>
              </div>
            </div>

            {/* 7-Day Predictive AI Demand & Revenue Chart */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', backgroundColor: '#fcfcfc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                    7-DAY PREDICTIVE AI DEMAND & REVENUE FORECAST ({forecast.modelType})
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    Evaluated with 95% Confidence Interval Bands • Time-series ARIMA/Prophet baseline
                  </div>
                </div>

                <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                  Model MAPE: {forecast.modelMape}% (High Accuracy)
                </div>
              </div>

              {/* Graphical Trend Bar / Curve Visualization with Explicit CI Bounds */}
              <div style={{ padding: '20px 10px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '170px', padding: '0 20px' }}>
                  {forecast.dataPoints.map((pt) => {
                    const heightPct = (pt.revenueM / 40) * 100;
                    const isPeak = pt.day === 'Sat';

                    return (
                      <div key={pt.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: isPeak ? '#0f766e' : '#475569' }}>
                          {pt.revenueM}M
                        </div>
                        <div style={{ fontSize: '9px', color: '#94a3b8' }}>
                          [{pt.lowerM} - {pt.upperM}]
                        </div>

                        {/* Bar with Confidence Interval Envelope */}
                        <div
                          style={{
                            width: '36px',
                            height: `${heightPct}%`,
                            backgroundColor: isPeak ? '#0f766e' : '#38bdf8',
                            borderRadius: '6px 6px 0 0',
                            position: 'relative',
                            boxShadow: isPeak ? '0 4px 6px rgba(15, 118, 110, 0.4)' : 'none'
                          }}
                        >
                          {/* Upper Confidence Band Indicator */}
                          <div
                            style={{
                              position: 'absolute',
                              top: '-6px',
                              left: '0',
                              right: '0',
                              height: '2px',
                              backgroundColor: '#64748b'
                            }}
                            title={`Upper bound: ${pt.upperM}M`}
                          />
                        </div>

                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{pt.day}</div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>{pt.covers} covers</div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '10px', marginTop: '12px', fontSize: '11px', color: '#64748b' }}>
                  <span>Confidence Interval: {forecast.confidenceLevel}% (Envelope bounds shown per day)</span>
                  <span>Total Expected Covers: {forecast.expectedCovers} Guests</span>
                  <span style={{ fontWeight: 700, color: '#0f766e' }}>* Weekend Peak Projected: 34M VND (Saturday)</span>
                </div>
              </div>
            </div>

            {/* AI Staffing & Procurement Actionable Insights matching SCR-MGR-01 */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '10px' }}>
                AI PROCUREMENT & STAFFING RECOMMENDATIONS FOR SATURDAY:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                {forecast.recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    style={{
                      border: '1px solid #bbf7d0',
                      backgroundColor: '#f0fdf4',
                      borderRadius: '10px',
                      padding: '14px',
                      display: 'flex',
                      gap: '12px'
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>{rec.type === 'Staffing' ? '👥' : '📦'}</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#166534' }}>
                        {rec.title} ({rec.type})
                      </div>
                      <div style={{ fontSize: '12px', color: '#14532d', marginTop: '4px', lineHeight: '1.4' }}>
                        {rec.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* SCR-MGR-02: Recipe Bill of Materials (BOM) Configurator  */
          /* ======================================================== */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', backgroundColor: '#fcfcfc' }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                RECIPE BILL OF MATERIALS (BOM) CONFIGURATOR | Dish: {recipeBOM.dishName}
              </div>

              {/* Header Properties */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>SELLING PRICE (VND)</label>
                  <input
                    type="text"
                    readOnly
                    value={`${recipeBOM.sellingPrice.toLocaleString()} VND`}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontWeight: 800, marginTop: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>CATEGORY</label>
                  <input
                    type="text"
                    readOnly
                    value={recipeBOM.category}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontWeight: 600, marginTop: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>KITCHEN PREP STATION</label>
                  <input
                    type="text"
                    readOnly
                    value={recipeBOM.station}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontWeight: 600, marginTop: '4px' }}
                  />
                </div>
              </div>

              {/* Ingredients Specification Table with min="1" Validation */}
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#475569', marginBottom: '8px' }}>
                INGREDIENT RECIPE SPECIFICATION (AUTOMATED STOCK DEPLETION AT 'COOKING' STATE):
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                    <tr>
                      <th style={{ padding: '10px 12px' }}>Ingredient Name</th>
                      <th style={{ padding: '10px 12px' }}>BOM Quantity</th>
                      <th style={{ padding: '10px 12px' }}>Unit</th>
                      <th style={{ padding: '10px 12px' }}>Yield %</th>
                      <th style={{ padding: '10px 12px' }}>Est. Unit Cost</th>
                      <th style={{ padding: '10px 12px' }}>Line Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipeBOM.ingredients.map((ing) => (
                      <tr key={ing.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>{ing.name}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <input
                            type="number"
                            min="1"
                            value={ing.quantity}
                            onChange={(e) => updateBOMQuantity(ing.id, Math.max(1, parseFloat(e.target.value) || 1))}
                            style={{ width: '80px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                          />
                        </td>
                        <td style={{ padding: '10px 12px', color: '#64748b' }}>{ing.unit}</td>
                        <td style={{ padding: '10px 12px', color: '#64748b' }}>{ing.yieldPct}%</td>
                        <td style={{ padding: '10px 12px', color: '#64748b' }}>{ing.unitCost} VND/g</td>
                        <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0f766e' }}>
                          {ing.lineCost.toLocaleString()} VND
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Margin Summary */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginTop: '14px'
                }}
              >
                <div>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Theoretical Food Cost: </span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                    {totalBOMCost.toLocaleString()} VND
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Target Gross Margin: </span>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#16a34a' }}>
                    {grossMarginPct}%
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => showToast('BOM changes cancelled.')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#475569'
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={() =>
                    showToast('Recipe BOM saved! Stock depletion parameters updated for Station 2 (Grill).')
                  }
                  style={{
                    padding: '8px 18px',
                    borderRadius: '6px',
                    backgroundColor: '#0f766e',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 800
                  }}
                >
                  SAVE RECIPE & ACTIVATE BOM DEPLETION
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
