import React from 'react';
import { LogIn, LogOut, UserPlus, ShieldCheck, User } from 'lucide-react';
import { useMockStore } from '../store/mockStore';

const ROLE_LABELS = {
  customer: 'Customer Dining',
  kitchen: 'Kitchen KDS',
  waiter: 'Waiter Floor',
  cashier: 'Cashier POS',
  manager: 'Manager Portal',
  admin: 'System Admin',
};

export const RoleSwitcherBar = () => {
  const {
    activeRole,
    currentUser,
    logoutUser,
    currentRoute,
    navigate,
  } = useMockStore();

  return (
    <header className="proto-eval-harness">
      <div
        className="proto-brand-tag"
        onClick={() => navigate('prototype')}
        style={{ cursor: 'pointer' }}
        title="OPERLY Home"
      >
        <span style={{ fontSize: '20px' }}>🍽️</span>
        <span>OPERLY</span>
        <span className="proto-badge">
          {ROLE_LABELS[activeRole] || 'Customer Dining'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {currentUser ? (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(248, 244, 232, 0.12)',
                border: '1px solid rgba(234, 209, 150, 0.4)',
                padding: '5px 12px',
                borderRadius: '9999px',
                fontSize: '12px',
                color: '#f8f4e8',
              }}
            >
              {['manager', 'admin'].includes(activeRole) ? (
                <ShieldCheck size={14} color="#ead196" />
              ) : (
                <User size={14} color="#ead196" />
              )}
              <span style={{ fontWeight: 700 }}>{currentUser.fullName}</span>
              <span
                style={{
                  backgroundColor: '#ead196',
                  color: '#263d1c',
                  padding: '1px 7px',
                  borderRadius: '9999px',
                  fontSize: '10px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                }}
              >
                {currentUser.role}
              </span>
            </div>

            <button
              type="button"
              onClick={logoutUser}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#ead196',
                color: '#263d1c',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
              title="Log out and return to Customer view"
            >
              <LogOut size={14} />
              <span>Log out</span>
            </button>
          </>
        ) : (
          <>
            <span style={{ fontSize: '12px', color: '#ead196', fontWeight: 600 }}>
              Guest Mode (Customer View)
            </span>
            <button
              type="button"
              onClick={() => navigate('login')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: currentRoute === 'login' ? '#f8f4e8' : '#ead196',
                color: '#263d1c',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <LogIn size={14} />
              <span>Sign in</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('signup')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'transparent',
                color: '#f8f4e8',
                border: '1px solid rgba(234, 209, 150, 0.5)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <UserPlus size={14} />
              <span>Sign up</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};
