import React from 'react';
import { CheckCircle2, SearchX, PlusCircle, RotateCcw } from 'lucide-react';

export const KitchenEmptyState = ({
  hasAnyTickets,
  selectedStation,
  activeStatusFilter,
  searchQuery,
  onResetFilters,
  onSimulateTicket
}) => {
  const isFilterActive =
    selectedStation !== 'All' || activeStatusFilter !== 'All' || Boolean(searchQuery);

  if (!hasAnyTickets) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          textAlign: 'center',
          color: '#94a3b8'
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            border: '2px solid #22c55e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#4ade80',
            marginBottom: '16px'
          }}
        >
          <CheckCircle2 size={36} strokeWidth={2.5} />
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
          Kitchen Queue All Caught Up!
        </h3>
        <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '420px', lineHeight: 1.5, marginBottom: '20px' }}>
          All food preparation tickets have been fulfilled and handed off to the pass. Standing by for incoming dining room tickets.
        </p>

        <button
          onClick={onSimulateTicket}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            minHeight: '44px',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(2, 132, 199, 0.4)'
          }}
        >
          <PlusCircle size={18} />
          <span>Simulate Incoming Order</span>
        </button>
      </div>
    );
  }

  // Active filters resulted in 0 matches
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
        color: '#94a3b8'
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          marginBottom: '16px'
        }}
      >
        <SearchX size={32} />
      </div>

      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
        No Matching Kitchen Tickets
      </h3>
      <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '420px', lineHeight: 1.5, marginBottom: '16px' }}>
        No orders match your current station ({selectedStation}), status ({activeStatusFilter}),
        {searchQuery ? ` or search query "${searchQuery}"` : ''}.
      </p>

      {isFilterActive && (
        <button
          onClick={onResetFilters}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#334155',
            color: '#f8fafc',
            minHeight: '40px',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <RotateCcw size={14} />
          <span>Reset All Filters</span>
        </button>
      )}
    </div>
  );
};
