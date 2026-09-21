import React from 'react';
import { useMockStore } from './store/mockStore';
import { RoleSwitcherBar } from './components/RoleSwitcherBar';
import { CustomerQRMenuScreen } from './screens/CustomerQRMenuScreen';
import { CustomerProgressScreen } from './screens/CustomerProgressScreen';
import { KitchenKDSScreen } from './screens/KitchenKDSScreen';
import { WaiterFloorScreen } from './screens/WaiterFloorScreen';
import { CashierPOSScreen } from './screens/CashierPOSScreen';
import { ManagerPortalScreen } from './screens/ManagerPortalScreen';
import { AdminConsoleScreen } from './screens/AdminConsoleScreen';

export const MainApp = () => {
  const { activeRole, customerScreen, toastMessage } = useMockStore();

  return (
    <div className="proto-app-container">
      {/* Top Prototype Evaluation Switcher across all 6 roles */}
      <RoleSwitcherBar />

      {/* Main Viewport Container */}
      <main className="proto-viewport-wrapper">
        {activeRole === 'customer' && (
          customerScreen === 'menu' ? <CustomerQRMenuScreen /> : <CustomerProgressScreen />
        )}

        {activeRole === 'kitchen' && <KitchenKDSScreen />}

        {activeRole === 'waiter' && <WaiterFloorScreen />}

        {activeRole === 'cashier' && <CashierPOSScreen />}

        {activeRole === 'manager' && <ManagerPortalScreen />}

        {activeRole === 'admin' && <AdminConsoleScreen />}
      </main>

      {/* Floating System Event / Toast Banner */}
      {toastMessage && (
        <aside
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #38bdf8',
            padding: '12px 18px',
            borderRadius: '10px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 9999,
            animation: 'modalPop 0.2s ease-out'
          }}
        >
          <span style={{ fontSize: '16px' }}>⚡</span>
          <span>{toastMessage}</span>
        </aside>
      )}
    </div>
  );
};
