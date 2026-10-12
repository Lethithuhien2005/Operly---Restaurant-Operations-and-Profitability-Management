import React from 'react';

export const ManagerEmptyState = ({
  icon = '📋',
  title = 'No Data Available',
  description = 'There are no active items to display in this view.',
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
        padding: '40px 20px',
        textAlign: 'center',
        backgroundColor: '#f8fafc',
        border: '2px dashed #cbd5e1',
        borderRadius: '12px',
        margin: '12px 0'
      }}
    >
      <div style={{ fontSize: '36px', marginBottom: '10px' }}>{icon}</div>
      <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
        {title}
      </div>
      <div style={{ fontSize: '13px', color: '#64748b', maxWidth: '420px', lineHeight: 1.5 }}>
        {description}
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            marginTop: '16px',
            backgroundColor: '#0f766e',
            color: '#ffffff',
            padding: '8px 18px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            boxShadow: '0 2px 4px rgba(15, 118, 110, 0.2)'
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
