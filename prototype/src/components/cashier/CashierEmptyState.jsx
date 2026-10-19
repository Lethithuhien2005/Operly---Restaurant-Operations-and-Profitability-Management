import React from 'react';

/**
 * CashierEmptyState
 * Reusable visual empty state card for POS terminal (SCR-POS-01).
 * Rendered when no tables are in queue, no bill is selected, or search returns zero items.
 */
export const CashierEmptyState = ({
  icon = '🧾',
  title = 'No Bills in Queue',
  description = 'All active dining tables have settled their checks. New requests will appear automatically.',
  actionLabel,
  onAction
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        textAlign: 'center',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px dashed #cbd5e1',
        margin: '20px auto',
        maxWidth: '480px'
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#f0fdfa',
          color: '#0f766e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          marginBottom: '16px'
        }}
      >
        {icon}
      </div>

      <h3
        style={{
          fontSize: '16px',
          fontWeight: 800,
          color: '#0f172a',
          marginBottom: '6px'
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '13px',
          color: '#64748b',
          lineHeight: 1.5,
          maxWidth: '360px',
          marginBottom: actionLabel ? '16px' : '0'
        }}
      >
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            padding: '8px 16px',
            backgroundColor: '#0f766e',
            color: '#ffffff',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
