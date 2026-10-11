import React from 'react';
import { Play, Check, AlertOctagon, RotateCcw } from 'lucide-react';

export const KitchenTicketItem = ({
  item,
  ticketId,
  onAdvanceStatus,
  onPartialBump,
  onOpenSpoilage
}) => {
  const isCooking = item.status === 'Cooking';
  const isPending = item.status === 'Pending';
  const isReady = item.status === 'Ready';
  const isServed = item.status === 'Served';
  const isSpoiled = item.status === 'Spoiled';

  const isRefire = item.modifier && item.modifier.includes('[RE-FIRE');

  return (
    <div
      style={{
        backgroundColor: '#0f172a',
        padding: '12px',
        borderRadius: '8px',
        borderLeft: `5px solid ${
          isCooking
            ? '#f97316'
            : isReady
            ? '#22c55e'
            : isServed
            ? '#0284c7'
            : isSpoiled
            ? '#ef4444'
            : '#64748b'
        }`,
        border: '1px solid #334155',
        borderLeftWidth: '5px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        transition: 'all 0.15s ease'
      }}
    >
      {/* Dish Name & Status Pill */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '15px',
              fontWeight: 800,
              color: isSpoiled ? '#94a3b8' : '#f8fafc',
              textDecoration: isSpoiled ? 'line-through' : 'none',
              lineHeight: 1.3
            }}
          >
            <span
              style={{
                display: 'inline-block',
                backgroundColor: isCooking ? '#f97316' : '#334155',
                color: '#fff',
                padding: '2px 7px',
                borderRadius: '5px',
                marginRight: '6px',
                fontSize: '13px',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)'
              }}
            >
              {item.quantity}x
            </span>
            {item.name}
          </div>

          {/* Modifier / Special Dietary Instruction Callout */}
          {item.modifier && item.modifier !== 'Default' && (
            <div
              style={{
                marginTop: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: isRefire ? 'rgba(239, 68, 68, 0.2)' : 'rgba(251, 191, 36, 0.15)',
                border: `1px solid ${isRefire ? '#ef4444' : '#f59e0b'}`,
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '12px',
                fontWeight: 700,
                color: isRefire ? '#fca5a5' : '#fbbf24'
              }}
            >
              <span>{isRefire ? '🚨' : '📝'}</span>
              <span>{item.modifier}</span>
            </div>
          )}

          {/* Station Sub-badge */}
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', fontWeight: 600 }}>
            {item.station}
          </div>
        </div>

        {/* Current State Pill */}
        <span
          style={{
            backgroundColor: isCooking
              ? 'rgba(249, 115, 22, 0.2)'
              : isReady
              ? 'rgba(34, 197, 94, 0.2)'
              : isServed
              ? 'rgba(2, 132, 199, 0.2)'
              : isSpoiled
              ? 'rgba(239, 68, 68, 0.2)'
              : 'rgba(100, 116, 139, 0.25)',
            color: isCooking
              ? '#fb923c'
              : isReady
              ? '#4ade80'
              : isServed
              ? '#38bdf8'
              : isSpoiled
              ? '#f87171'
              : '#cbd5e1',
            border: `1px solid ${
              isCooking
                ? 'rgba(249, 115, 22, 0.4)'
                : isReady
                ? 'rgba(34, 197, 94, 0.4)'
                : isServed
                ? 'rgba(2, 132, 199, 0.4)'
                : isSpoiled
                ? 'rgba(239, 68, 68, 0.4)'
                : 'rgba(100, 116, 139, 0.4)'
            }`,
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap'
          }}
        >
          {item.status}
        </span>
      </div>

      {/* State Transition Actions with Ergonomic Touch Heights (>= 44px) */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
        {isPending && (
          <button
            onClick={() => onAdvanceStatus(ticketId, item.id, 'Cooking')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              backgroundColor: '#f97316',
              color: '#ffffff',
              minHeight: '44px',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(249, 115, 22, 0.3)',
              flex: 1
            }}
          >
            <Play size={15} fill="currentColor" />
            <span>START COOKING</span>
          </button>
        )}

        {isCooking && (
          <>
            <button
              onClick={() => onAdvanceStatus(ticketId, item.id, 'Ready')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                minHeight: '44px',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(22, 163, 74, 0.3)',
                flex: '1 1 120px'
              }}
            >
              <Check size={16} strokeWidth={3} />
              <span>BUMP TO READY</span>
            </button>

            {item.quantity > 1 && (
              <button
                onClick={() => onPartialBump(ticketId, item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  minHeight: '44px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
                title="Split 1 item to Ready and keep remaining in Cooking"
              >
                BUMP 1/{item.quantity}
              </button>
            )}

            <button
              onClick={() => onOpenSpoilage(ticketId, item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: '#334155',
                color: '#f8fafc',
                minHeight: '44px',
                padding: '8px 10px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                border: '1px solid #475569'
              }}
              title="Log food wastage / burnt plate and trigger re-fire (SCR-KDS-03)"
            >
              <AlertOctagon size={14} color="#f87171" />
              <span>SPOILAGE</span>
            </button>
          </>
        )}

        {isReady && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ fontSize: '12px', color: '#4ade80', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>✓</span>
              <span>Awaiting Waiter Pickup at Pass</span>
            </div>
            <button
              onClick={() => onAdvanceStatus(ticketId, item.id, 'Cooking')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: 'transparent',
                color: '#94a3b8',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              title="Undo bump back to cooking"
            >
              <RotateCcw size={12} />
              <span>Undo</span>
            </button>
          </div>
        )}

        {isServed && (
          <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>✓</span>
            <span>Delivered to Table</span>
          </div>
        )}

        {isSpoiled && (
          <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>✕</span>
            <span>Written off (Spoilage Recorded)</span>
          </div>
        )}
      </div>
    </div>
  );
};
