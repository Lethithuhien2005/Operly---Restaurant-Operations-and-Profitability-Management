import React, { useState, useEffect, useCallback } from 'react';
import { analyticsApi } from '../../api/client';
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

export const ManagerAIIntelligenceViews = ({ activeTab, onNavigateTab }) => {
  const { showToast } = useMockStore();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [revPeriod, setRevPeriod] = useState('daily');
  const [revForecast, setRevForecast] = useState(null);
  const [horizon, setHorizon] = useState('7d');
  const [demand, setDemand] = useState(null);
  const [demandDays, setDemandDays] = useState(7);
  const [profitability, setProfitability] = useState(null);
  const [invIntel, setInvIntel] = useState(null);
  const [anomalies, setAnomalies] = useState(null);
  const [recommendations, setRecommendations] = useState(null);

  const fetchTab = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'fi-dashboard') setDashboard(await analyticsApi.getDashboard());
      else if (activeTab === 'fi-revenue-analytics') setRevenue(await analyticsApi.getRevenue(revPeriod));
      else if (activeTab === 'fi-revenue-forecasting') setRevForecast(await analyticsApi.getRevenueForecast(horizon));
      else if (activeTab === 'fi-menu-demand') setDemand(await analyticsApi.getDemandForecast(demandDays));
      else if (activeTab === 'fi-menu-profitability') setProfitability(await analyticsApi.getProfitability());
      else if (activeTab === 'fi-ingredient-demand' || activeTab === 'fi-inventory-opt')
        setInvIntel(await analyticsApi.getInventoryIntelligence(demandDays));
      else if (activeTab === 'fi-anomalies') setAnomalies(await analyticsApi.getAnomalies());
      else if (activeTab === 'fi-recommendations') setRecommendations(await analyticsApi.getRecommendations());
    } catch (err) {
      showToast(`AI Analytics error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [activeTab, revPeriod, horizon, demandDays, showToast]);

  useEffect(() => {
    fetchTab();
  }, [fetchTab]);

  if (loading) {
    return <div style={{ padding: 24, color: THEME.muted }}>Running AI & Analytics pipeline from database...</div>;
  }

  // 00. Financial Intelligence Dashboard
  if (activeTab === 'fi-dashboard' && dashboard) {
    const k = dashboard.kpis || {};
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ backgroundColor: THEME.green, color: THEME.cream, borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 12, color: THEME.gold, fontWeight: 800, textTransform: 'uppercase' }}>
            Financial Intelligence Dashboard (6 AI & Analytics Modules)
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, marginTop: 4 }}>
            Unified Revenue, ML Forecasting, BOM Inventory & Anomaly Engine
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
          <div style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: THEME.muted }}>Realized Revenue</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: THEME.green, marginTop: 4 }}>{formatVND(k.totalRevenue)}</div>
          </div>
          <div style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: THEME.muted }}>Gross Profit ({k.grossMarginPct}%)</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: THEME.green, marginTop: 4 }}>{formatVND(k.grossProfit)}</div>
          </div>
          <div style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: THEME.muted }}>Open Anomaly Alerts</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#991b1b', marginTop: 4 }}>{k.openAnomaliesCount}</div>
          </div>
          <div style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: THEME.muted }}>Pending Recommendations</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: THEME.green, marginTop: 4 }}>{k.pendingRecommendationsCount}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          {[
            { id: 'fi-revenue-analytics', title: '01. Revenue Analytics', desc: 'SQL + Statistical Analysis' },
            { id: 'fi-revenue-forecasting', title: '02. Revenue Forecasting', desc: 'ML: XGBoost / LightGBM' },
            { id: 'fi-menu-demand', title: '03. Demand Forecasting', desc: 'ML: Dish Quantity Prediction' },
            { id: 'fi-menu-profitability', title: '04. Profitability Analysis', desc: 'COGS & BCG Menu Matrix' },
            { id: 'fi-inventory-opt', title: '05. Inventory Intelligence', desc: 'BOM + ROP + Safety Stock' },
            { id: 'fi-anomalies', title: '06. Anomaly Detection', desc: 'ML: Isolation Forest' },
            { id: 'fi-recommendations', title: 'Recommendation Engine', desc: 'Rule-based Action Hub' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => onNavigateTab(m.id)}
              style={{
                textAlign: 'left',
                backgroundColor: THEME.card,
                border: `1px solid ${THEME.border}`,
                borderRadius: 10,
                padding: 14,
                cursor: 'pointer',
              }}
            >
              <div style={{ fontWeight: 800, color: THEME.green, fontSize: 14 }}>{m.title}</div>
              <div style={{ fontSize: 12, color: THEME.muted, marginTop: 4 }}>{m.desc}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 01. Revenue Analytics
  if (activeTab === 'fi-revenue-analytics' && revenue) {
    const s = revenue.summary || {};
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: THEME.green }}>01. Revenue Analytics (SQL + Statistical Analysis)</h3>
          <div style={{ display: 'flex', gap: 6 }}>
            {['daily', 'weekly', 'monthly'].map((p) => (
              <button
                key={p}
                onClick={() => setRevPeriod(p)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  backgroundColor: revPeriod === p ? THEME.green : THEME.card,
                  color: revPeriod === p ? THEME.cream : THEME.green,
                  border: `1px solid ${THEME.border}`,
                }}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <div style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, color: THEME.muted, fontWeight: 700 }}>Total Period Revenue</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: THEME.green }}>{formatVND(s.totalRevenue)}</div>
          </div>
          <div style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, color: THEME.muted, fontWeight: 700 }}>Avg Ticket Size</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: THEME.green }}>{formatVND(s.avgTicketSize)}</div>
          </div>
          <div style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, color: THEME.muted, fontWeight: 700 }}>Total Orders</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: THEME.green }}>{s.totalOrders}</div>
          </div>
          <div style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, color: THEME.muted, fontWeight: 700 }}>Gross Margin</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: THEME.green }}>{s.grossMarginPct}%</div>
          </div>
        </div>

        <div style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 16 }}>
          <h4 style={{ fontSize: 14, fontWeight: 800, color: THEME.green, marginBottom: 10 }}>Revenue by Dish</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${THEME.border}`, textAlign: 'left', color: THEME.muted }}>
                <th style={{ padding: 8 }}>Dish</th>
                <th style={{ padding: 8 }}>Category</th>
                <th style={{ padding: 8 }}>Units Sold</th>
                <th style={{ padding: 8 }}>Revenue</th>
                <th style={{ padding: 8 }}>Profit</th>
                <th style={{ padding: 8 }}>Margin %</th>
              </tr>
            </thead>
            <tbody>
              {(revenue.dishes || []).map((d) => (
                <tr key={d.id} style={{ borderBottom: `1px solid ${THEME.cream}` }}>
                  <td style={{ padding: 8, fontWeight: 700, color: THEME.green }}>{d.name}</td>
                  <td style={{ padding: 8 }}>{d.category}</td>
                  <td style={{ padding: 8 }}>{d.unitsSold}</td>
                  <td style={{ padding: 8, fontWeight: 700 }}>{formatVND(d.revenue)}</td>
                  <td style={{ padding: 8 }}>{formatVND(d.profit)}</td>
                  <td style={{ padding: 8 }}>{d.marginPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 02. Revenue Forecasting
  if (activeTab === 'fi-revenue-forecasting' && revForecast) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: THEME.green }}>02. Revenue Forecasting ({revForecast.modelInfo?.algorithm})</h3>
            <div style={{ fontSize: 12, color: THEME.muted }}>
              Source: {revForecast.modelInfo?.hasTrainedMlModel ? 'DB AI Forecasts + Statistical Baseline' : 'Statistical Baseline Projection (No trained ML model)'} • Band: {revForecast.modelInfo?.confidenceLevel}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { id: '7d', label: 'Next 7 Days' },
              { id: '4w', label: 'Next 4 Weeks' },
              { id: '3m', label: 'Next 3 Months' },
            ].map((h) => (
              <button
                key={h.id}
                onClick={() => setHorizon(h.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  backgroundColor: horizon === h.id ? THEME.green : THEME.card,
                  color: horizon === h.id ? THEME.cream : THEME.green,
                  border: `1px solid ${THEME.border}`,
                }}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 16 }}>
          <div style={{ marginBottom: 12, fontSize: 14, fontWeight: 800, color: THEME.green }}>
            Projected Horizon Total: {formatVND(revForecast.summary?.totalPredicted)}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${THEME.border}`, textAlign: 'left', color: THEME.muted }}>
                <th style={{ padding: 8 }}>Target Period</th>
                <th style={{ padding: 8 }}>Predicted Revenue</th>
                <th style={{ padding: 8 }}>95% CI Lower</th>
                <th style={{ padding: 8 }}>95% CI Upper</th>
                <th style={{ padding: 8 }}>Model</th>
              </tr>
            </thead>
            <tbody>
              {(revForecast.series || []).map((row) => (
                <tr key={row.id} style={{ borderBottom: `1px solid ${THEME.cream}` }}>
                  <td style={{ padding: 8, fontWeight: 700, color: THEME.green }}>{row.date}</td>
                  <td style={{ padding: 8, fontWeight: 800 }}>{formatVND(row.predictedValue)}</td>
                  <td style={{ padding: 8, color: THEME.muted }}>{formatVND(row.lowerBound)}</td>
                  <td style={{ padding: 8, color: THEME.muted }}>{formatVND(row.upperBound)}</td>
                  <td style={{ padding: 8 }}>{row.modelVersion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 03. Demand Forecasting
  if (activeTab === 'fi-menu-demand' && demand) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: THEME.green }}>03. Menu Demand Forecasting ({demand.modelInfo?.algorithm || 'Statistical Baseline'})</h3>
          <div style={{ display: 'flex', gap: 6 }}>
            {[7, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDemandDays(d)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  backgroundColor: demandDays === d ? THEME.green : THEME.card,
                  color: demandDays === d ? THEME.cream : THEME.green,
                  border: `1px solid ${THEME.border}`,
                }}
              >
                Next {d} Days
              </button>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 16 }}>
          <div style={{ marginBottom: 12, fontSize: 13, fontWeight: 700, color: THEME.green }}>
            Total Predicted Servings: {demand.summary?.totalPredictedServings} • Expected Revenue: {formatVND(demand.summary?.totalExpectedRevenue)}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${THEME.border}`, textAlign: 'left', color: THEME.muted }}>
                <th style={{ padding: 8 }}>Dish</th>
                <th style={{ padding: 8 }}>Category</th>
                <th style={{ padding: 8 }}>Recent Sold</th>
                <th style={{ padding: 8 }}>Predicted Qty ({demandDays}d)</th>
                <th style={{ padding: 8 }}>Expected Revenue</th>
                <th style={{ padding: 8 }}>Demand Tier</th>
              </tr>
            </thead>
            <tbody>
              {(demand.items || []).map((item) => (
                <tr key={item.menuItemId} style={{ borderBottom: `1px solid ${THEME.cream}` }}>
                  <td style={{ padding: 8, fontWeight: 700, color: THEME.green }}>{item.name}</td>
                  <td style={{ padding: 8 }}>{item.category}</td>
                  <td style={{ padding: 8 }}>{item.recentSold}</td>
                  <td style={{ padding: 8, fontWeight: 800 }}>{item.predictedQty} servings</td>
                  <td style={{ padding: 8 }}>{formatVND(item.expectedRevenue)}</td>
                  <td style={{ padding: 8 }}>
                    <span style={{ padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 700, backgroundColor: item.demandLevel === 'HIGH' ? '#dcfce7' : THEME.gold, color: THEME.green }}>
                      {item.demandLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 04. Profitability Analysis
  if (activeTab === 'fi-menu-profitability' && profitability) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: THEME.green }}>04. Menu Profitability Analysis (Gross Profit = Revenue - COGS & BCG Matrix)</h3>
          <div style={{ fontSize: 12, color: THEME.muted }}>{profitability.summary?.profitType}</div>
        </div>
        <div style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 16, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${THEME.border}`, textAlign: 'left', color: THEME.muted }}>
                <th style={{ padding: 8 }}>Dish</th>
                <th style={{ padding: 8 }}>Price</th>
                <th style={{ padding: 8 }}>Unit COGS</th>
                <th style={{ padding: 8 }}>Sold</th>
                <th style={{ padding: 8 }}>Total Revenue</th>
                <th style={{ padding: 8 }}>Gross Profit</th>
                <th style={{ padding: 8 }}>Margin %</th>
                <th style={{ padding: 8 }}>BCG Class</th>
              </tr>
            </thead>
            <tbody>
              {(profitability.items || []).map((item) => (
                <tr key={item.menuItemId} style={{ borderBottom: `1px solid ${THEME.cream}` }}>
                  <td style={{ padding: 8, fontWeight: 700, color: THEME.green }}>{item.name}</td>
                  <td style={{ padding: 8 }}>{formatVND(item.unitPrice)}</td>
                  <td style={{ padding: 8 }}>{formatVND(item.unitCost)}</td>
                  <td style={{ padding: 8 }}>{item.unitsSold}</td>
                  <td style={{ padding: 8 }}>{formatVND(item.totalRevenue)}</td>
                  <td style={{ padding: 8, fontWeight: 800 }}>{formatVND(item.grossProfit)}</td>
                  <td style={{ padding: 8 }}>{item.profitMarginPct}%</td>
                  <td style={{ padding: 8 }}>
                    <span style={{ backgroundColor: THEME.gold, color: THEME.green, padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 800 }}>
                      {item.classification}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 05. Inventory Intelligence (Ingredient Demand + Optimization)
  if ((activeTab === 'fi-ingredient-demand' || activeTab === 'fi-inventory-opt') && invIntel) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: THEME.green }}>05. Inventory Intelligence (BOM + Safety Stock + ROP)</h3>
            <div style={{ fontSize: 12, color: THEME.muted }}>{invIntel.formula} • Lead Time: {invIntel.leadTimeDays} days</div>
          </div>
        </div>
        <div style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 16, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${THEME.border}`, textAlign: 'left', color: THEME.muted }}>
                <th style={{ padding: 8 }}>Ingredient</th>
                <th style={{ padding: 8 }}>Current Stock</th>
                <th style={{ padding: 8 }}>Safety Stock</th>
                <th style={{ padding: 8 }}>ROP</th>
                <th style={{ padding: 8 }}>Predicted Need ({invIntel.days}d)</th>
                <th style={{ padding: 8 }}>Recommended PO</th>
                <th style={{ padding: 8 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {(invIntel.items || []).map((item) => (
                <tr key={item.id} style={{ borderBottom: `1px solid ${THEME.cream}` }}>
                  <td style={{ padding: 8, fontWeight: 700, color: THEME.green }}>{item.itemName} ({item.unit})</td>
                  <td style={{ padding: 8, fontWeight: 700 }}>{item.currentStock}</td>
                  <td style={{ padding: 8 }}>{item.safetyStock}</td>
                  <td style={{ padding: 8 }}>{item.reorderPoint}</td>
                  <td style={{ padding: 8 }}>{item.predictedRequirement}</td>
                  <td style={{ padding: 8, fontWeight: 800 }}>{item.recommendedOrderQty > 0 ? `+${item.recommendedOrderQty} ${item.unit}` : '—'}</td>
                  <td style={{ padding: 8 }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 9999,
                        fontSize: 11,
                        fontWeight: 700,
                        backgroundColor: item.status === 'Critical Low' ? '#fee2e2' : item.status === 'Optimal' ? '#dcfce7' : THEME.gold,
                        color: item.status === 'Critical Low' ? '#991b1b' : THEME.green,
                      }}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 06. Anomaly Detection
  if (activeTab === 'fi-anomalies' && anomalies) {
    const handleScan = async () => {
      try {
        const res = await analyticsApi.runAnomalyScan();
        showToast(`Scan complete: ${res.newAnomaliesDetected} new anomalies detected.`);
        fetchTab();
      } catch (err) {
        showToast(`Scan failed: ${err.message}`);
      }
    };

    const handleStatus = async (id, status) => {
      try {
        await analyticsApi.updateAnomalyStatus(id, status);
        showToast(`Anomaly marked as ${status}`);
        fetchTab();
      } catch (err) {
        showToast(`Update failed: ${err.message}`);
      }
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: THEME.green }}>06. Loss & Anomaly Detection (Isolation Forest)</h3>
          <button onClick={handleScan} style={{ backgroundColor: THEME.green, color: THEME.cream, padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 800 }}>
            Run Anomaly Scan
          </button>
        </div>
        <div style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 16 }}>
          {(anomalies.items || []).map((a) => (
            <div key={a.id} style={{ padding: 12, borderBottom: `1px solid ${THEME.cream}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ backgroundColor: a.severity === 'CRITICAL' ? '#fee2e2' : THEME.gold, color: a.severity === 'CRITICAL' ? '#991b1b' : THEME.green, padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 800 }}>
                    {a.severity} • {a.anomalyType}
                  </span>
                  <span style={{ fontSize: 12, color: THEME.muted }}>{new Date(a.detectedAt).toLocaleString()}</span>
                </div>
                <div style={{ fontWeight: 700, color: THEME.green, marginTop: 4 }}>{a.description}</div>
                <div style={{ fontSize: 12, color: THEME.muted }}>Detected: {a.detectedValue} vs Expected: {a.expectedValue} • Status: {a.status}</div>
              </div>
              {a.status === 'OPEN' && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => handleStatus(a.id, 'RESOLVED')} style={{ backgroundColor: THEME.green, color: THEME.cream, padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                    Resolve
                  </button>
                  <button onClick={() => handleStatus(a.id, 'IGNORED')} style={{ backgroundColor: THEME.cream, border: `1px solid ${THEME.border}`, color: THEME.green, padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                    Ignore
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 07. Recommendation Engine
  if (activeTab === 'fi-recommendations' && recommendations) {
    const handleRec = async (id, status) => {
      try {
        await analyticsApi.updateRecommendationStatus(id, status);
        showToast(`Recommendation marked ${status}`);
        fetchTab();
      } catch (err) {
        showToast(`Error: ${err.message}`);
      }
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: THEME.green }}>AI Recommendation Engine (Rule-based + ML Insights)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(recommendations.items || []).map((r) => (
            <div key={r.id} style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ backgroundColor: THEME.gold, color: THEME.green, padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 800 }}>
                    {r.priority} • {r.recommendationType}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: THEME.muted }}>{r.status}</span>
                </div>
                <div style={{ fontWeight: 800, color: THEME.green, fontSize: 14, marginTop: 4 }}>{r.title}</div>
                <div style={{ fontSize: 12, color: THEME.muted, marginTop: 2 }}>{r.description}</div>
              </div>
              {r.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => handleRec(r.id, 'ACCEPTED')} style={{ backgroundColor: THEME.green, color: THEME.cream, padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                    Accept
                  </button>
                  <button onClick={() => handleRec(r.id, 'COMPLETED')} style={{ backgroundColor: THEME.gold, color: THEME.green, padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                    Complete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};
