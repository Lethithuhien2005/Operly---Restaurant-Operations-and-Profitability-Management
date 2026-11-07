import React from 'react';
import { useMockStore } from '../store/mockStore';

export const RoleSwitcherBar = () => {
  const {
    activeRole,
    setActiveRole,
    customerScreen,
    readyDishesList,
    tables,
    serviceCalls,
    resetAllPrototypeData,
    currentRoute,
    navigate
  } = useMockStore();

  const waiterNotificationCount = readyDishesList.length + (serviceCalls ? serviceCalls.length : 0);
  const hasBillRequested = tables.some((t) => t.billRequested);

  return (
    <header className="proto-eval-harness">
      <div className="proto-brand-tag" onClick={() => navigate('prototype')} style={{ cursor: 'pointer' }} title="Operly Operations Dashboard">
        <span style={{ fontSize: '18px' }}>🍽️</span>
        <span>OPERLY</span>
        <span className="proto-badge">4.3 Interactive Prototype</span>
      </div>

      {/* Role Switcher Navigation Harness (Prototype evaluation mechanism across all 6 roles) */}
      <nav className="proto-role-tabs" aria-label="Prototype Role Switcher">
        <button
          className={`proto-role-btn ${currentRoute === 'prototype' && activeRole === 'customer' ? 'active' : ''}`}
          onClick={() => { setActiveRole('customer'); if (currentRoute !== 'prototype') navigate('prototype'); }}
        >
          <span>📱</span>
          <span>Customer QR</span>
          <span style={{ fontSize: '10px', opacity: 0.75 }}>
            ({customerScreen === 'menu' ? 'SCR-CUST-03' : customerScreen === 'progress' ? 'SCR-CUST-04' : customerScreen === 'reserve' ? 'SCR-CUST-01' : 'Loyalty'})
          </span>
        </button>

        <button
          className={`proto-role-btn ${currentRoute === 'prototype' && activeRole === 'kitchen' ? 'active' : ''}`}
          onClick={() => { setActiveRole('kitchen'); if (currentRoute !== 'prototype') navigate('prototype'); }}
        >
          <span>🍳</span>
          <span>Kitchen KDS</span>
          <span style={{ fontSize: '10px', opacity: 0.75 }}>(SCR-KDS-01)</span>
        </button>

        <button
          className={`proto-role-btn ${currentRoute === 'prototype' && activeRole === 'waiter' ? 'active' : ''}`}
          onClick={() => { setActiveRole('waiter'); if (currentRoute !== 'prototype') navigate('prototype'); }}
        >
          <span>🤵</span>
          <span>Waiter Floor</span>
          {waiterNotificationCount > 0 && (
            <span
              style={{
                backgroundColor: '#ef4444',
                color: '#fff',
                borderRadius: '9999px',
                padding: '1px 6px',
                fontSize: '10px',
                fontWeight: 700
              }}
              title={`${readyDishesList.length} ready dishes, ${serviceCalls?.length || 0} service calls`}
            >
              {waiterNotificationCount}
            </span>
          )}
          <span style={{ fontSize: '10px', opacity: 0.75 }}>(SCR-WAIT-01)</span>
        </button>

        <button
          className={`proto-role-btn ${currentRoute === 'prototype' && activeRole === 'cashier' ? 'active' : ''}`}
          onClick={() => { setActiveRole('cashier'); if (currentRoute !== 'prototype') navigate('prototype'); }}
        >
          <span>💳</span>
          <span>Cashier POS</span>
          {hasBillRequested && (
            <span
              style={{
                backgroundColor: '#f59e0b',
                color: '#fff',
                borderRadius: '9999px',
                padding: '1px 6px',
                fontSize: '10px',
                fontWeight: 700
              }}
              title="Customer bill requested"
            >
              REQ
            </span>
          )}
          <span style={{ fontSize: '10px', opacity: 0.75 }}>(SCR-POS-01)</span>
        </button>

        <button
          className={`proto-role-btn ${currentRoute === 'prototype' && activeRole === 'manager' ? 'active' : ''}`}
          onClick={() => { setActiveRole('manager'); if (currentRoute !== 'prototype') navigate('prototype'); }}
        >
          <span>👔</span>
          <span>Manager</span>
          <span style={{ fontSize: '10px', opacity: 0.75 }}>(SCR-MGR-01)</span>
        </button>

        <button
          className={`proto-role-btn ${currentRoute === 'prototype' && activeRole === 'admin' ? 'active' : ''}`}
          onClick={() => { setActiveRole('admin'); if (currentRoute !== 'prototype') navigate('prototype'); }}
        >
          <span>🛡️</span>
          <span>Admin</span>
          <span style={{ fontSize: '10px', opacity: 0.75 }}>(SCR-ADM-01)</span>
        </button>
        <div style={{ width: '1px', height: '20px', backgroundColor: '#334155', margin: '0 4px', alignSelf: 'center' }} />
        <button
          className={`proto-role-btn ${currentRoute === 'login' ? 'active' : ''}`}
          onClick={() => navigate('login')}
          title="Login Page (SCR-AUTH-01)"
        >
          <span>🔑</span>
          <span>Login</span>
          <span style={{ fontSize: '10px', opacity: 0.75 }}>(SCR-AUTH-01)</span>
        </button>

        <button
          className={`proto-role-btn ${currentRoute === 'signup' ? 'active' : ''}`}
          onClick={() => navigate('signup')}
          title="Sign Up Page (SCR-AUTH-02)"
        >
          <span>📝</span>
          <span>Sign Up</span>
          <span style={{ fontSize: '10px', opacity: 0.75 }}>(SCR-AUTH-02)</span>
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
