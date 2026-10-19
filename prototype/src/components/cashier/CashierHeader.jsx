import React from 'react';

/**
 * CashierHeader
 * Top bar for the POS terminal — brand identity, cashier name,
 * live clock, shift info, shift sales counter, and quick action shortcuts.
 */
export const CashierHeader = ({
  shiftTotal = 18450000,
  pendingCount = 0,
  onOpenHistory,
  onReset
}) => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <header
      style={{
        backgroundColor: '#0f766e',
        color: '#ffffff',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
        gap: '12px',
        flexWrap: 'wrap',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      {/* Left: Brand + Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>💳</span>
          <span style={{ fontSize: '17px', fontWeight: 900, letterSpacing: '-0.03em' }}>
            OPERLY POS
          </span>
          <span
            style={{
              backgroundColor: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.06em'
            }}
          >
            TERMINAL 01
          </span>
        </div>

        <div
          style={{
            width: '1px',
            height: '22px',
            backgroundColor: 'rgba(255,255,255,0.25)'
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
          <span style={{ opacity: 0.9 }}>
            👤 Cashier: <strong>Mai Le</strong>
          </span>
          <span
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600
            }}
          >
            Evening Shift
          </span>
          <span style={{ opacity: 0.8 }}>🕒 {timeStr}</span>
        </div>
      </div>

      {/* Right: Metrics & Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {pendingCount > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(245, 158, 11, 0.25)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '12px'
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#fbbf24',
                boxShadow: '0 0 0 3px rgba(251,191,36,0.35)'
              }}
            />
            <span style={{ fontWeight: 800, color: '#fef3c7' }}>
              {pendingCount} Table{pendingCount > 1 ? 's' : ''} Pending Settlement
            </span>
          </div>
        )}

        {/* Live Shift Sales */}
        <div
          style={{
            textAlign: 'right',
            backgroundColor: 'rgba(0,0,0,0.2)',
            padding: '4px 12px',
            borderRadius: '6px'
          }}
        >
          <div style={{ fontSize: '10px', opacity: 0.8, fontWeight: 700, letterSpacing: '0.04em' }}>
            SHIFT TOTAL SALES
          </div>
          <div style={{ fontSize: '16px', fontWeight: 900, color: '#a7f3d0' }}>
            {shiftTotal.toLocaleString()} VND
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="View settled bills audit history for this shift"
            >
              📜 Settled History
            </button>
          )}

          {onReset && (
            <button
              onClick={onReset}
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.25)',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="Reset state"
            >
              ↺ Reset
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
