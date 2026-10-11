import React from 'react';
import { Flame, Clock, Bell, AlertTriangle, Layers } from 'lucide-react';

export const KitchenOverview = ({ tickets, onStatusFilterSelect, activeStatusFilter }) => {
  // Compute metrics across all tickets and items
  const totalTickets = tickets.length;
  
  let pendingCount = 0;
  let cookingCount = 0;
  let readyCount = 0;
  let delayedTicketsCount = 0;

  tickets.forEach((ticket) => {
    if (ticket.elapsedMinutes >= 10) {
      delayedTicketsCount += 1;
    }
    ticket.items.forEach((item) => {
      if (item.status === 'Pending') pendingCount += 1;
      else if (item.status === 'Cooking') cookingCount += 1;
      else if (item.status === 'Ready') readyCount += 1;
    });
  });

  const cards = [
    {
      id: 'All',
      label: 'ACTIVE TICKETS',
      count: totalTickets,
      icon: Layers,
      color: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.1)',
      borderColor: 'rgba(56, 189, 248, 0.25)'
    },
    {
      id: 'Cooking',
      label: 'IN COOKING',
      count: cookingCount,
      icon: Flame,
      color: '#f97316',
      bg: 'rgba(249, 115, 22, 0.12)',
      borderColor: 'rgba(249, 115, 22, 0.3)'
    },
    {
      id: 'Pending',
      label: 'PENDING PREP',
      count: pendingCount,
      icon: Clock,
      color: '#fbbf24',
      bg: 'rgba(251, 191, 36, 0.12)',
      borderColor: 'rgba(251, 191, 36, 0.3)'
    },
    {
      id: 'Ready',
      label: 'READY AT PASS',
      count: readyCount,
      icon: Bell,
      color: '#22c55e',
      bg: 'rgba(34, 197, 94, 0.12)',
      borderColor: 'rgba(34, 197, 94, 0.3)'
    },
    {
      id: 'Delayed',
      label: 'DELAYED (>10M)',
      count: delayedTicketsCount,
      icon: AlertTriangle,
      color: '#ef4444',
      bg: delayedTicketsCount > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.08)',
      borderColor: delayedTicketsCount > 0 ? '#ef4444' : 'rgba(239, 68, 68, 0.25)',
      urgent: delayedTicketsCount > 0
    }
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '12px',
        padding: '12px 20px',
        backgroundColor: '#0b1120',
        borderBottom: '1px solid #1e293b'
      }}
    >
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeStatusFilter === card.id;

        return (
          <button
            key={card.id}
            onClick={() => onStatusFilterSelect && onStatusFilterSelect(card.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              backgroundColor: isSelected ? card.bg : '#0f172a',
              border: `1.5px solid ${isSelected ? card.color : card.borderColor}`,
              borderRadius: '10px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: isSelected ? `0 0 10px ${card.bg}` : 'none'
            }}
            title={`Filter by ${card.label}`}
          >
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: card.color,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  marginBottom: '2px'
                }}
              >
                {card.label}
              </div>
              <div
                style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  color: '#f8fafc',
                  fontFamily: 'var(--font-mono)',
                  lineHeight: 1.1
                }}
              >
                {card.count}
              </div>
            </div>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: card.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: card.color
              }}
            >
              <Icon size={18} strokeWidth={2.5} />
            </div>
          </button>
        );
      })}
    </div>
  );
};
