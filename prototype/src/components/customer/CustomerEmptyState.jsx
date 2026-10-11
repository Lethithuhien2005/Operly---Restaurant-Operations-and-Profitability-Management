import React from 'react';
import { SearchX, ShoppingBag, CalendarX, RotateCcw } from 'lucide-react';

export const CustomerEmptyState = ({ type = 'search', query = '', onReset }) => {
  let icon = <SearchX size={36} color="#64748b" />;
  let title = 'No Matching Dishes';
  let description = `No menu items match your search "${query}". Try adjusting keywords or category filters.`;

  if (type === 'cart') {
    icon = <ShoppingBag size={36} color="#0f766e" />;
    title = 'Shared Cart is Empty';
    description = 'Your table cart currently has no items. Explore the menu and add dishes.';
  } else if (type === 'reservations') {
    icon = <CalendarX size={36} color="#64748b" />;
    title = 'No Reservations Found';
    description = 'You have no active table reservations at Operly. Reserve a table online in advance.';
  }

  return (
    <div
      style={{
        padding: '36px 16px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#64748b',
        gap: '10px'
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '4px'
        }}
      >
        {icon}
      </div>

      <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
        {title}
      </h4>

      <p style={{ fontSize: '12px', color: '#64748b', maxWidth: '300px', lineHeight: 1.4 }}>
        {description}
      </p>

      {onReset && (
        <button
          onClick={onReset}
          style={{
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            backgroundColor: '#0f766e',
            color: '#ffffff',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <RotateCcw size={14} />
          <span>Clear Filters</span>
        </button>
      )}
    </div>
  );
};
