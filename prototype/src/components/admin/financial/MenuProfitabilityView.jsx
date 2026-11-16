import React, { useState, useMemo } from 'react';
import { MOCK_MENU_ITEMS_PERFORMANCE } from '../../../mock/adminFinancialData';

export const MenuProfitabilityView = () => {
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [classificationFilter, setClassificationFilter] = useState('All'); // 'All' | 'Star' | 'Plowhorse' | 'Puzzle' | 'Underperformer'
  const [sortBy, setSortBy] = useState('grossProfit'); // 'grossProfit' | 'totalRevenue' | 'marginPct' | 'unitsSold'

  const categories = ['All', 'Hotpot', 'BBQ / Grill', 'Appetizers', 'Drinks'];
  const classifications = ['All', 'Star', 'Plowhorse', 'Puzzle', 'Underperformer'];

  const filteredItems = useMemo(() => {
    let result = MOCK_MENU_ITEMS_PERFORMANCE.filter((item) => {
      const matchCat = categoryFilter === 'All' || item.category === categoryFilter;
      const matchClass = classificationFilter === 'All' || item.performanceCategory === classificationFilter;
      return matchCat && matchClass;
    });

    return result.sort((a, b) => b[sortBy] - a[sortBy]);
  }, [categoryFilter, classificationFilter, sortBy]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const totalRevenue = useMemo(() => {
    return filteredItems.reduce((acc, curr) => acc + curr.totalRevenue, 0);
  }, [filteredItems]);

  const totalCost = useMemo(() => {
    return filteredItems.reduce((acc, curr) => acc + curr.totalCost, 0);
  }, [filteredItems]);

  const totalProfit = useMemo(() => {
    return filteredItems.reduce((acc, curr) => acc + curr.grossProfit, 0);
  }, [filteredItems]);

  const overallMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0';

  const maxRevenue = Math.max(...MOCK_MENU_ITEMS_PERFORMANCE.map((d) => d.totalRevenue), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              MENU ITEM PROFITABILITY & ENGINEERING ANALYSIS
            </h2>
            <span style={{ backgroundColor: '#ccfbf1', color: '#0f766e', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
              Margin & COGS Optimization
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            Analyzing recipe food cost (COGS), gross margin generation, and menu matrix classification (Stars vs. Dogs).
          </p>
        </div>

        {/* Sorting and Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#ffffff', padding: '4px 10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: '12px', fontWeight: 700, color: '#0f172a', outline: 'none', cursor: 'pointer' }}
            >
              <option value="grossProfit">Gross Profit (Highest)</option>
              <option value="totalRevenue">Total Revenue (Highest)</option>
              <option value="marginPct">Margin % (Highest)</option>
              <option value="unitsSold">Units Sold (Highest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Aggregate KPI Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Filtered Menu Revenue
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
            {formatCurrency(totalRevenue)}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
            Across {filteredItems.length} menu items evaluated
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Food Cost (COGS)
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#dc2626', marginTop: '6px' }}>
            {formatCurrency(totalCost)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '11px' }}>
            <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
              {totalRevenue > 0 ? ((totalCost / totalRevenue) * 100).toFixed(1) : 0}% COGS
            </span>
            <span style={{ color: '#64748b' }}>of sales</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Gross Profit Realized
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f766e', marginTop: '6px' }}>
            {formatCurrency(totalProfit)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '11px' }}>
            <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
              Net Contribution
            </span>
            <span style={{ color: '#64748b' }}>Post raw ingredient BOM</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Average Gross Margin
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f766e', marginTop: '6px' }}>
            {overallMargin}%
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '11px' }}>
            <span style={{ backgroundColor: '#ccfbf1', color: '#0f766e', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
              Target &gt;= 65%
            </span>
            <span style={{ color: '#64748b' }}>Healthy operation status</span>
          </div>
        </div>
      </div>

      {/* Visual Revenue vs Cost vs Profit Comparative Bars */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
              REVENUE VS. INGREDIENT COST (COGS) VS. GROSS PROFIT BY DISH
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Side-by-side comparative breakdown showing net contribution dollar spread
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11px', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#0284c7' }} />
              <span>Total Revenue</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#dc2626' }} />
              <span>Ingredient COGS</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#0f766e' }} />
              <span>Gross Profit</span>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#f8fafc', padding: '20px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '210px', gap: '14px' }}>
            {filteredItems.map((dish) => {
              const revPct = Math.round((dish.totalRevenue / maxRevenue) * 100);
              const costPct = Math.round((dish.totalCost / maxRevenue) * 100);
              const profitPct = Math.round((dish.grossProfit / maxRevenue) * 100);

              return (
                <div
                  key={dish.dishId}
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
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#0f766e' }}>
                    {(dish.grossProfit / 1000000).toFixed(1)}M
                  </div>

                  <div style={{ width: '100%', maxWidth: '48px', display: 'flex', gap: '2px', height: '160px', alignItems: 'flex-end' }}>
                    {/* Revenue Bar */}
                    <div
                      style={{ flex: 1, height: `${revPct}%`, backgroundColor: '#0284c7', borderRadius: '3px 3px 0 0' }}
                      title={`Revenue: ${formatCurrency(dish.totalRevenue)}`}
                    />
                    {/* COGS Bar */}
                    <div
                      style={{ flex: 1, height: `${costPct}%`, backgroundColor: '#dc2626', borderRadius: '3px 3px 0 0' }}
                      title={`COGS: ${formatCurrency(dish.totalCost)}`}
                    />
                    {/* Profit Bar */}
                    <div
                      style={{ flex: 1, height: `${profitPct}%`, backgroundColor: '#0f766e', borderRadius: '3px 3px 0 0' }}
                      title={`Profit: ${formatCurrency(dish.grossProfit)}`}
                    />
                  </div>

                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#0f172a',
                      textAlign: 'center',
                      maxWidth: '75px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                    title={dish.name}
                  >
                    {dish.name}
                  </div>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: dish.marginPct >= 65 ? '#166534' : '#991b1b' }}>
                    {dish.marginPct}% mrg
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Menu Matrix Classification Guide Box */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        <div style={{ padding: '12px 14px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: '#166534' }}>
            <span>⭐ STAR</span>
            <span style={{ fontSize: '10px', backgroundColor: '#dcfce7', padding: '1px 5px', borderRadius: '3px' }}>High Vol, High Margin</span>
          </div>
          <div style={{ fontSize: '11px', color: '#14532d', marginTop: '4px' }}>
            Seafood Hotpot, Ribeye, Salmon, Spring Rolls. Maintain quality and prominent placement.
          </div>
        </div>

        <div style={{ padding: '12px 14px', borderRadius: '8px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: '#1e40af' }}>
            <span>🐴 PLOWHORSE</span>
            <span style={{ fontSize: '10px', backgroundColor: '#dbeafe', padding: '1px 5px', borderRadius: '3px' }}>High Vol, Moderate Margin</span>
          </div>
          <div style={{ fontSize: '11px', color: '#1e3a8a', marginTop: '4px' }}>
            US Beef Slices, Iced Herbal Tea. High volume staple; optimize portion control and ingredient procurement.
          </div>
        </div>

        <div style={{ padding: '12px 14px', borderRadius: '8px', backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: '#92400e' }}>
            <span>🧩 PUZZLE</span>
            <span style={{ fontSize: '10px', backgroundColor: '#fef3c7', padding: '1px 5px', borderRadius: '3px' }}>Low Vol, High Margin</span>
          </div>
          <div style={{ fontSize: '11px', color: '#78350f', marginTop: '4px' }}>
            Grilled Wagyu Skewers. High potential profitability; requires server upselling and marketing push.
          </div>
        </div>

        <div style={{ padding: '12px 14px', borderRadius: '8px', backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: '#991b1b' }}>
            <span>🐕 UNDERPERFORMER</span>
            <span style={{ fontSize: '10px', backgroundColor: '#fee2e2', padding: '1px 5px', borderRadius: '3px' }}>Low Vol, Low Margin</span>
          </div>
          <div style={{ fontSize: '11px', color: '#7f1d1d', marginTop: '4px' }}>
            Fresh Oysters Rockefeller. High spoilage rate, low margins. Consider menu reformulation or retirement.
          </div>
        </div>
      </div>

      {/* Comprehensive Profitability Comparison Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
              PROFITABILITY & UNIT ECONOMICS COMPARISON TABLE
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Itemized selling price, unit cost, margin % and total dollar profit generated
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
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Matrix Class:</span>
              <select
                value={classificationFilter}
                onChange={(e) => setClassificationFilter(e.target.value)}
                style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              >
                {classifications.map((cl) => (
                  <option key={cl} value={cl}>{cl}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
              <tr>
                <th style={{ padding: '12px 16px' }}>Menu Item</th>
                <th style={{ padding: '12px 16px' }}>Category</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Selling Price</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Unit Cost (COGS)</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Unit Margin</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Units Sold</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total Revenue</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total Profit</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Margin %</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Matrix Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const unitMargin = item.sellingPrice - item.unitCost;
                const isHighProfit = item.marginPct >= 65;
                const isLowProfit = item.marginPct < 60;

                return (
                  <tr key={item.dishId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                      {item.name}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{item.category}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      {formatCurrency(item.sellingPrice)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#dc2626' }}>
                      {formatCurrency(item.unitCost)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0f766e' }}>
                      {formatCurrency(unitMargin)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                      {item.unitsSold}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#0284c7' }}>
                      {formatCurrency(item.totalRevenue)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#0f766e' }}>
                      {formatCurrency(item.grossProfit)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span
                        style={{
                          backgroundColor: isHighProfit ? '#dcfce7' : isLowProfit ? '#fee2e2' : '#fef3c7',
                          color: isHighProfit ? '#166534' : isLowProfit ? '#991b1b' : '#92400e',
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
                          backgroundColor:
                            item.performanceCategory === 'Star'
                              ? '#ccfbf1'
                              : item.performanceCategory === 'Plowhorse'
                              ? '#dbeafe'
                              : item.performanceCategory === 'Puzzle'
                              ? '#fef3c7'
                              : '#fee2e2',
                          color:
                            item.performanceCategory === 'Star'
                              ? '#0f766e'
                              : item.performanceCategory === 'Plowhorse'
                              ? '#1e40af'
                              : item.performanceCategory === 'Puzzle'
                              ? '#92400e'
                              : '#991b1b',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 800
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
