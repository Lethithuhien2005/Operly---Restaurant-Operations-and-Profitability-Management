import React from 'react';
import { useMockStore } from '../store/mockStore';
import {
  ManagerDashboardView,
  ManagerMenuPricingView,
  ManagerInventoryView,
  ManagerStaffShiftsView,
  ManagerPromotionsView,
  ManagerReservationsView,
  ManagerOrdersView,
} from '../components/manager/ManagerOperationsViews';
import { ManagerAIIntelligenceViews } from '../components/manager/ManagerAIIntelligenceViews';

const OPS_TABS = [
  { id: 'dashboard', label: 'Dashboard & Reports', icon: '📊' },
  { id: 'menu', label: 'Menu & Pricing', icon: '🍽️' },
  { id: 'inventory', label: 'Inventory & BOM', icon: '📦' },
  { id: 'staff', label: 'Staff & Shifts', icon: '👥' },
  { id: 'promotions', label: 'Promotions', icon: '🏷️' },
  { id: 'reservations', label: 'Reservations', icon: '📅' },
  { id: 'orders', label: 'Orders', icon: '🧾' },
];

const AI_TABS = [
  { id: 'fi-dashboard', label: 'Financial Intelligence Hub', icon: '🧠' },
  { id: 'fi-revenue-analytics', label: '01. Revenue Analytics', icon: '📈' },
  { id: 'fi-revenue-forecasting', label: '02. Revenue Forecasting', icon: '🔮' },
  { id: 'fi-menu-demand', label: '03. Demand Forecasting', icon: '🍲' },
  { id: 'fi-menu-profitability', label: '04. Profitability Analysis', icon: '💰' },
  { id: 'fi-inventory-opt', label: '05. Inventory Intelligence', icon: '🥕' },
  { id: 'fi-anomalies', label: '06. Anomaly Detection', icon: '⚠️' },
  { id: 'fi-recommendations', label: 'Recommendation Engine', icon: '💡' },
];

export const ManagerPortalScreen = () => {
  const { currentUser, managerTab = 'dashboard', setManagerTab } = useMockStore();

  const isAITab = managerTab.startsWith('fi-');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 54px)', backgroundColor: '#f8f4e8' }}>
      {/* Manager Header */}
      <header
        style={{
          backgroundColor: '#263d1c',
          color: '#f8f4e8',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #ead196',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#ead196' }}>
            OPERLY MANAGER PORTAL
          </span>
          <span style={{ fontSize: 12, opacity: 0.9 }}>
            Operations & AI Financial Intelligence
          </span>
        </div>
        <div style={{ fontSize: 12, color: '#ead196', fontWeight: 700 }}>
          Manager: {currentUser?.fullName || 'Restaurant Manager'}
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Sidebar */}
        <aside
          style={{
            width: 250,
            backgroundColor: '#263d1c',
            color: '#f8f4e8',
            padding: '16px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            flexShrink: 0,
            borderRight: '1px solid rgba(234,209,150,0.25)',
          }}
        >
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#ead196', padding: '0 8px 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Restaurant Operations
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {OPS_TABS.map((t) => {
                const active = managerTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setManagerTab(t.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 10px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: active ? 800 : 600,
                      backgroundColor: active ? '#ead196' : 'transparent',
                      color: active ? '#263d1c' : '#f8f4e8',
                      textAlign: 'left',
                    }}
                  >
                    <span>{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#ead196', padding: '0 8px 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              AI & Financial Intelligence
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {AI_TABS.map((t) => {
                const active = managerTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setManagerTab(t.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 10px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: active ? 800 : 600,
                      backgroundColor: active ? '#ead196' : 'transparent',
                      color: active ? '#263d1c' : '#f8f4e8',
                      textAlign: 'left',
                    }}
                  >
                    <span>{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
          {managerTab === 'dashboard' && <ManagerDashboardView onNavigateTab={setManagerTab} />}
          {managerTab === 'menu' && <ManagerMenuPricingView />}
          {managerTab === 'inventory' && <ManagerInventoryView />}
          {managerTab === 'staff' && <ManagerStaffShiftsView />}
          {managerTab === 'promotions' && <ManagerPromotionsView />}
          {managerTab === 'reservations' && <ManagerReservationsView />}
          {managerTab === 'orders' && <ManagerOrdersView />}
          {isAITab && <ManagerAIIntelligenceViews activeTab={managerTab} onNavigateTab={setManagerTab} />}
        </main>
      </div>
    </div>
  );
};
