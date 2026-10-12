import React, { useState, useEffect } from 'react';
import { useMockStore } from '../store/mockStore';
import { MOCK_MANAGER_METRICS } from '../mock/data';
import { ManagerKPICards } from '../components/manager/ManagerKPICards';
import { ManagerApprovalsQueue } from '../components/manager/ManagerApprovalsQueue';
import { ManagerDetailDrawer } from '../components/manager/ManagerDetailDrawer';
import { ManagerTeamTable } from '../components/manager/ManagerTeamTable';
import { ManagerForecastChart } from '../components/manager/ManagerForecastChart';
import { ManagerBOMEditor } from '../components/manager/ManagerBOMEditor';

export const ManagerPortalScreen = () => {
  const {
    managerTab,
    setManagerTab,
    managerApprovals,
    resetAllPrototypeData
  } = useMockStore();

  const metrics = MOCK_MANAGER_METRICS;
  const pendingCount = managerApprovals.filter((a) => a.status === 'Pending').length;

  // Sub-tab switcher for BI & Reports (Forecast vs BOM)
  const [reportsSubTab, setReportsSubTab] = useState(
    managerTab === 'bom' ? 'bom' : 'forecast'
  );

  // Sync sub-tab if external managerTab changes to 'bom' or 'forecast'
  useEffect(() => {
    if (managerTab === 'bom') {
      setReportsSubTab('bom');
    } else if (managerTab === 'forecast') {
      setReportsSubTab('forecast');
    }
  }, [managerTab]);

  // Normalize active tab: 'overview' | 'team' | 'reports'
  const activeMainTab =
    managerTab === 'team'
      ? 'team'
      : managerTab === 'reports' || managerTab === 'forecast' || managerTab === 'bom'
      ? 'reports'
      : 'overview';

  const handleTabChange = (tabKey) => {
    setManagerTab(tabKey);
  };

  return (
    <div
      className="device-desktop"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#f8fafc',
        position: 'relative'
      }}
    >
      {/* Top Manager Header matching Brand Identity & SCR-MGR-01 */}
      <header
        style={{
          backgroundColor: '#0f766e',
          color: '#ffffff',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>📊</span>
            <span style={{ fontSize: '17px', fontWeight: 900, letterSpacing: '-0.02em' }}>
              OPERLY MANAGER PORTAL
            </span>
          </div>
          <span
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 700
            }}
          >
            Branch: {metrics.branch}
          </span>
          <span style={{ fontSize: '12px', opacity: 0.9 }}>
            Duty Manager: <strong>{metrics.managerName}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px' }}>
          <span style={{ opacity: 0.9 }}>
            Today: <strong>{metrics.date}</strong> • Evening Shift (17:00 - 23:00)
          </span>

          <button
            onClick={resetAllPrototypeData}
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            title="Reset prototype state back to mock baseline"
          >
            ↺ Reset State
          </button>
        </div>
      </header>

      {/* Main Navigation Sub-Bar with 3 Primary Pillars */}
      <nav
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '8px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Tab 1: Overview & Approvals */}
          <button
            onClick={() => handleTabChange('overview')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: activeMainTab === 'overview' ? '#0f766e' : '#f8fafc',
              color: activeMainTab === 'overview' ? '#ffffff' : '#475569',
              border: '1px solid',
              borderColor: activeMainTab === 'overview' ? '#0f766e' : '#cbd5e1',
              boxShadow: activeMainTab === 'overview' ? '0 1px 3px rgba(15,118,110,0.3)' : 'none'
            }}
          >
            <span>📊 Overview & Approvals</span>
            {pendingCount > 0 && (
              <span
                style={{
                  backgroundColor: activeMainTab === 'overview' ? '#ef4444' : '#fee2e2',
                  color: activeMainTab === 'overview' ? '#ffffff' : '#991b1b',
                  fontSize: '10px',
                  fontWeight: 900,
                  padding: '1px 6px',
                  borderRadius: '10px'
                }}
              >
                {pendingCount} PENDING
              </span>
            )}
          </button>

          {/* Tab 2: Operations & Team Management */}
          <button
            onClick={() => handleTabChange('team')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: activeMainTab === 'team' ? '#0f766e' : '#f8fafc',
              color: activeMainTab === 'team' ? '#ffffff' : '#475569',
              border: '1px solid',
              borderColor: activeMainTab === 'team' ? '#0f766e' : '#cbd5e1',
              boxShadow: activeMainTab === 'team' ? '0 1px 3px rgba(15,118,110,0.3)' : 'none'
            }}
          >
            <span>👥 Operations & Team Management</span>
          </button>

          {/* Tab 3: BI & Performance Reports */}
          <button
            onClick={() => handleTabChange('reports')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: activeMainTab === 'reports' ? '#0f766e' : '#f8fafc',
              color: activeMainTab === 'reports' ? '#ffffff' : '#475569',
              border: '1px solid',
              borderColor: activeMainTab === 'reports' ? '#0f766e' : '#cbd5e1',
              boxShadow: activeMainTab === 'reports' ? '0 1px 3px rgba(15,118,110,0.3)' : 'none'
            }}
          >
            <span>📈 BI & Performance Reports</span>
          </button>
        </div>

        {/* Quick Health Indicator */}
        <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          <span>System Healthy • 10s Sync Interval</span>
        </div>
      </nav>

      {/* Main Viewport Container */}
      <main style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW & APPROVALS (KPI Ribbon + Urgent Queue)  */}
        {/* ========================================================= */}
        {activeMainTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Real-time KPI Ribbon */}
            <ManagerKPICards />

            {/* Urgent Pending Approvals & Processed History */}
            <ManagerApprovalsQueue />
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: TEAM OPERATIONS & LIVE ROSTER                     */}
        {/* ========================================================= */}
        {activeMainTab === 'team' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <ManagerTeamTable />
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: BI ANALYTICS & RECIPE BOM (SCR-MGR-01 & 02)        */}
        {/* ========================================================= */}
        {activeMainTab === 'reports' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Sub-tab Switcher for Reports */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                backgroundColor: '#f1f5f9',
                padding: '4px',
                borderRadius: '8px',
                width: 'fit-content'
              }}
            >
              <button
                onClick={() => setReportsSubTab('forecast')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: reportsSubTab === 'forecast' ? '#ffffff' : 'transparent',
                  color: reportsSubTab === 'forecast' ? '#0f766e' : '#64748b',
                  boxShadow: reportsSubTab === 'forecast' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                📊 7-Day AI Revenue Forecast (SCR-MGR-01)
              </button>

              <button
                onClick={() => setReportsSubTab('bom')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: reportsSubTab === 'bom' ? '#ffffff' : 'transparent',
                  color: reportsSubTab === 'bom' ? '#0f766e' : '#64748b',
                  boxShadow: reportsSubTab === 'bom' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                🥩 Recipe BOM Configurator (SCR-MGR-02)
              </button>
            </div>

            {/* Sub-tab view */}
            {reportsSubTab === 'forecast' ? (
              <ManagerForecastChart />
            ) : (
              <ManagerBOMEditor />
            )}
          </div>
        )}
      </main>

      {/* Slide-over Inspection Drawer for Deep Request Details */}
      <ManagerDetailDrawer />
    </div>
  );
};
