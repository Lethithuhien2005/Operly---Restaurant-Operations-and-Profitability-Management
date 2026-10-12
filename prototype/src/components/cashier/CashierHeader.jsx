import React from 'react';

/**
 * CashierHeader
 * Top bar for the POS terminal — brand name, cashier identity,
 * shift badge, and live cumulative shift-sales counter.
 */
export const CashierHeader = ({ shiftTotal = 0, pendingCount = 0 }) => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      style={{
        backgroundColor: '#0f766e',
        color: '#fff',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
        gap: '12px',
        flexWrap: 'wrap'
      }}
    >
      {/* Left: Brand + Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '17px', fontWeight: 900, letterSpacing: '-0.03em' }}>
            OPERLY POS
          </span>
          <span
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.05em'
            }}
          >
            TERMINAL
          </span>
        </div>

        <div
          style={{
            width: '1px',
            height: '20px',
            backgroundColor: 'rgba(255,255,255,0.25)'
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
          <span style={{ opacity: 0.85 }}>
            👤 <strong>Mai Le</strong>
          </span>
          <span
            style={{
              backgroundColor: 'rgba(255,255,255,0.12)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600
            }}
          >
            Evening Shift
          </span>
          <span style={{ opacity: 0.7 }}>🕐 {timeStr}</span>
        </div>
      </div>

      {/* Right: Metrics */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {pendingCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#fbbf24',
                boxShadow: '0 0 0 3px rgba(251,191,36,0.3)'
              }}
            />
            <span style={{ fontWeight: 700 }}>
              {pendingCount} Table{pendingCount > 1 ? 's' : ''} Pending
            </span>
          </div>
        )}

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', opacity: 0.7, fontWeight: 600, letterSpacing: '0.04em' }}>
            SHIFT TOTAL SALES
          </div>
          <div style={{ fontSize: '15px', fontWeight: 900, color: '#a7f3d0' }}>
            {shiftTotal.toLocaleString()} VND
          </div>
        </div>
      </div>
    </div>
  );
};
