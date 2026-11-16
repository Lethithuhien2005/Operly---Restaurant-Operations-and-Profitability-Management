import React, { useState } from 'react';
import { MOCK_REVENUE_FORECAST_DATA } from '../../../mock/adminFinancialData';

export const RevenueForecastingView = () => {
  const [forecastHorizon, setForecastHorizon] = useState('daily'); // 'daily' | 'weekly' | 'monthly'
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);

  const forecastData = MOCK_REVENUE_FORECAST_DATA[forecastHorizon] || MOCK_REVENUE_FORECAST_DATA.daily;

  const maxVal = Math.max(
    ...forecastData.map((d) => Math.max(d.forecast || 0, d.historical || 0, d.upperBound || 0)),
    1
  );

  const formatCurrency = (val) => {
    if (!val && val !== 0) return '—';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const activePoint = selectedDataPoint || forecastData[forecastData.length - 1];

  const totalForecastedRevenue = forecastData.reduce((acc, curr) => acc + (curr.forecast || curr.historical || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header & Forecast Horizon Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              PREDICTIVE REVENUE FORECASTING ENGINE
            </h2>
            <span style={{ backgroundColor: '#ccfbf1', color: '#0f766e', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
              Ensemble ML Simulation
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            Multi-horizon time series forecasting combining Prophet and Holt-Winters with 95% Confidence Intervals.
          </p>
        </div>

        {/* Horizon Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', backgroundColor: '#e2e8f0', borderRadius: '8px', padding: '2px' }}>
            <button
              onClick={() => {
                setForecastHorizon('daily');
                setSelectedDataPoint(null);
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: forecastHorizon === 'daily' ? '#0f766e' : 'transparent',
                color: forecastHorizon === 'daily' ? '#ffffff' : '#475569'
              }}
            >
              7-Day Daily Horizon
            </button>
            <button
              onClick={() => {
                setForecastHorizon('weekly');
                setSelectedDataPoint(null);
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: forecastHorizon === 'weekly' ? '#0f766e' : 'transparent',
                color: forecastHorizon === 'weekly' ? '#ffffff' : '#475569'
              }}
            >
              4-Week Monthly Outlook
            </button>
            <button
              onClick={() => {
                setForecastHorizon('monthly');
                setSelectedDataPoint(null);
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: forecastHorizon === 'monthly' ? '#0f766e' : 'transparent',
                color: forecastHorizon === 'monthly' ? '#ffffff' : '#475569'
              }}
            >
              Q4 Long-Range Projection
            </button>
          </div>
        </div>
      </div>

      {/* Forecast Accuracy & Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Forecast Horizon Aggregate
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f766e', marginTop: '6px' }}>
            {formatCurrency(totalForecastedRevenue)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11px' }}>
            <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              +6.35% Growth
            </span>
            <span style={{ color: '#64748b' }}>projected run-rate expansion</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Model Precision (MAPE)
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
            {MOCK_REVENUE_FORECAST_DATA.modelAccuracyMape}%
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11px' }}>
            <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              High Accuracy
            </span>
            <span style={{ color: '#64748b' }}>Mean Abs % Error &lt; 10% benchmark</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Statistical Confidence Interval
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
            {MOCK_REVENUE_FORECAST_DATA.confidenceInterval}% CI
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11px' }}>
            <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              Prophet / ARIMA
            </span>
            <span style={{ color: '#64748b' }}>two-sided parametric bands</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Expected Peak Revenue Window
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0284c7', marginTop: '6px' }}>
            {forecastHorizon === 'daily' ? 'Saturday (+35%)' : forecastHorizon === 'weekly' ? 'Week 41' : 'December (Holiday)'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11px' }}>
            <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              Action Ready
            </span>
            <span style={{ color: '#64748b' }}>staffing & prep buffers aligned</span>
          </div>
        </div>
      </div>

      {/* Main Forecast Chart with Confidence Bands & Historical Comparison */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
              HISTORICAL VS. FORECASTED REVENUE PROJECTION ({forecastHorizon.toUpperCase()})
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Solid bars represent settled actuals; dashed / highlighted bars show forecasted values with 95% confidence intervals
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11px', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#64748b' }} />
              <span style={{ color: '#334155' }}>Historical Actuals</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#0f766e' }} />
              <span style={{ color: '#334155' }}>Predicted Revenue</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '2px', backgroundColor: '#cbd5e1', borderTop: '2px dashed #94a3b8' }} />
              <span style={{ color: '#334155' }}>95% CI Envelope [Low - High]</span>
            </div>
          </div>
        </div>

        {/* Visual Forecast Bars */}
        <div style={{ backgroundColor: '#f8fafc', padding: '24px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '220px', gap: '14px' }}>
            {forecastData.map((pt, idx) => {
              const isHistorical = pt.historical !== null && pt.historical !== undefined;
              const mainVal = isHistorical ? pt.historical : pt.forecast;
              const heightPct = Math.round((mainVal / maxVal) * 100);
              const isSelected = activePoint.period === pt.period;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDataPoint(pt)}
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
                  <div style={{ fontSize: '11px', fontWeight: 800, color: isHistorical ? '#475569' : '#0f766e' }}>
                    {(mainVal / 1000000).toFixed(1)}M
                  </div>

                  {pt.lowerBound && (
                    <div style={{ fontSize: '9px', color: '#94a3b8' }}>
                      [{(pt.lowerBound / 1000000).toFixed(1)}M - {(pt.upperBound / 1000000).toFixed(1)}M]
                    </div>
                  )}

                  {/* Forecast Bar */}
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '48px',
                      height: `${heightPct}%`,
                      backgroundColor: isHistorical
                        ? '#64748b'
                        : isSelected
                        ? '#0f766e'
                        : pt.isWeekend
                        ? '#14b8a6'
                        : '#2dd4bf',
                      borderRadius: '6px 6px 0 0',
                      position: 'relative',
                      boxShadow: isSelected
                        ? '0 0 0 3px #ccfbf1, 0 4px 12px rgba(15,118,110,0.3)'
                        : 'none',
                      transition: 'all 0.2s ease',
                      border: !isHistorical ? '1px dashed #0d9488' : 'none'
                    }}
                  >
                    {/* Upper Band Cap Marker */}
                    {pt.upperBound && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '-6px',
                          left: '0',
                          right: '0',
                          height: '2px',
                          backgroundColor: '#0f766e'
                        }}
                        title={`95% Upper Bound: ${formatCurrency(pt.upperBound)}`}
                      />
                    )}
                  </div>

                  <div style={{ fontSize: '11px', fontWeight: isSelected ? 800 : 600, color: isSelected ? '#0f766e' : '#0f172a', textAlign: 'center' }}>
                    {pt.period}
                  </div>
                  <div style={{ fontSize: '10px', color: isHistorical ? '#64748b' : '#0f766e', fontWeight: 600 }}>
                    {isHistorical ? 'Historical' : 'Forecast'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Selected Data Point Focus Details */}
          {activePoint && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '14px', marginTop: '16px', fontSize: '12px' }}>
              <div style={{ color: '#475569' }}>
                Focused Interval: <strong style={{ color: '#0f172a' }}>{activePoint.period}</strong> • Revenue Value:{' '}
                <strong style={{ color: '#0f766e' }}>
                  {formatCurrency(activePoint.forecast || activePoint.historical)}
                </strong>
                {activePoint.lowerBound && (
                  <span>
                    {' '}• 95% Confidence Band: <strong>{formatCurrency(activePoint.lowerBound)}</strong> to <strong>{formatCurrency(activePoint.upperBound)}</strong>
                  </span>
                )}
              </div>
              <div style={{ fontWeight: 700, color: '#0f766e' }}>
                Status: {activePoint.historical ? 'Actual Audited Ledger' : 'Simulated AI Prediction (Unsettled)'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Forecast Data Breakdown Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
            DETAILED FORECAST TIMETABLE & CONFIDENCE LIMITS
          </h3>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            Numerical breakdown of historical vs simulated forecast points with upper/lower bounds
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
              <tr>
                <th style={{ padding: '12px 16px' }}>Period</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Data Type</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Historical Revenue</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Forecasted Revenue</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>95% Lower Bound</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>95% Upper Bound</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Confidence Band Width</th>
              </tr>
            </thead>
            <tbody>
              {forecastData.map((row, i) => {
                const isHist = row.historical !== null && row.historical !== undefined;
                const bandWidth = row.upperBound && row.lowerBound ? row.upperBound - row.lowerBound : null;

                return (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>{row.period}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span
                        style={{
                          backgroundColor: isHist ? '#f1f5f9' : '#ccfbf1',
                          color: isHist ? '#475569' : '#0f766e',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700
                        }}
                      >
                        {isHist ? 'Historical' : 'Predicted'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: isHist ? '#0f172a' : '#94a3b8' }}>
                      {formatCurrency(row.historical)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: !isHist ? '#0f766e' : '#94a3b8' }}>
                      {formatCurrency(row.forecast)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#64748b' }}>
                      {formatCurrency(row.lowerBound)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#64748b' }}>
                      {formatCurrency(row.upperBound)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: '#0f766e', fontWeight: 600 }}>
                      {bandWidth ? `± ${((bandWidth / (2 * row.forecast)) * 100).toFixed(1)}%` : '—'}
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
