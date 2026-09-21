import React from 'react';
import { useMockStore } from '../store/mockStore';

export const RoleSwitcherBar = () => {
  const {
    activeRole,
    setActiveRole,
    customerScreen,
    readyDishesList,
    tables,
    resetAllPrototypeData
  } = useMockStore();

  return (
    <header className="proto-eval-harness">
      <div className="proto-brand-tag">
        <span style={{ fontSize: '18px' }}>🍽️</span>
        <span>OPERLY</span>
        <span className="proto-badge">4.3 Interactive Prototype</span>
      </div>

      {/* Role Switcher Navigation Harness (Prototype evaluation mechanism across all 6 roles) */}
      <nav className="proto-role-tabs" aria-label="Prototype Role Switcher">
        <button
          className={`proto-role-btn ${activeRole === 'customer' ? 'active' : ''}`}
          onClick={() => setActiveRole('customer')}
        >
          <span>📱</span>
          <span>Customer QR</span>
          <span style={{ fontSize: '10px', opacity: 0.75 }}>
            ({customerScreen === 'menu' ? 'SCR-CUST-03' : 'SCR-CUST-04'})
          </span>
        </button>

        <button
          className={`proto-role-btn ${activeRole === 'kitchen' ? 'active' : ''}`}
          onClick={() => setActiveRole('kitchen')}
        >
          <span>🍳</span>
          <span>Kitchen KDS</span>
          <span style={{ fontSize: '10px', opacity: 0.75 }}>(SCR-KDS-01)</span>
        </button>

        <button
          className={`proto-role-btn ${activeRole === 'waiter' ? 'active' : ''}`}
          onClick={() => setActiveRole('waiter')}
        >
          <span>🤵</span>
          <span>Waiter Floor</span>
          {readyDishesList.length > 0 && (
            <span
              style={{
                backgroundColor: '#ef4444',
                color: '#fff',
                borderRadius: '9999px',
                padding: '1px 6px',
                fontSize: '10px',
                fontWeight: 700
              }}
            >
              {readyDishesList.length}
            </span>
          )}
          <span style={{ fontSize: '10px', opacity: 0.75 }}>(SCR-WAIT-01)</span>
        </button>

        <button
          className={`proto-role-btn ${activeRole === 'cashier' ? 'active' : ''}`}
          onClick={() => setActiveRole('cashier')}
        >
          <span>💳</span>
          <span>Cashier POS</span>
          <span style={{ fontSize: '10px', opacity: 0.75 }}>(SCR-POS-01)</span>
        </button>

        <button
          className={`proto-role-btn ${activeRole === 'manager' ? 'active' : ''}`}
          onClick={() => setActiveRole('manager')}
        >
          <span>👔</span>
          <span>Manager</span>
          <span style={{ fontSize: '10px', opacity: 0.75 }}>(SCR-MGR-01)</span>
        </button>

        <button
          className={`proto-role-btn ${activeRole === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveRole('admin')}
        >
          <span>🛡️</span>
          <span>Admin</span>
          <span style={{ fontSize: '10px', opacity: 0.75 }}>(SCR-ADM-01)</span>
        </button>
      </nav>

      <div className="proto-state-badges">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ height: '8px', width: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }}></span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>Socket: table:TBL-05</span>
        </div>

        <button
          className="proto-reset-btn"
          onClick={resetAllPrototypeData}
          title="Reset prototype state back to initial mock baseline"
        >
          ↺ Reset Data
        </button>
      </div>
    </header>
  );
};
