import React, { useState, useMemo } from 'react';
import {
  MOCK_FINANCIAL_SUMMARY,
  MOCK_REVENUE_TRENDS,
  MOCK_MENU_ITEMS_PERFORMANCE
} from '../../../mock/adminFinancialData';

export const RevenueAnalyticsView = () => {
  const [timeGranularity, setTimeGranularity] = useState('daily'); // 'daily' | 'weekly' | 'monthly'
  const [dateRange, setDateRange] = useState('last30days'); // 'last7days' | 'last30days' | 'thisMonth' | 'lastQuarter'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItemDetail, setSelectedItemDetail] = useState(null);

  const trendData = MOCK_REVENUE_TRENDS[timeGranularity] || MOCK_REVENUE_TRENDS.daily;

  const maxRevenue = useMemo(() => {
    return Math.max(...trendData.map((d) => d.revenue), 1);
  }, [trendData]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') return MOCK_MENU_ITEMS_PERFORMANCE;
    return MOCK_MENU_ITEMS_PERFORMANCE.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  const categories = ['All', 'Hotpot', 'BBQ / Grill', 'Appetizers', 'Drinks'];

  // Top and bottom performers
  const topPerformers = useMemo(() => {
    return [...MOCK_MENU_ITEMS_PERFORMANCE].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 3);
  }, []);

  const bottomPerformers = useMemo(() => {
    return [...MOCK_MENU_ITEMS_PERFORMANCE].sort((a, b) => a.totalRevenue - b.totalRevenue).slice(0, 3);
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const totalPeriodRevenue = useMemo(() => {
    return trendData.reduce((acc, curr) => acc + curr.revenue, 0);
  }, [trendData]);

  const totalPeriodOrders = useMemo(() => {
    return trendData.reduce((acc, curr) => acc + curr.orders, 0);
  }, [trendData]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header & Global Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              REVENUE ANALYTICS & SALES PERFORMANCE
            </h2>
            <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
              Historical Deep Dive
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            Multi-period revenue metrics, item contribution breakdown, and period-over-period variance analysis.
          </p>
        </div>

        {/* Date Filter & Export Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#ffffff', padding: '4px 10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Period:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: '12px', fontWeight: 700, color: '#0f172a', outline: 'none', cursor: 'pointer' }}
            >
              <option value="last7days">Last 7 Days (Sep 14 - Sep 20)</option>
              <option value="last30days">Last 30 Days (Aug 22 - Sep 20)</option>
              <option value="thisMonth">Current Month (September 2026)</option>
              <option value="lastQuarter">Q3 2026 (Jul - Sep)</option>
            </select>
          </div>

          <div style={{ display: 'flex', backgroundColor: '#e2e8f0', borderRadius: '8px', padding: '2px' }}>
            <button
              onClick={() => setTimeGranularity('daily')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: timeGranularity === 'daily' ? '#0f766e' : 'transparent',
                color: timeGranularity === 'daily' ? '#ffffff' : '#475569'
              }}
            >
              Daily
            </button>
            <button
              onClick={() => setTimeGranularity('weekly')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: timeGranularity === 'weekly' ? '#0f766e' : 'transparent',
                color: timeGranularity === 'weekly' ? '#ffffff' : '#475569'
              }}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeGranularity('monthly')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: timeGranularity === 'monthly' ? '#0f766e' : 'transparent',
                color: timeGranularity === 'monthly' ? '#ffffff' : '#475569'
              }}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Total Period Revenue
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
            {formatCurrency(totalPeriodRevenue)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11px' }}>
            <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              +{MOCK_FINANCIAL_SUMMARY.revenueGrowthPct}%
            </span>
            <span style={{ color: '#64748b' }}>vs. previous period ({formatCurrency(MOCK_FINANCIAL_SUMMARY.previousPeriodRevenue)})</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Average Ticket Size
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
            {formatCurrency(MOCK_FINANCIAL_SUMMARY.averageTicketSize)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11px' }}>
            <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              +4.8%
            </span>
            <span style={{ color: '#64748b' }}>dine-in guest spend lift</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Total Order Volume
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
            {totalPeriodOrders.toLocaleString()} Orders
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11px' }}>
            <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              +9.3%
            </span>
            <span style={{ color: '#64748b' }}>table turnover expansion</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Gross Profit Margin
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f766e', marginTop: '6px' }}>
            {MOCK_FINANCIAL_SUMMARY.grossProfitMargin}%
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11px' }}>
            <span style={{ backgroundColor: '#ccfbf1', color: '#0f766e', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              Target: 65.0%
            </span>
            <span style={{ color: '#64748b' }}>Food Cost: {MOCK_FINANCIAL_SUMMARY.cogsPercentage}%</span>
          </div>
        </div>
      </div>

      {/* Main Revenue Trend Chart Panel */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
              Revenue & Profit Growth Trend ({timeGranularity.toUpperCase()} VIEW)
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Visualizing Gross Sales, Food Cost (COGS), and Realized Profit across timeline
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11px', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#0284c7' }} />
              <span style={{ color: '#334155' }}>Gross Revenue</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#0f766e' }} />
              <span style={{ color: '#334155' }}>Gross Profit</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#f97316' }} />
              <span style={{ color: '#334155' }}>COGS (Cost)</span>
            </div>
          </div>
        </div>

        {/* Interactive Chart Bars */}
        <div style={{ backgroundColor: '#f8fafc', padding: '20px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '200px', gap: '12px' }}>
            {trendData.map((item, idx) => {
              const heightPct = Math.round((item.revenue / maxRevenue) * 100);
              const profitPct = Math.round((item.profit / maxRevenue) * 100);

              return (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                    gap: '6px'
                  }}
                >
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#0f172a' }}>
                    {(item.revenue / 1000000).toFixed(1)}M
                  </div>

                  {/* Dual Bar stack */}
                  <div style={{ width: '100%', maxWidth: '42px', display: 'flex', gap: '3px', height: '160px', alignItems: 'flex-end' }}>
                    {/* Revenue Bar */}
                    <div
                      title={`Revenue: ${formatCurrency(item.revenue)}`}
                      style={{
                        flex: 1,
                        height: `${heightPct}%`,
                        backgroundColor: '#0284c7',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s ease'
                      }}
                    />
                    {/* Profit Bar */}
                    <div
                      title={`Profit: ${formatCurrency(item.profit)}`}
                      style={{
                        flex: 1,
                        height: `${profitPct}%`,
                        backgroundColor: '#0f766e',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s ease'
                      }}
                    />
                  </div>

                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#475569', marginTop: '4px' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                    {item.orders} ord
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top vs Lowest Performing Items Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
        {/* Best Performing Menu Items */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '16px' }}>🏆</span>
              <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                TOP PERFORMING MENU ITEMS (REVENUE DRIVERS)
              </h3>
            </div>
            <span style={{ fontSize: '11px', color: '#166534', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              High Margin & Volume
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topPerformers.map((dish, i) => (
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#0f766e', color: '#fff', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {i + 1}
                  </span>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{dish.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      {dish.category} • {dish.unitsSold} sold • Margin: {dish.marginPct}%
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
                    {formatCurrency(dish.totalRevenue)}
                  </div>
                  <div style={{ fontSize: '10px', color: '#166534', fontWeight: 700 }}>
                    +{dish.growthVsLastMonth}% growth
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lowest Performing / Underperforming Items */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '16px' }}>⚠️</span>
              <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                LOWEST PERFORMING & HIGH-COST MENU ITEMS
              </h3>
            </div>
            <span style={{ fontSize: '11px', color: '#991b1b', backgroundColor: '#fee2e2', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              Needs Review
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {bottomPerformers.map((dish, i) => (
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#dc2626', color: '#fff', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    !
                  </span>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{dish.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      {dish.category} • Only {dish.unitsSold} sold • High Cost: {100 - dish.marginPct}%
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
                    {formatCurrency(dish.totalRevenue)}
                  </div>
                  <div style={{ fontSize: '10px', color: dish.growthVsLastMonth < 0 ? '#dc2626' : '#64748b', fontWeight: 700 }}>
                    {dish.growthVsLastMonth}% vs prev month
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Breakdown by Menu Item Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
              REVENUE CONTRIBUTION & MARGIN BY MENU ITEM
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Comprehensive item-level sales volume, gross profit generated, and menu classification
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Category:</span>
            <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '6px' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: selectedCategory === cat ? '#0f766e' : 'transparent',
                    color: selectedCategory === cat ? '#ffffff' : '#64748b'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
              <tr>
                <th style={{ padding: '12px 16px' }}>Rank</th>
                <th style={{ padding: '12px 16px' }}>Dish Name</th>
                <th style={{ padding: '12px 16px' }}>Category</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Selling Price</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Units Sold</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total Revenue</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total COGS</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Gross Profit</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Margin %</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Classification</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const isStar = item.performanceCategory === 'Star';
                const isUnderperformer = item.performanceCategory === 'Underperformer';

                return (
                  <tr
                    key={item.dishId}
                    style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: selectedItemDetail?.dishId === item.dishId ? '#f0fdfa' : 'transparent' }}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#64748b' }}>#{item.rank}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                      {item.name}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{item.category}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      {formatCurrency(item.sellingPrice)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                      {item.unitsSold}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#0284c7' }}>
                      {formatCurrency(item.totalRevenue)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#dc2626' }}>
                      {formatCurrency(item.totalCost)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#0f766e' }}>
                      {formatCurrency(item.grossProfit)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span
                        style={{
                          backgroundColor: item.marginPct >= 65 ? '#dcfce7' : item.marginPct >= 55 ? '#ffedd5' : '#fee2e2',
                          color: item.marginPct >= 65 ? '#166534' : item.marginPct >= 55 ? '#9a3412' : '#991b1b',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700
                        }}
                      >
                        {item.marginPct}%
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span
                        style={{
                          backgroundColor: isStar ? '#ccfbf1' : isUnderperformer ? '#fee2e2' : '#f1f5f9',
                          color: isStar ? '#0f766e' : isUnderperformer ? '#991b1b' : '#475569',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 800,
                          textTransform: 'uppercase'
                        }}
                      >
                        {item.performanceCategory}
                      </span>
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
