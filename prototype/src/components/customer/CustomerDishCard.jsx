import React from 'react';
import { Plus, SlidersHorizontal, Sparkles, Ban } from 'lucide-react';

export const CustomerDishCard = ({ dish, onQuickAdd, onCustomize, hasPairing }) => {
  const is86 = dish.is86;
  const hasModifiers = dish.modifiers && dish.modifiers.length > 0;

  return (
    <div
      style={{
        backgroundColor: is86 ? '#f8fafc' : '#ffffff',
        border: is86 ? '1px dashed #cbd5e1' : '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '14px',
        opacity: is86 ? 0.7 : 1,
        boxShadow: is86 ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        transition: 'all 0.15s ease'
      }}
    >
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        {/* Dish Visual Icon / Emoji Box */}
        <div
          style={{
            width: '68px',
            height: '68px',
            backgroundColor: is86 ? '#e2e8f0' : '#f0fdfa',
            border: `1px solid ${is86 ? '#cbd5e1' : '#ccfbf1'}`,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '34px',
            flexShrink: 0
          }}
        >
          {dish.image}
        </div>

        {/* Dish Title, Description, and Badges */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <h3
              style={{
                fontSize: '15px',
                fontWeight: 800,
                color: is86 ? '#64748b' : '#0f172a',
                lineHeight: 1.2
              }}
            >
              {dish.name}
            </h3>

            {is86 && (
              <span
                style={{
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  whiteSpace: 'nowrap'
                }}
              >
                <Ban size={10} />
                <span>86'D OUT</span>
              </span>
            )}
          </div>

          <p
            style={{
              fontSize: '12px',
              color: '#64748b',
              marginTop: '4px',
              lineHeight: 1.4
            }}
          >
            {dish.description}
          </p>

          {/* Station & AI Pairing Tags */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10px', color: '#0f766e', backgroundColor: '#f0fdfa', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
              {dish.category}
            </span>
            <span style={{ fontSize: '10px', color: '#64748b', backgroundColor: '#f1f5f9', padding: '1px 6px', borderRadius: '4px', fontWeight: 500 }}>
              {dish.station}
            </span>
            {hasPairing && !is86 && (
              <span style={{ fontSize: '10px', color: '#d97706', backgroundColor: '#fef3c7', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                <Sparkles size={10} />
                <span>AI Pairing</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pricing & Interactive Action Area */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '6px',
          borderTop: '1px solid #f1f5f9'
        }}
      >
        <div>
          <div style={{ fontSize: '15px', fontWeight: 900, color: is86 ? '#94a3b8' : '#0f766e', fontFamily: 'var(--font-mono)' }}>
            {dish.price.toLocaleString()} VND
          </div>
          {dish.modifiers && dish.modifiers.length > 0 && (
            <div style={{ fontSize: '10px', color: '#64748b' }}>
              Customizable options available
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {!is86 ? (
            <>
              {hasModifiers ? (
                <button
                  onClick={() => onCustomize(dish)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#0f766e',
                    color: '#ffffff',
                    minHeight: '42px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(15, 118, 110, 0.25)'
                  }}
                  title="Customize spice level, doneness, and notes"
                >
                  <SlidersHorizontal size={13} />
                  <span>Customize</span>
                </button>
              ) : (
                <button
                  onClick={() => onQuickAdd(dish)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#0f766e',
                    color: '#ffffff',
                    minHeight: '42px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(15, 118, 110, 0.25)'
                  }}
                  title="Add to shared table cart"
                >
                  <Plus size={14} strokeWidth={3} />
                  <span>Add</span>
                </button>
              )}
            </>
          ) : (
            <span
              style={{
                fontSize: '11px',
                color: '#94a3b8',
                fontWeight: 600,
                padding: '8px 12px',
                backgroundColor: '#f1f5f9',
                borderRadius: '8px'
              }}
            >
              Unavailable
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
