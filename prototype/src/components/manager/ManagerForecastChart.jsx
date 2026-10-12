import React, { useState } from 'react';
import { MOCK_AI_FORECAST } from '../../mock/data';

export const ManagerForecastChart = () => {
  const forecast = MOCK_AI_FORECAST;
  const [selectedDay, setSelectedDay] = useState('Sat');

  const activePoint = forecast.dataPoints.find((p) => p.day === selectedDay) || forecast.dataPoints[5];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Forecast Chart Panel */}
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                7-DAY PREDICTIVE AI DEMAND & REVENUE FORECAST ({forecast.modelType})
              </h3>
              <span style={{ backgroundColor: '#ccfbf1', color: '#0f766e', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                SCR-MGR-01
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Time-series ARIMA/Prophet demand inference with 95% Confidence Interval Envelope Bands
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
              Model MAPE: {forecast.modelMape}% (High Precision)
            </div>
            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
              Confidence: {forecast.confidenceLevel}% CI
            </div>
          </div>
        </div>

        {/* Graphical Trend Bar / Curve Visualization with Explicit CI Bounds */}
        <div style={{ padding: '24px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '190px', padding: '0 16px' }}>
            {forecast.dataPoints.map((pt) => {
              const heightPct = (pt.revenueM / 40) * 100;
              const isSelected = pt.day === selectedDay;
              const isPeak = pt.day === 'Sat';

              return (
                <div
                  key={pt.day}
                  onClick={() => setSelectedDay(pt.day)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    flex: 1,
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 800, color: isPeak ? '#0f766e' : '#475569' }}>
                    {pt.revenueM}M
                  </div>
                  <div style={{ fontSize: '9px', color: '#94a3b8' }}>
                    [{pt.lowerM} - {pt.upperM}]
                  </div>

                  {/* Bar with Confidence Interval Envelope */}
                  <div
                    style={{
                      width: '42px',
                      height: `${heightPct}%`,
                      backgroundColor: isSelected ? '#0f766e' : isPeak ? '#14b8a6' : '#38bdf8',
                      borderRadius: '6px 6px 0 0',
                      position: 'relative',
                      boxShadow: isSelected ? '0 0 0 3px #ccfbf1, 0 4px 10px rgba(15, 118, 110, 0.4)' : isPeak ? '0 4px 6px rgba(20, 184, 166, 0.3)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Upper Confidence Band Indicator */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '-5px',
                        left: '0',
                        right: '0',
                        height: '2px',
                        backgroundColor: '#64748b'
                      }}
                      title={`Upper bound: ${pt.upperM}M`}
                    />
                  </div>

                  <div style={{ fontSize: '12px', fontWeight: isSelected ? 800 : 700, color: isSelected ? '#0f766e' : '#0f172a', marginTop: '4px' }}>
                    {pt.day} {isSelected && '•'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    {pt.covers} covers
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Day Focus Summary */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '16px', fontSize: '12px' }}>
            <div style={{ color: '#475569' }}>
              Selected Day: <strong style={{ color: '#0f766e' }}>{activePoint.day}</strong> • Revenue Projection: <strong>{activePoint.revenueM}M VND</strong> • 95% Confidence Band: <strong>{activePoint.lowerM}M - {activePoint.upperM}M</strong> • Projected Traffic: <strong>{activePoint.covers} covers</strong>
            </div>
            <div style={{ fontWeight: 700, color: '#0f766e' }}>
              ★ Projected Weekend Peak: 34.0M VND (Saturday, +35% traffic surge)
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div>
        <div style={{ fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>AUTOMATED OPERATIONAL RECOMMENDATIONS (ACTIONABLE AI INSIGHTS):</span>
          <span style={{ fontSize: '10px', backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>
            Next 48 Hours
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
          {forecast.recommendations.map((rec) => (
            <div
              key={rec.id}
              style={{
                border: '1px solid #bbf7d0',
                backgroundColor: '#f0fdf4',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                gap: '14px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <span style={{ fontSize: '28px' }}>
                {rec.type === 'Staffing' ? '👥' : '📦'}
              </span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{rec.title}</span>
                  <span style={{ fontSize: '10px', backgroundColor: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px' }}>
                    {rec.type}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#14532d', marginTop: '6px', lineHeight: 1.5 }}>
                  {rec.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
