import React from 'react';
import { Search, Volume2, VolumeX, PlusCircle, Ban, ArrowDownUp } from 'lucide-react';
import { playKitchenChime } from '../../utils/audioChime';

export const KitchenToolbar = ({
  stations,
  selectedStation,
  onSelectStation,
  tickets,
  searchQuery,
  onSearchChange,
  sortOrder,
  onSortChange,
  isChimeEnabled,
  onToggleChime,
  onSimulateTicket,
  onOpen86Modal,
  outOfStockCount
}) => {
  // Count tickets per station for quick glance
  const getStationCount = (stationName) => {
    if (stationName === 'All') return tickets.length;
    return tickets.filter((ticket) =>
      ticket.items.some((item) => item.station.toLowerCase().includes(stationName.toLowerCase()))
    ).length;
  };

  const handleSimulateClick = () => {
    if (isChimeEnabled) {
      playKitchenChime();
    }
    onSimulateTicket();
  };

  const handleTestChime = () => {
    playKitchenChime();
  };

  return (
    <div
      style={{
        backgroundColor: '#1e293b',
        borderBottom: '2px solid #334155',
        padding: '12px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      {/* Upper Toolbar: Title, System Chime, Simulate, 86 Modal */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              fontSize: '18px',
              fontWeight: 800,
              letterSpacing: '0.02em',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>KDS DISPLAY</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: '#0284c7',
                color: '#fff',
                padding: '2px 8px',
                borderRadius: '4px',
                letterSpacing: '0.05em'
              }}
            >
              LIVE
            </span>
          </div>

          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            Station Queue • Kitchen Touch Screen
          </span>
        </div>

        {/* Global Toolbar Quick Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Audio Chime Toggle Button */}
          <button
            onClick={onToggleChime}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              minHeight: '44px',
              borderRadius: '8px',
              backgroundColor: isChimeEnabled ? '#064e3b' : '#334155',
              border: `1px solid ${isChimeEnabled ? '#10b981' : '#475569'}`,
              color: isChimeEnabled ? '#a7f3d0' : '#94a3b8',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title={isChimeEnabled ? 'Audio Chime Enabled (Click to Mute)' : 'Audio Chime Muted (Click to Unmute)'}
          >
            {isChimeEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>{isChimeEnabled ? 'Chime ON' : 'Chime Muted'}</span>
          </button>

          {/* Test Chime Trigger */}
          {isChimeEnabled && (
            <button
              onClick={handleTestChime}
              style={{
                padding: '8px 10px',
                minHeight: '44px',
                borderRadius: '8px',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                color: '#cbd5e1',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Test audio chime output"
            >
              Test Chime
            </button>
          )}

          {/* Simulate New Incoming Order Ticket */}
          <button
            onClick={handleSimulateClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              minHeight: '44px',
              borderRadius: '8px',
              backgroundColor: '#0369a1',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 700,
              boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
              cursor: 'pointer'
            }}
            title="Simulate incoming order from dining room"
          >
            <PlusCircle size={16} />
            <span>+ Simulate Ticket</span>
          </button>

          {/* 86 Out of Stock Modal Button */}
          <button
            onClick={onOpen86Modal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              minHeight: '44px',
              borderRadius: '8px',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 800,
              boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)',
              cursor: 'pointer'
            }}
            title="Open 86 Out-of-Stock Management Modal (SCR-KDS-02)"
          >
            <Ban size={16} />
            <span>86 Items</span>
            {outOfStockCount > 0 && (
              <span
                style={{
                  backgroundColor: '#ffffff',
                  color: '#dc2626',
                  fontSize: '11px',
                  fontWeight: 900,
                  padding: '1px 6px',
                  borderRadius: '999px',
                  marginLeft: '2px'
                }}
              >
                {outOfStockCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Lower Toolbar: Station Pills, Search, and Sort */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        {/* Ergonomic Touch Pills for Gloved Line Cooks (Minimum height >= 44px) */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#0f172a',
            borderRadius: '10px',
            padding: '4px',
            gap: '6px',
            border: '1px solid #334155',
            overflowX: 'auto',
            maxWidth: '100%'
          }}
        >
          {stations.map((s) => {
            const isSelected = selectedStation === s;
            const count = getStationCount(s);

            return (
              <button
                key={s}
                onClick={() => onSelectStation(s)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  minHeight: '44px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: isSelected ? 800 : 600,
                  backgroundColor: isSelected ? '#0284c7' : 'transparent',
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  border: isSelected ? '1px solid #38bdf8' : '1px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{s}</span>
                <span
                  style={{
                    backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.25)' : '#1e293b',
                    color: isSelected ? '#ffffff' : '#cbd5e1',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '999px'
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Quick Search */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '12px',
                color: '#64748b',
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              placeholder="Search Table, Ticket, Dish..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                padding: '8px 12px 8px 34px',
                minHeight: '44px',
                minWidth: '220px',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '12px'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  color: '#94a3b8',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '0 10px',
              minHeight: '44px'
            }}
          >
            <ArrowDownUp size={14} color="#64748b" />
            <select
              value={sortOrder}
              onChange={(e) => onSortChange(e.target.value)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#f8fafc',
                fontSize: '12px',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
                padding: '6px 0'
              }}
            >
              <option value="fifo" style={{ backgroundColor: '#0f172a', color: '#fff' }}>
                FIFO (Earliest First)
              </option>
              <option value="longest" style={{ backgroundColor: '#0f172a', color: '#fff' }}>
                Longest Waiting First
              </option>
              <option value="table" style={{ backgroundColor: '#0f172a', color: '#fff' }}>
                Sort by Table Number
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
