import React from 'react';

export const ManagerLoadingSkeleton = ({ type = 'cards', rows = 3 }) => {
  if (type === 'cards') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }} className="manager-metric-grid">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div className="skeleton-box" style={{ width: '40%', height: '14px' }} />
            <div className="skeleton-box" style={{ width: '75%', height: '24px' }} />
            <div className="skeleton-box" style={{ width: '50%', height: '12px' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <div className="skeleton-box" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              <div className="skeleton-box" style={{ width: '40%', height: '14px' }} />
              <div className="skeleton-box" style={{ width: '60%', height: '12px' }} />
            </div>
          </div>
          <div className="skeleton-box" style={{ width: '100px', height: '28px' }} />
        </div>
      ))}
    </div>
  );
};
