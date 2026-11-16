import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MOCK_LOSS_AND_ANOMALIES } from '../../../mock/adminFinancialData';
import { useMockStore } from '../../../store/mockStore';

export const LossAnomalyDetectionView = () => {
  const { showToast } = useMockStore();
  const [anomalies, setAnomalies] = useState(MOCK_LOSS_AND_ANOMALIES);
  const [severityFilter, setSeverityFilter] = useState('All'); // 'All' | 'Critical' | 'Warning' | 'Info'
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedAnomaly) {
        setSelectedAnomaly(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAnomaly]);

  // Lock background body scroll while modal is open
  useEffect(() => {
    if (selectedAnomaly) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [selectedAnomaly]);

  const types = ['All', 'Revenue Anomaly', 'Unusual Ingredient Consumption', 'Inventory Discrepancy', 'Cashier Discount Anomaly', 'Price vs Cost Anomaly'];

  const filteredAnomalies = useMemo(() => {
    return anomalies.filter((item) => {
      const matchSeverity = severityFilter === 'All' || item.severity === severityFilter;
      const matchType = typeFilter === 'All' || item.type === typeFilter;
      return matchSeverity && matchType;
    });
  }, [anomalies, severityFilter, typeFilter]);

  const criticalCount = anomalies.filter((a) => a.severity === 'Critical').length;
  const warningCount = anomalies.filter((a) => a.severity === 'Warning').length;
  const infoCount = anomalies.filter((a) => a.severity === 'Info').length;

  const handleAcknowledge = (id, e) => {
    e.stopPropagation();
    setAnomalies((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Resolved' } : a))
    );
    if (selectedAnomaly?.id === id) {
      setSelectedAnomaly((prev) => (prev ? { ...prev, status: 'Resolved' } : null));
    }
    showToast(`Anomaly [${id}] acknowledged and marked as Resolved.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              LOSS & ANOMALY DETECTION ENGINE
            </h2>
            <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
              Fraud & Waste Prevention
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            Automated heuristic and statistical anomaly detection across revenue velocity, recipe shrinkage, and stock audit variance.
          </p>
        </div>

        {/* Quick Actions */}
        <button
          onClick={() => showToast('Full automated anomaly diagnostics sweep completed. 5 anomalies tracked.')}
          style={{
            backgroundColor: '#1e293b',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>🔍</span>
          <span>Run System Heuristics Scan</span>
        </button>
      </div>

      {/* Severity Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #fecaca', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase' }}>
              Critical Alerts
            </span>
            <span style={{ fontSize: '14px' }}>🚨</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#dc2626', marginTop: '6px' }}>
            {criticalCount} Incidents
          </div>
          <div style={{ fontSize: '11px', color: '#991b1b', marginTop: '6px', fontWeight: 600 }}>
            Ingredient shrinkage & physical audit mismatch
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #fed7aa', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#9a3412', textTransform: 'uppercase' }}>
              Warning Alerts
            </span>
            <span style={{ fontSize: '14px' }}>⚠️</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#ea580c', marginTop: '6px' }}>
            {warningCount} Alerts
          </div>
          <div style={{ fontSize: '11px', color: '#9a3412', marginTop: '6px', fontWeight: 600 }}>
            Revenue deceleration & discount overrides
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #bfdbfe', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>
              Informational Alerts
            </span>
            <span style={{ fontSize: '14px' }}>ℹ️</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#2563eb', marginTop: '6px' }}>
            {infoCount} Insights
          </div>
          <div style={{ fontSize: '11px', color: '#1e40af', marginTop: '6px', fontWeight: 600 }}>
            Supplier price adjustment notices
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Financial Loss Exposure
            </span>
            <span style={{ fontSize: '14px' }}>💸</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
            ~12,450,000 VND
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
            Potential unrecovered shrinkage value
          </div>
        </div>
      </div>

      {/* Main Anomaly Log Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
              ANOMALY INCIDENTS & DISCREPANCY AUDIT LOG
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Click any incident row to inspect forensic details, root causes, and mitigation steps
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Severity:</span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              >
                <option value="All">All Severities</option>
                <option value="Critical">Critical Only</option>
                <option value="Warning">Warning Only</option>
                <option value="Info">Info Only</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Anomaly Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              >
                {types.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
              <tr>
                <th style={{ padding: '12px 16px' }}>Timestamp</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Severity</th>
                <th style={{ padding: '12px 16px' }}>Anomaly Category</th>
                <th style={{ padding: '12px 16px' }}>Incident Description</th>
                <th style={{ padding: '12px 16px' }}>Affected Entity</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Variance</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAnomalies.map((item) => {
                const isCrit = item.severity === 'Critical';
                const isWarn = item.severity === 'Warning';
                const isResolved = item.status === 'Resolved';

                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedAnomaly(item)}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      backgroundColor: selectedAnomaly?.id === item.id ? '#f0fdfa' : 'transparent',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: '#64748b' }}>
                      {item.timestamp}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span
                        style={{
                          backgroundColor: isCrit ? '#fee2e2' : isWarn ? '#ffedd5' : '#e0f2fe',
                          color: isCrit ? '#991b1b' : isWarn ? '#9a3412' : '#0369a1',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 800,
                          textTransform: 'uppercase'
                        }}
                      >
                        {item.severity}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                      {item.type}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#0f172a' }}>
                      <div style={{ fontWeight: 600 }}>{item.title}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        Expected: {item.expectedValue} • Actual: {item.actualValue}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569', fontSize: '11px' }}>
                      {item.affectedPeriodOrItem}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: item.variancePct < 0 ? '#dc2626' : '#ea580c', fontFamily: 'var(--font-mono)' }}>
                      {item.variancePct > 0 ? `+${item.variancePct}%` : `${item.variancePct}%`}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span
                        style={{
                          backgroundColor: isResolved ? '#dcfce7' : '#f1f5f9',
                          color: isResolved ? '#166534' : '#475569',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600
                        }}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => setSelectedAnomaly(item)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '4px',
                            backgroundColor: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#334155'
                          }}
                        >
                          Details
                        </button>
                        {!isResolved && (
                          <button
                            onClick={(e) => handleAcknowledge(item.id, e)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '4px',
                              backgroundColor: '#0f766e',
                              color: '#ffffff',
                              fontSize: '11px',
                              fontWeight: 700
                            }}
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forensic Detail Modal / Drawer View (Centered Portal with Viewport Protection) */}
      {selectedAnomaly &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: '16px',
              boxSizing: 'border-box'
            }}
            onClick={() => setSelectedAnomaly(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '680px',
                maxHeight: 'min(90vh, calc(100dvh - 32px))',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #cbd5e1',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
                overflow: 'hidden',
                animation: 'modalPop 0.15s ease-out'
              }}
            >
              {/* Pinned Modal Header */}
              <div
                style={{
                  padding: '18px 24px',
                  borderBottom: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexShrink: 0
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        backgroundColor:
                          selectedAnomaly.severity === 'Critical'
                            ? '#fee2e2'
                            : selectedAnomaly.severity === 'Warning'
                            ? '#ffedd5'
                            : '#e0f2fe',
                        color:
                          selectedAnomaly.severity === 'Critical'
                            ? '#991b1b'
                            : selectedAnomaly.severity === 'Warning'
                            ? '#9a3412'
                            : '#0369a1',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 800
                      }}
                    >
                      {selectedAnomaly.severity} ANOMALY
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                      ID: {selectedAnomaly.id}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
                    {selectedAnomaly.title}
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedAnomaly(null)}
                  style={{
                    fontSize: '18px',
                    color: '#64748b',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    lineHeight: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Close (Esc)"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Modal Content Area */}
              <div
                style={{
                  padding: '20px 24px',
                  overflowY: 'auto',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  fontSize: '13px',
                  lineHeight: 1.6
                }}
              >
                {/* Forensic Metadata Grid */}
                <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 600 }}>DETECTION TIMESTAMP:</span>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                        {selectedAnomaly.timestamp}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 600 }}>AFFECTED ENTITY / TARGET:</span>
                      <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                        {selectedAnomaly.affectedPeriodOrItem}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 600 }}>EXPECTED BASELINE:</span>
                      <div style={{ fontWeight: 700, color: '#0f766e', marginTop: '2px' }}>
                        {selectedAnomaly.expectedValue}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 600 }}>ACTUAL DETECTED:</span>
                      <div style={{ fontWeight: 700, color: '#dc2626', marginTop: '2px' }}>
                        {selectedAnomaly.actualValue} ({selectedAnomaly.variancePct > 0 ? `+${selectedAnomaly.variancePct}%` : `${selectedAnomaly.variancePct}%`})
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <strong style={{ color: '#0f172a' }}>Forensic Case Details:</strong>
                  <p style={{ color: '#334155', marginTop: '4px' }}>{selectedAnomaly.details}</p>
                </div>

                <div style={{ backgroundColor: '#fef2f2', padding: '12px 14px', borderRadius: '8px', border: '1px solid #fecaca' }}>
                  <strong style={{ color: '#991b1b' }}>Identified Root Cause:</strong>
                  <p style={{ color: '#7f1d1d', marginTop: '4px' }}>{selectedAnomaly.rootCause}</p>
                </div>

                <div style={{ backgroundColor: '#f0fdf4', padding: '12px 14px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <strong style={{ color: '#166534' }}>Suggested Mitigation Action:</strong>
                  <p style={{ color: '#14532d', marginTop: '4px' }}>{selectedAnomaly.suggestedMitigation}</p>
                </div>
              </div>

              {/* Pinned Modal Footer */}
              <div
                style={{
                  padding: '16px 24px',
                  borderTop: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '8px',
                  flexShrink: 0
                }}
              >
                <button
                  onClick={() => setSelectedAnomaly(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#475569'
                  }}
                >
                  Close Inspector
                </button>
                {selectedAnomaly.status !== 'Resolved' && (
                  <button
                    onClick={(e) => handleAcknowledge(selectedAnomaly.id, e)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      backgroundColor: '#0f766e',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: 700
                    }}
                  >
                    Mark Case as Resolved
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
