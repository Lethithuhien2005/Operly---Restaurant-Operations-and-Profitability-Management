import React from 'react';
import { useMockStore } from '../../store/mockStore';
import { MOCK_MANAGER_METRICS } from '../../mock/data';

export const ManagerKPICards = () => {
  const { dailyGrossSales, dailyTablesServed, managerApprovals, teamRoster } = useMockStore();
  const metrics = MOCK_MANAGER_METRICS;

  const targetSales = metrics.salesTarget || 28000000;
  const salesProgressPct = Math.min(100, Math.round((dailyGrossSales / targetSales) * 100));
  const liveAvgTicket = dailyTablesServed > 0 ? Math.round(dailyGrossSales / dailyTablesServed) : metrics.avgTicket;

  const pendingApprovalsCount = managerApprovals.filter((a) => a.status === 'Pending').length;
  const onDutyStaffCount = teamRoster.filter((s) => s.status === 'On Duty').length;
  const totalStaffCount = teamRoster.length;

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>REAL-TIME OPERATIONAL KPI METRICS</span>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#0f766e', backgroundColor: '#ccfbf1', padding: '2px 8px', borderRadius: '4px' }}>
            Live Sync
          </span>
        </div>
        <div style={{ fontSize: '11px', color: '#64748b' }}>
          Synchronized instantly across POS, KDS & Duty Roster
        </div>
      </div>

      <div
        className="manager-metric-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '14px'
        }}
      >
        {/* Card 1: Gross Sales */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              GROSS SALES (TODAY)
            </span>
            <span style={{ fontSize: '18px' }}>💰</span>
          </div>

          <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f766e', marginTop: '6px' }}>
            {dailyGrossSales.toLocaleString()} <span style={{ fontSize: '13px', fontWeight: 700 }}>VND</span>
          </div>

          {/* Progress to target */}
          <div style={{ marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginBottom: '3px' }}>
              <span>Target: {targetSales.toLocaleString()} VND</span>
              <span style={{ fontWeight: 700, color: salesProgressPct >= 80 ? '#16a34a' : '#0284c7' }}>{salesProgressPct}%</span>
            </div>
            <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${salesProgressPct}%`,
                  backgroundColor: salesProgressPct >= 80 ? '#16a34a' : '#0f766e',
                  borderRadius: '3px',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
          </div>

          <div style={{ fontSize: '10px', color: '#16a34a', marginTop: '8px', fontWeight: 600 }}>
            ▲ +12.4% vs last Saturday
          </div>
        </div>

        {/* Card 2: Tables Served & Turnover */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              TABLES SERVED & TURNOVER
            </span>
            <span style={{ fontSize: '18px' }}>🍽️</span>
          </div>

          <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', marginTop: '6px' }}>
            {dailyTablesServed} <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>Tables</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <span style={{ backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, color: '#334155' }}>
              {metrics.tableTurnoverRate}
            </span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Covers: {metrics.totalCovers} diners
            </span>
          </div>

          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '8px' }}>
            Avg Dining Duration: <strong>52 mins</strong> (F&B Standard)
          </div>
        </div>

        {/* Card 3: Avg Ticket & Margins */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              AVG SPEND & COST RATIOS
            </span>
            <span style={{ fontSize: '18px' }}>📊</span>
          </div>

          <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', marginTop: '6px' }}>
            {liveAvgTicket.toLocaleString()} <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>VND</span>
          </div>

          <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
            <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#ecfdf5', color: '#065f46', fontWeight: 700 }}>
              Food Cost: {metrics.foodCostPct}%
            </span>
            <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#eff6ff', color: '#1e40af', fontWeight: 700 }}>
              Labor: {metrics.laborCostPct}%
            </span>
          </div>

          <div style={{ fontSize: '10px', color: '#16a34a', marginTop: '8px', fontWeight: 600 }}>
            ✓ Within PRD cost benchmark limits
          </div>
        </div>

        {/* Card 4: Kitchen Spoilage & Pending Actions */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              SPOILAGE LOSS & STAFFING
            </span>
            <span style={{ fontSize: '18px' }}>⚠️</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#dc2626' }}>
              {metrics.wasteLoss.toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 700 }}>VND</span>
            </div>
            {pendingApprovalsCount > 0 && (
              <span
                style={{
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  border: '1px solid #fca5a5'
                }}
              >
                {pendingApprovalsCount} Pending
              </span>
            )}
          </div>

          <div style={{ fontSize: '11px', color: '#475569', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Active Coverage:</span>
            <strong style={{ color: '#0f766e' }}>{onDutyStaffCount} / {totalStaffCount}</strong> On Duty
          </div>

          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '8px' }}>
            FR-013 Spoilage Ledger • Immutable Audit Trail
          </div>
        </div>
      </div>
    </div>
  );
};
