import React, { useState, useMemo } from 'react';
import { MOCK_MENU_DEMAND_FORECAST } from '../../../mock/adminFinancialData';

export const MenuDemandForecastingView = () => {
  const [forecastHorizon, setForecastHorizon] = useState('7days'); // '7days' | '30days'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [demandLevelFilter, setDemandLevelFilter] = useState('All'); // 'All' | 'High Demand' | 'Moderate Demand' | 'Low Demand'
  const [activeDish, setActiveDish] = useState(null);

  const categories = ['All', 'Hotpot', 'BBQ / Grill', 'Appetizers', 'Drinks'];

  const filteredDishes = useMemo(() => {
    return MOCK_MENU_DEMAND_FORECAST.filter((dish) => {
      const matchCat = selectedCategory === 'All' || dish.category === selectedCategory;
      const matchDemand = demandLevelFilter === 'All' || dish.demandLevel === demandLevelFilter;
      return matchCat && matchDemand;
    });
  }, [selectedCategory, demandLevelFilter]);

  const maxVolume = useMemo(() => {
    return Math.max(
      ...MOCK_MENU_DEMAND_FORECAST.map((d) =>
        forecastHorizon === '7days' ? d.next7DaysForecast : d.next30DaysForecast
      ),
      1
    );
  }, [forecastHorizon]);

  const totalPredictedVolume = useMemo(() => {
    return filteredDishes.reduce(
      (sum, d) => sum + (forecastHorizon === '7days' ? d.next7DaysForecast : d.next30DaysForecast),
      0
    );
  }, [filteredDishes, forecastHorizon]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              MENU ITEM DEMAND FORECASTING
            </h2>
            <span style={{ backgroundColor: '#ccfbf1', color: '#0f766e', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
              Dish-Level Volume AI
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            Predicting dish sales volume, kitchen prep allocations, and peak traffic days.
          </p>
        </div>

        {/* Forecast Period Switcher */}
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
              Next 7 Days (Weekly Prep)
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
              Next 30 Days (Monthly Horizon)
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Total Predicted Servings
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
            {totalPredictedVolume.toLocaleString()} portions
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11px' }}>
            <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              +14.2% Demand Surge
            </span>
            <span style={{ color: '#64748b' }}>vs. previous {forecastHorizon === '7days' ? '7 days' : '30 days'}</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            High-Demand Menu Items
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f766e', marginTop: '6px' }}>
            {MOCK_MENU_DEMAND_FORECAST.filter((d) => d.demandLevel === 'High Demand').length} Dishes
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11px' }}>
            <span style={{ backgroundColor: '#ccfbf1', color: '#0f766e', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              Kitchen Priority
            </span>
            <span style={{ color: '#64748b' }}>Requires advance ingredient staging</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Low-Demand / Spoilage Risks
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#dc2626', marginTop: '6px' }}>
            {MOCK_MENU_DEMAND_FORECAST.filter((d) => d.demandLevel === 'Low Demand').length} Dish
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11px' }}>
            <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              Negative Velocity (-10%)
            </span>
            <span style={{ color: '#64748b' }}>Oysters Rockefeller</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Heaviest Production Peak
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0284c7', marginTop: '6px' }}>
            Saturday Dinner
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11px' }}>
            <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              BOH Staffing Focus
            </span>
            <span style={{ color: '#64748b' }}>Hotpot & Grill peak load</span>
          </div>
        </div>
      </div>

      {/* Demand Comparison Visual Bar Chart */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
              PREDICTED DEMAND VOLUME BY MENU ITEM ({forecastHorizon === '7days' ? 'NEXT 7 DAYS' : 'NEXT 30 DAYS'})
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Visualizing portion sales forecast and prep pressure per kitchen item
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#0f766e' }} />
              <span>High Demand</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#0284c7' }} />
              <span>Moderate</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#dc2626' }} />
              <span>Low Demand</span>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#f8fafc', padding: '20px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '190px', gap: '12px' }}>
            {filteredDishes.map((d) => {
              const val = forecastHorizon === '7days' ? d.next7DaysForecast : d.next30DaysForecast;
              const heightPct = Math.round((val / maxVolume) * 100);
              const isHigh = d.demandLevel === 'High Demand';
              const isLow = d.demandLevel === 'Low Demand';
              const barColor = isHigh ? '#0f766e' : isLow ? '#dc2626' : '#0284c7';

              return (
                <div
                  key={d.dishId}
                  onClick={() => setActiveDish(d)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 800, color: barColor }}>
                    {val}
                  </div>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '46px',
                      height: `${heightPct}%`,
                      backgroundColor: barColor,
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.3s ease'
                    }}
                    title={`${d.name}: ${val} portions`}
                  />
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
                    title={d.name}
                  >
                    {d.name}
                  </div>
                  <div style={{ fontSize: '9px', color: '#64748b' }}>
                    {d.trend}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Menu Demand Table with Category & Demand Level Filters */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
              ITEM-BY-ITEM PREDICTIVE DEMAND & PREPARATION INSTRUCTIONS
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Granular predictions with kitchen batching and staging recommendations
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Category Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Demand Level Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Level:</span>
              <select
                value={demandLevelFilter}
                onChange={(e) => setDemandLevelFilter(e.target.value)}
                style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              >
                <option value="All">All Demand Levels</option>
                <option value="High Demand">High Demand Only</option>
                <option value="Moderate Demand">Moderate Demand Only</option>
                <option value="Low Demand">Low Demand Only</option>
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
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Recent Sold</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>7-Day Forecast</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>30-Day Forecast</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Demand Level</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Growth Velocity</th>
                <th style={{ padding: '12px 16px' }}>Peak Service Day</th>
                <th style={{ padding: '12px 16px' }}>Prep Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {filteredDishes.map((dish) => {
                const isHigh = dish.demandLevel === 'High Demand';
                const isLow = dish.demandLevel === 'Low Demand';

                return (
                  <tr key={dish.dishId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                      {dish.name}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{dish.category}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748b' }}>
                      {dish.currentWeekSold}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                      {dish.next7DaysForecast}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#0f766e' }}>
                      {dish.next30DaysForecast}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span
                        style={{
                          backgroundColor: isHigh ? '#ccfbf1' : isLow ? '#fee2e2' : '#e0f2fe',
                          color: isHigh ? '#0f766e' : isLow ? '#991b1b' : '#0369a1',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700
                        }}
                      >
                        {dish.demandLevel}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: dish.trendDirection === 'up' ? '#166534' : '#dc2626' }}>
                      {dish.trend}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>
                      ★ {dish.peakDay}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569', fontSize: '11px' }}>
                      {dish.prepRecommendation}
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
