import React from 'react';
import {
  MOCK_FINANCIAL_SUMMARY,
  MOCK_REVENUE_TRENDS,
  MOCK_MENU_ITEMS_PERFORMANCE,
  MOCK_LOSS_AND_ANOMALIES,
  MOCK_RECOMMENDATION_ENGINE_DATA,
  MOCK_INVENTORY_OPTIMIZATION_DATA
} from '../../../mock/adminFinancialData';

export const FinancialIntelligenceDashboard = ({ onNavigate }) => {
  const summary = MOCK_FINANCIAL_SUMMARY;
  const recentTrends = MOCK_REVENUE_TRENDS.daily;
  const maxRevenue = Math.max(...recentTrends.map((d) => d.revenue), 1);

  const highDemandDishes = MOCK_MENU_ITEMS_PERFORMANCE.slice(0, 3);
  const lowProfitDishes = [...MOCK_MENU_ITEMS_PERFORMANCE].sort((a, b) => a.marginPct - b.marginPct).slice(0, 3);
  const recentAnomalies = MOCK_LOSS_AND_ANOMALIES.slice(0, 3);
  const urgentRecommendations = MOCK_RECOMMENDATION_ENGINE_DATA.filter(
    (r) => r.priority === 'Critical' || r.priority === 'High'
  ).slice(0, 3);

  const criticalInventoryCount = MOCK_INVENTORY_OPTIMIZATION_DATA.filter(
    (i) => i.riskLevel === 'High' || i.stockStatus === 'Critical Low'
  ).length;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner / Executive Summary Header */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          padding: '20px 24px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>💼</span>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                FINANCIAL INTELLIGENCE EXECUTIVE SUITE
              </h1>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Period: <strong>{summary.currentPeriod}</strong> • Restaurant Operations & Profitability Command Center
              </div>
            </div>
          </div>
        </div>

        {/* Quick Horizon Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '6px 12px', borderRadius: '8px', fontSize: '12px' }}>
            <span style={{ color: '#065f46', fontWeight: 600 }}>Gross Margin:</span>{' '}
            <strong style={{ color: '#047857' }}>{summary.grossProfitMargin}%</strong>
          </div>
          <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '6px 12px', borderRadius: '8px', fontSize: '12px' }}>
            <span style={{ color: '#1e40af', fontWeight: 600 }}>Forecasted M+1:</span>{' '}
            <strong style={{ color: '#1d4ed8' }}>{formatCurrency(summary.forecastedRevenue)}</strong>
          </div>
        </div>
      </div>

      {/* 5 Core Financial Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
        {/* Total Revenue */}
        <div
          onClick={() => onNavigate('fi-revenue-analytics')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '18px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, border-color 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Revenue</span>
            <span style={{ fontSize: '14px' }}>📈</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '8px' }}>
            {formatCurrency(summary.totalRevenue)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11px' }}>
            <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
              +{summary.revenueGrowthPct}%
            </span>
            <span style={{ color: '#64748b' }}>vs. last month</span>
          </div>
        </div>

        {/* Forecasted Revenue */}
        <div
          onClick={() => onNavigate('fi-revenue-forecasting')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '18px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Forecasted Revenue</span>
            <span style={{ fontSize: '14px' }}>🔮</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0284c7', marginTop: '8px' }}>
            {formatCurrency(summary.forecastedRevenue)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11px' }}>
            <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
              +{summary.forecastedGrowthPct}%
            </span>
            <span style={{ color: '#64748b' }}>expected expansion</span>
          </div>
        </div>

        {/* Total Cost of Goods Sold */}
        <div
          onClick={() => onNavigate('fi-menu-profitability')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '18px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Food Cost (COGS)</span>
            <span style={{ fontSize: '14px' }}>🥩</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#dc2626', marginTop: '8px' }}>
            {formatCurrency(summary.totalCostOfGoodsSold)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11px' }}>
            <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
              {summary.cogsPercentage}%
            </span>
            <span style={{ color: '#64748b' }}>of gross revenue</span>
          </div>
        </div>

        {/* Gross Profit */}
        <div
          onClick={() => onNavigate('fi-menu-profitability')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '18px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Gross Profit</span>
            <span style={{ fontSize: '14px' }}>💰</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f766e', marginTop: '8px' }}>
            {formatCurrency(summary.grossProfit)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11px' }}>
            <span style={{ backgroundColor: '#ccfbf1', color: '#0f766e', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
              Margin: {summary.grossProfitMargin}%
            </span>
            <span style={{ color: '#64748b' }}>healthy baseline</span>
          </div>
        </div>

        {/* Inventory Risk Summary */}
        <div
          onClick={() => onNavigate('fi-inventory-opt')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '18px',
            border: '1px solid #fed7aa',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#9a3412', textTransform: 'uppercase' }}>Inventory Risks</span>
            <span style={{ fontSize: '14px' }}>⚠️</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#c2410c', marginTop: '8px' }}>
            {criticalInventoryCount} Critical SKUs
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11px' }}>
            <span style={{ backgroundColor: '#ffedd5', color: '#9a3412', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
              Action Required
            </span>
            <span style={{ color: '#64748b' }}>below safety stock</span>
          </div>
        </div>
      </div>

      {/* Main Revenue & Profit Trend Chart */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                RECENT 7-DAY REVENUE, PROFIT & COGS PERFORMANCE
              </h3>
              <button
                onClick={() => onNavigate('fi-revenue-analytics')}
                style={{ fontSize: '11px', color: '#0284c7', fontWeight: 700, textDecoration: 'underline' }}
              >
                Deep-Dive Analytics →
              </button>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Daily tracking of restaurant sales revenue vs realized gross contribution
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#0284c7' }} />
              <span>Gross Sales</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#0f766e' }} />
              <span>Gross Profit</span>
            </div>
          </div>
        </div>

        {/* Visual Chart Bars */}
        <div style={{ backgroundColor: '#f8fafc', padding: '20px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '170px', gap: '12px' }}>
            {recentTrends.map((d, i) => {
              const revPct = Math.round((d.revenue / maxRevenue) * 100);
              const profitPct = Math.round((d.profit / maxRevenue) * 100);

              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '4px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#0f172a' }}>
                    {(d.revenue / 1000000).toFixed(1)}M
                  </div>
                  <div style={{ width: '100%', maxWidth: '38px', display: 'flex', gap: '2px', height: '130px', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1, height: `${revPct}%`, backgroundColor: '#0284c7', borderRadius: '3px 3px 0 0' }} />
                    <div style={{ flex: 1, height: `${profitPct}%`, backgroundColor: '#0f766e', borderRadius: '3px 3px 0 0' }} />
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#475569', marginTop: '4px' }}>
                    {d.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2-Column Section: High-Demand Items vs Low-Profit Items */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
        {/* High-Demand Menu Items */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>🔥</span>
              <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                HIGH-DEMAND DISHES (TOP VOLUME)
              </h3>
            </div>
            <button
              onClick={() => onNavigate('fi-menu-demand')}
              style={{ fontSize: '11px', color: '#0f766e', fontWeight: 700 }}
            >
              Demand Forecast →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {highDemandDishes.map((dish) => (
              <div
                key={dish.dishId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #f1f5f9'
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{dish.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {dish.unitsSold} units sold • Margin: {dish.marginPct}%
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f766e' }}>
                    {formatCurrency(dish.totalRevenue)}
                  </div>
                  <span style={{ fontSize: '10px', backgroundColor: '#ccfbf1', color: '#0f766e', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    {dish.performanceCategory}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low-Profit Menu Items */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>📉</span>
              <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                MARGIN COMPRESSION & LOW-PROFIT DISHES
              </h3>
            </div>
            <button
              onClick={() => onNavigate('fi-menu-profitability')}
              style={{ fontSize: '11px', color: '#dc2626', fontWeight: 700 }}
            >
              Profitability Matrix →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {lowProfitDishes.map((dish) => (
              <div
                key={dish.dishId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  backgroundColor: '#fef2f2',
                  borderRadius: '8px',
                  border: '1px solid #fee2e2'
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{dish.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Unit Cost: {formatCurrency(dish.unitCost)} (High Food Cost)
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#dc2626' }}>
                    {dish.marginPct}% Margin
                  </div>
                  <span style={{ fontSize: '10px', backgroundColor: '#fee2e2', color: '#991b1b', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    {dish.performanceCategory}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2-Column Section: Recent Anomaly Alerts vs Urgent Recommendations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
        {/* Recent Anomaly Alerts */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>🚨</span>
              <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                RECENT ANOMALY & SHRINKAGE ALERTS
              </h3>
            </div>
            <button
              onClick={() => onNavigate('fi-anomalies')}
              style={{ fontSize: '11px', color: '#dc2626', fontWeight: 700 }}
            >
              All Anomalies ({MOCK_LOSS_AND_ANOMALIES.length}) →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentAnomalies.map((anom) => (
              <div
                key={anom.id}
                onClick={() => onNavigate('fi-anomalies')}
                style={{
                  padding: '10px 12px',
                  backgroundColor: anom.severity === 'Critical' ? '#fef2f2' : '#fffbeb',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: anom.severity === 'Critical' ? '#fecaca' : '#fde68a',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      backgroundColor: anom.severity === 'Critical' ? '#fee2e2' : '#fef3c7',
                      color: anom.severity === 'Critical' ? '#991b1b' : '#92400e',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 800
                    }}
                  >
                    {anom.severity}
                  </span>
                  <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                    {anom.timestamp}
                  </span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                  {anom.title}
                </div>
                <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                  {anom.affectedPeriodOrItem} • Variance: <strong>{anom.variancePct}%</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending AI Strategy Recommendations */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>💡</span>
              <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                PRIORITY BUSINESS RECOMMENDATIONS
              </h3>
            </div>
            <button
              onClick={() => onNavigate('fi-recommendations')}
              style={{ fontSize: '11px', color: '#0f766e', fontWeight: 700 }}
            >
              Action Center ({MOCK_RECOMMENDATION_ENGINE_DATA.length}) →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {urgentRecommendations.map((rec) => (
              <div
                key={rec.id}
                onClick={() => onNavigate('fi-recommendations')}
                style={{
                  padding: '10px 12px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '8px',
                  border: '1px solid #bbf7d0',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 800 }}>
                    {rec.priority} PRIORITY
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#166534' }}>
                    {rec.category}
                  </span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                  {rec.title}
                </div>
                <div style={{ fontSize: '11px', color: '#15803d', marginTop: '2px' }}>
                  Impact: {rec.expectedImpact}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards Hub */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
          FINANCIAL INTELLIGENCE MODULES SHORTCUT HUB
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <button
            onClick={() => onNavigate('fi-revenue-analytics')}
            style={{
              padding: '14px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0284c7' }}>📊 Revenue Analytics</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Daily, weekly, monthly sales & item breakdown</div>
          </button>

          <button
            onClick={() => onNavigate('fi-revenue-forecasting')}
            style={{
              padding: '14px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f766e' }}>🔮 Revenue Forecasting</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Predictive models with 95% confidence bands</div>
          </button>

          <button
            onClick={() => onNavigate('fi-menu-demand')}
            style={{
              padding: '14px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0284c7' }}>🍽️ Menu Demand Forecast</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Predicted sales quantities & peak prep days</div>
          </button>

          <button
            onClick={() => onNavigate('fi-menu-profitability')}
            style={{
              padding: '14px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f766e' }}>💰 Menu Profitability</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>COGS, gross profit margins & Star/Dog matrix</div>
          </button>

          <button
            onClick={() => onNavigate('fi-ingredient-demand')}
            style={{
              padding: '14px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#d97706' }}>🥕 Ingredient Demand</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>BOM decomposition & raw stock shortage gaps</div>
          </button>

          <button
            onClick={() => onNavigate('fi-inventory-opt')}
            style={{
              padding: '14px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#c2410c' }}>📦 Inventory Optimization</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>ROP calculations, safety stock & draft POs</div>
          </button>

          <button
            onClick={() => onNavigate('fi-anomalies')}
            style={{
              padding: '14px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#dc2626' }}>⚠️ Loss & Anomaly Detection</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Discrepancy alerts & root-cause investigations</div>
          </button>

          <button
            onClick={() => onNavigate('fi-recommendations')}
            style={{
              padding: '14px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#7c3aed' }}>💡 Recommendation Engine</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Actionable strategies with quantified impacts</div>
          </button>
        </div>
      </div>
    </div>
  );
};
