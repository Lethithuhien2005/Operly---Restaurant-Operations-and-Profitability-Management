import React, { useState, useMemo } from 'react';
import { MOCK_RECOMMENDATION_ENGINE_DATA } from '../../../mock/adminFinancialData';
import { useMockStore } from '../../../store/mockStore';

export const RecommendationEngineView = () => {
  const { showToast } = useMockStore();
  const [recommendations, setRecommendations] = useState(MOCK_RECOMMENDATION_ENGINE_DATA);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Pending' | 'Reviewed' | 'Completed'
  const [priorityFilter, setPriorityFilter] = useState('All');

  const categories = [
    'All',
    'Inventory Replenishment',
    'Overstock Reduction',
    'Ingredient Purchasing',
    'Menu Profitability Improvement',
    'Demand-based Inventory Planning',
    'Business Performance Improvement'
  ];

  const filteredRecs = useMemo(() => {
    return recommendations.filter((r) => {
      const matchCat = categoryFilter === 'All' || r.category === categoryFilter;
      const matchStatus = statusFilter === 'All' || r.status === statusFilter;
      const matchPriority = priorityFilter === 'All' || r.priority === priorityFilter;
      return matchCat && matchStatus && matchPriority;
    });
  }, [recommendations, categoryFilter, statusFilter, priorityFilter]);

  const handleUpdateStatus = (id, newStatus) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    showToast(`Recommendation [${id}] updated to status: "${newStatus}"`);
  };

  const pendingCount = recommendations.filter((r) => r.status === 'Pending').length;
  const reviewedCount = recommendations.filter((r) => r.status === 'Reviewed').length;
  const completedCount = recommendations.filter((r) => r.status === 'Completed').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              INTELLIGENT BUSINESS RECOMMENDATION ENGINE
            </h2>
            <span style={{ backgroundColor: '#ccfbf1', color: '#0f766e', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
              Actionable AI Strategy
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            Prescriptive intelligence synthesizing demand forecasts, inventory buffer health, supplier agreements, and margin drivers.
          </p>
        </div>

        {/* Global Action */}
        <button
          onClick={() => showToast('All pending recommendations accepted for execution planning.')}
          style={{
            backgroundColor: '#0f766e',
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
          <span>✨</span>
          <span>Apply High-Priority Recommendations</span>
        </button>
      </div>

      {/* KPI Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Pending Action Insights
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#dc2626', marginTop: '6px' }}>
            {pendingCount} Prescriptions
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
            Awaiting Admin review & execution
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Under Review
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0284c7', marginTop: '6px' }}>
            {reviewedCount} Insights
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
            Verified with Head Chef & FOH
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Completed / Executed
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f766e', marginTop: '6px' }}>
            {completedCount} Applied
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
            Implemented in operations
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Total Quantified Impact
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f766e', marginTop: '6px' }}>
            +79,350,000 VND
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
            Annualized gross profit & savings potential
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '12px 16px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Only</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredRecs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
            No recommendations match your selected filters.
          </div>
        ) : (
          filteredRecs.map((rec) => {
            const isCrit = rec.priority === 'Critical';
            const isHigh = rec.priority === 'High';
            const isCompleted = rec.status === 'Completed';
            const isReviewed = rec.status === 'Reviewed';

            return (
              <div
                key={rec.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: isCrit ? '#fecaca' : isHigh ? '#fed7aa' : '#e2e8f0',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  opacity: isCompleted ? 0.75 : 1
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          backgroundColor: isCrit ? '#fee2e2' : isHigh ? '#ffedd5' : '#f1f5f9',
                          color: isCrit ? '#991b1b' : isHigh ? '#9a3412' : '#475569',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 800,
                          textTransform: 'uppercase'
                        }}
                      >
                        {rec.priority} PRIORITY
                      </span>
                      <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                        {rec.category}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                        {rec.id} • {rec.createdAt}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
                      {rec.title}
                    </h3>
                    <div style={{ fontSize: '12px', color: '#0f766e', fontWeight: 700, marginTop: '2px' }}>
                      Target: {rec.targetMetric}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        backgroundColor: isCompleted ? '#dcfce7' : isReviewed ? '#e0f2fe' : '#fef3c7',
                        color: isCompleted ? '#166534' : isReviewed ? '#0369a1' : '#92400e',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}
                    >
                      ● {rec.status}
                    </span>
                  </div>
                </div>

                {/* Reason & Supporting Data */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', fontSize: '12px' }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <strong style={{ color: '#0f172a' }}>Reason & Diagnostic Finding:</strong>
                    <div style={{ color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>
                      {rec.reason}
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <strong style={{ color: '#0f172a' }}>Supporting Metrics & Baseline:</strong>
                    <div style={{ color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>
                      {rec.supportingData}
                    </div>
                  </div>
                </div>

                {/* Action & Impact */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', fontSize: '12px' }}>
                  <div style={{ backgroundColor: '#f0fdf4', padding: '12px 14px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <strong style={{ color: '#166534' }}>Suggested Operational Action:</strong>
                    <div style={{ color: '#14532d', marginTop: '4px', lineHeight: 1.5 }}>
                      {rec.suggestedAction}
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#eff6ff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    <strong style={{ color: '#1e40af' }}>Expected Business Impact:</strong>
                    <div style={{ color: '#1e3a8a', marginTop: '4px', lineHeight: 1.5, fontWeight: 600 }}>
                      {rec.expectedImpact}
                    </div>
                  </div>
                </div>

                {/* Action Buttons for Admin Workflow */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                  {rec.status === 'Pending' && (
                    <button
                      onClick={() => handleUpdateStatus(rec.id, 'Reviewed')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        backgroundColor: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#334155'
                      }}
                    >
                      Mark as Reviewed
                    </button>
                  )}

                  {rec.status !== 'Completed' && (
                    <button
                      onClick={() => handleUpdateStatus(rec.id, 'Completed')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        backgroundColor: '#0f766e',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 700
                      }}
                    >
                      ✓ Mark as Completed / Executed
                    </button>
                  )}

                  {rec.status === 'Completed' && (
                    <button
                      onClick={() => handleUpdateStatus(rec.id, 'Pending')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        backgroundColor: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        fontSize: '11px',
                        color: '#64748b'
                      }}
                    >
                      Reopen Recommendation
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
