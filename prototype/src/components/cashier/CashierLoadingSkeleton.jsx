import React from 'react';

/**
 * CashierLoadingSkeleton
 * Animated shimmer skeleton loaders for POS layout (queue, invoice table, settlement summary).
 */
export const CashierLoadingSkeleton = ({ type = 'invoice' }) => {
  if (type === 'queue') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div className="skeleton-box" style={{ width: '80px', height: '16px' }} />
              <div className="skeleton-box" style={{ width: '50px', height: '14px' }} />
            </div>
            <div className="skeleton-box" style={{ width: '120px', height: '12px', marginBottom: '8px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className="skeleton-box" style={{ width: '90px', height: '16px' }} />
              <div className="skeleton-box" style={{ width: '60px', height: '14px' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'settlement') {
    return (
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="skeleton-box" style={{ width: '100%', height: '80px', borderRadius: '8px' }} />
        <div className="skeleton-box" style={{ width: '100%', height: '80px', borderRadius: '8px' }} />
        <div className="skeleton-box" style={{ width: '100%', height: '140px', borderRadius: '8px' }} />
        <div className="skeleton-box" style={{ width: '100%', height: '44px', borderRadius: '8px' }} />
      </div>
    );
  }

  // Default: Invoice line items
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 80px 100px 110px 80px',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 0',
            borderBottom: '1px solid #f1f5f9'
          }}
        >
          <div>
            <div className="skeleton-box" style={{ width: '140px', height: '16px', marginBottom: '6px' }} />
            <div className="skeleton-box" style={{ width: '80px', height: '12px' }} />
          </div>
          <div className="skeleton-box" style={{ width: '30px', height: '16px', margin: '0 auto' }} />
          <div className="skeleton-box" style={{ width: '70px', height: '16px', marginLeft: 'auto' }} />
          <div className="skeleton-box" style={{ width: '80px', height: '16px', marginLeft: 'auto' }} />
          <div className="skeleton-box" style={{ width: '50px', height: '24px', margin: '0 auto' }} />
        </div>
      ))}
    </div>
  );
};
