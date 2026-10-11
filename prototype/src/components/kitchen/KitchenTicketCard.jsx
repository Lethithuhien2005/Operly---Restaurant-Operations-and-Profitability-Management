import React from 'react';
import { Clock, AlertTriangle, FastForward, CheckCheck } from 'lucide-react';
import { KitchenTicketItem } from './KitchenTicketItem';

export const KitchenTicketCard = ({
  ticket,
  onAdvanceStatus,
  onPartialBump,
  onOpenSpoilage,
  onBumpAllTicketItems
}) => {
  const isCritical = ticket.elapsedMinutes >= 15;
  const isWarning = ticket.elapsedMinutes >= 10 && !isCritical;

  const hasPending = ticket.items.some((i) => i.status === 'Pending');
  const hasCooking = ticket.items.some((i) => i.status === 'Cooking');
  const allReadyOrServed = ticket.items.every(
    (i) => i.status === 'Ready' || i.status === 'Served' || i.status === 'Spoiled'
  );

  return (
    <div
      style={{
        backgroundColor: '#1e293b',
        border: isCritical
          ? '2px solid #ef4444'
          : isWarning
          ? '2px solid #f59e0b'
          : '1px solid #475569',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: isCritical
          ? '0 0 16px rgba(239, 68, 68, 0.35)'
          : isWarning
          ? '0 0 10px rgba(245, 158, 11, 0.2)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
        overflow: 'hidden',
        transition: 'border 0.2s ease, box-shadow 0.2s ease'
      }}
    >
      {/* Ticket Header matching SCR-KDS-01 */}
      <div
        style={{
          backgroundColor: isCritical ? '#450a0a' : isWarning ? '#451a03' : '#0f172a',
          padding: '12px 14px',
          borderBottom: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px', fontWeight: 900, color: '#f8fafc', letterSpacing: '0.02em' }}>
              TICKET #{ticket.ticketId}
            </span>
            <span
              style={{
                backgroundColor: '#0284c7',
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: '5px',
                fontSize: '12px',
                fontWeight: 800
              }}
            >
              {ticket.tableId}
            </span>

            {/* Priority Tag */}
            {ticket.priority && (
              <span
                style={{
                  backgroundColor:
                    ticket.priority === 'VIP'
                      ? '#7c3aed'
                      : ticket.priority === 'Rush'
                      ? '#dc2626'
                      : '#334155',
                  color: '#ffffff',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 800,
                  textTransform: 'uppercase'
                }}
              >
                {ticket.priority}
              </span>
            )}
          </div>

          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
            Order {ticket.orderId} • Placed {ticket.placedAt}
          </div>
        </div>

        {/* Elapsed Timer Badge with High-Contrast Operational Warnings */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            backgroundColor: isCritical ? '#dc2626' : isWarning ? '#d97706' : '#1e293b',
            color: '#ffffff',
            padding: '5px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 900,
            fontFamily: 'var(--font-mono)',
            border: `1px solid ${isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#334155'}`,
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap'
          }}
          title={
            isCritical
              ? 'Critical Delay (> 15 minutes waiting)'
              : isWarning
              ? 'Warning (> 10 minutes waiting)'
              : 'Normal elapsed prep time'
          }
        >
          {isCritical ? (
            <AlertTriangle size={14} color="#ffffff" strokeWidth={3} />
          ) : (
            <Clock size={13} color={isWarning ? '#ffffff' : '#94a3b8'} />
          )}
          <span>{ticket.elapsedMinutes}m</span>
          {isCritical && <span>(CRITICAL)</span>}
          {isWarning && <span>(WARNING)</span>}
        </div>
      </div>

      {/* Ticket Batch Action Bar (Allows Line Cook to Advance Entire Ticket with 1 Tap) */}
      <div
        style={{
          backgroundColor: '#131d30',
          padding: '6px 14px',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
          {ticket.items.length} {ticket.items.length === 1 ? 'item' : 'items'}
        </span>

        <div style={{ display: 'flex', gap: '6px' }}>
          {hasPending && (
            <button
              onClick={() => onBumpAllTicketItems(ticket.ticketId, 'Cooking')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                backgroundColor: 'rgba(249, 115, 22, 0.2)',
                border: '1px solid #f97316',
                color: '#fb923c',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="Start cooking all pending items on this ticket"
            >
              <FastForward size={12} />
              <span>Start All</span>
            </button>
          )}

          {hasCooking && (
            <button
              onClick={() => onBumpAllTicketItems(ticket.ticketId, 'Ready')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                border: '1px solid #22c55e',
                color: '#4ade80',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="Bump all cooking items to Ready for waiter pickup"
            >
              <CheckCheck size={12} />
              <span>Bump All</span>
            </button>
          )}

          {allReadyOrServed && (
            <span
              style={{
                fontSize: '11px',
                color: '#4ade80',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>✓</span>
              <span>All Ready at Pass</span>
            </span>
          )}
        </div>
      </div>

      {/* Ticket Items List */}
      <div
        style={{
          padding: '12px 14px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        {ticket.items.map((item) => (
          <KitchenTicketItem
            key={item.id}
            item={item}
            ticketId={ticket.ticketId}
            onAdvanceStatus={onAdvanceStatus}
            onPartialBump={onPartialBump}
            onOpenSpoilage={onOpenSpoilage}
          />
        ))}
      </div>
    </div>
  );
};
