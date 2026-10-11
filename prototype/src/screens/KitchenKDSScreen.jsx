import React, { useState, useMemo } from 'react';
import { useMockStore } from '../store/mockStore';
import { KitchenOverview } from '../components/kitchen/KitchenOverview';
import { KitchenToolbar } from '../components/kitchen/KitchenToolbar';
import { KitchenTicketCard } from '../components/kitchen/KitchenTicketCard';
import { Kitchen86Modal } from '../components/kitchen/Kitchen86Modal';
import { KitchenSpoilageModal } from '../components/kitchen/KitchenSpoilageModal';
import { KitchenEmptyState } from '../components/kitchen/KitchenEmptyState';

export const KitchenKDSScreen = () => {
  const {
    kdsTickets,
    advanceTicketItemStatus,
    partialBumpItem,
    bumpAllTicketItems,
    logSpoilage,
    addSimulatedTicket,
    menuItems,
    toggle86Item,
    showToast
  } = useMockStore();

  // Local interactive filter and view states
  const [selectedStation, setSelectedStation] = useState('All');
  const [activeStatusFilter, setActiveStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('fifo');
  const [isChimeEnabled, setIsChimeEnabled] = useState(true);

  // Modal dialog states
  const [is86ModalOpen, setIs86ModalOpen] = useState(false);
  const [spoilageState, setSpoilageState] = useState({
    isOpen: false,
    ticketId: null,
    targetItem: null
  });

  const stations = ['All', 'Pantry', 'Grill', 'Hot Line', 'Bar'];

  // Count currently 86'd items for toolbar badge
  const outOfStockCount = useMemo(() => {
    return menuItems.filter((m) => m.is86).length;
  }, [menuItems]);

  // Handle opening spoilage modal for a specific line item
  const handleOpenSpoilage = (ticketId, item) => {
    setSpoilageState({
      isOpen: true,
      ticketId,
      targetItem: item
    });
  };

  const handleCloseSpoilage = () => {
    setSpoilageState({
      isOpen: false,
      ticketId: null,
      targetItem: null
    });
  };

  // Filter and sort tickets dynamically
  const filteredTickets = useMemo(() => {
    return kdsTickets
      .filter((ticket) => {
        // Station filtering
        if (selectedStation !== 'All') {
          const hasStationMatch = ticket.items.some((item) =>
            item.station.toLowerCase().includes(selectedStation.toLowerCase())
          );
          if (!hasStationMatch) return false;
        }

        // Status filter
        if (activeStatusFilter === 'Cooking') {
          if (!ticket.items.some((item) => item.status === 'Cooking')) return false;
        } else if (activeStatusFilter === 'Pending') {
          if (!ticket.items.some((item) => item.status === 'Pending')) return false;
        } else if (activeStatusFilter === 'Ready') {
          if (!ticket.items.some((item) => item.status === 'Ready')) return false;
        } else if (activeStatusFilter === 'Delayed') {
          if (ticket.elapsedMinutes < 10) return false;
        }

        // Search query filtering
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTicketId = ticket.ticketId.toLowerCase().includes(q);
          const matchTable = ticket.tableId.toLowerCase().includes(q);
          const matchOrder = ticket.orderId.toLowerCase().includes(q);
          const matchItem = ticket.items.some(
            (item) =>
              item.name.toLowerCase().includes(q) ||
              (item.modifier && item.modifier.toLowerCase().includes(q))
          );
          if (!matchTicketId && !matchTable && !matchOrder && !matchItem) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'longest') {
          return b.elapsedMinutes - a.elapsedMinutes;
        }
        if (sortOrder === 'table') {
          return a.tableId.localeCompare(b.tableId);
        }
        // Default 'fifo' (Earliest first)
        return parseInt(a.ticketId, 10) - parseInt(b.ticketId, 10);
      });
  }, [kdsTickets, selectedStation, activeStatusFilter, searchQuery, sortOrder]);

  const handleResetFilters = () => {
    setSelectedStation('All');
    setActiveStatusFilter('All');
    setSearchQuery('');
  };

  return (
    <div
      className="device-tablet"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#0b1120'
      }}
    >
      {/* KDS Header & Ergonomic Touch Toolbar */}
      <KitchenToolbar
        stations={stations}
        selectedStation={selectedStation}
        onSelectStation={setSelectedStation}
        tickets={kdsTickets}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        isChimeEnabled={isChimeEnabled}
        onToggleChime={() => setIsChimeEnabled((prev) => !prev)}
        onSimulateTicket={addSimulatedTicket}
        onOpen86Modal={() => setIs86ModalOpen(true)}
        outOfStockCount={outOfStockCount}
      />

      {/* Operational Metrics Bar (SCR-KDS-01) */}
      <KitchenOverview
        tickets={kdsTickets}
        activeStatusFilter={activeStatusFilter}
        onStatusFilterSelect={(status) =>
          setActiveStatusFilter((prev) => (prev === status ? 'All' : status))
        }
      />

      {/* FIFO Chronological Preparation Queue Grid */}
      <div
        style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {filteredTickets.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '16px',
              alignContent: 'start'
            }}
          >
            {filteredTickets.map((ticket) => (
              <KitchenTicketCard
                key={ticket.ticketId}
                ticket={ticket}
                onAdvanceStatus={advanceTicketItemStatus}
                onPartialBump={partialBumpItem}
                onOpenSpoilage={handleOpenSpoilage}
                onBumpAllTicketItems={bumpAllTicketItems}
              />
            ))}
          </div>
        ) : (
          <KitchenEmptyState
            hasAnyTickets={kdsTickets.length > 0}
            selectedStation={selectedStation}
            activeStatusFilter={activeStatusFilter}
            searchQuery={searchQuery}
            onResetFilters={handleResetFilters}
            onSimulateTicket={addSimulatedTicket}
          />
        )}
      </div>

      {/* SCR-KDS-02: 86 Out-of-Stock Management Modal */}
      <Kitchen86Modal
        isOpen={is86ModalOpen}
        onClose={() => setIs86ModalOpen(false)}
        menuItems={menuItems}
        onToggle86={toggle86Item}
      />

      {/* SCR-KDS-03: Food Spoilage & Wastage Logger Modal */}
      <KitchenSpoilageModal
        isOpen={spoilageState.isOpen}
        onClose={handleCloseSpoilage}
        ticketId={spoilageState.ticketId}
        targetItem={spoilageState.targetItem}
        onConfirmSpoilage={logSpoilage}
      />
    </div>
  );
};
