import React, { useState } from 'react';
import { useMockStore } from '../store/mockStore';

export const KitchenKDSScreen = () => {
  const {
    kdsTickets,
    advanceTicketItemStatus,
    partialBumpItem,
    menuItems,
    toggle86Item,
    showToast
  } = useMockStore();

  const [selectedStation, setSelectedStation] = useState('All');
  const [is86ModalOpen, setIs86ModalOpen] = useState(false);
  const [searchTerm86, setSearchTerm86] = useState('');

  const stations = ['All', 'Pantry', 'Grill', 'Hot Line', 'Bar'];

  const filteredTickets = kdsTickets.filter((ticket) => {
    if (selectedStation === 'All') return true;
    return ticket.items.some((item) => item.station.toLowerCase().includes(selectedStation.toLowerCase()));
  });

  const filtered86Items = menuItems.filter((dish) =>
    dish.name.toLowerCase().includes(searchTerm86.toLowerCase())
  );

  return (
    <div className="device-tablet" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top KDS Header matching SCR-KDS-01 */}
      <div
        style={{
          backgroundColor: '#1e293b',
          borderBottom: '2px solid #334155',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.02em', color: '#38bdf8' }}>
            KDS - KITCHEN DISPLAY SYSTEM
          </div>
          <div style={{ backgroundColor: '#0f172a', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>
            ACTIVE TICKETS: {filteredTickets.length}
          </div>
        </div>

        {/* Validated Improvement: Ergonomic Touch Pills replacing small desktop dropdown for kitchen glove usability */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', backgroundColor: '#0f172a', borderRadius: '8px', padding: '3px', gap: '4px', border: '1px solid #334155' }}>
            {stations.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStation(s)}
                style={{
                  padding: '6px 12px',
                  minHeight: '36px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: selectedStation === s ? 800 : 600,
                  backgroundColor: selectedStation === s ? '#0284c7' : 'transparent',
                  color: selectedStation === s ? '#ffffff' : '#94a3b8'
                }}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIs86ModalOpen(true)}
            style={{
              backgroundColor: '#dc2626',
              color: '#fff',
              minHeight: '40px',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🚫</span>
            <span>86 Item Modal</span>
          </button>
        </div>
      </div>

      {/* FIFO Chronological Preparation Queue Grid */}
      <div
        style={{
          flex: 1,
          padding: '16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
          gap: '16px',
          overflowY: 'auto',
          alignContent: 'start'
        }}
      >
        {filteredTickets.map((ticket) => {
          const isWarning = ticket.elapsedMinutes >= 10;

          return (
            <div
              key={ticket.ticketId}
              style={{
                backgroundColor: '#1e293b',
                border: isWarning ? '2px solid #ef4444' : '1px solid #475569',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
                overflow: 'hidden'
              }}
            >
              {/* Ticket Card Header with Timer */}
              <div
                style={{
                  backgroundColor: isWarning ? '#450a0a' : '#0f172a',
                  padding: '10px 14px',
                  borderBottom: '1px solid #334155',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc' }}>
                    TICKET #{ticket.ticketId} | {ticket.tableId}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '6px' }}>
                    ({ticket.placedAt})
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: isWarning ? '#dc2626' : '#334155',
                    color: '#ffffff',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {ticket.elapsedMinutes}m {isWarning ? '(WARNING)' : ''}
                </div>
              </div>

              {/* Ticket Items List */}
              <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {ticket.items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: '#0f172a',
                      padding: '10px',
                      borderRadius: '8px',
                      borderLeft: `4px solid ${
                        item.status === 'Cooking'
                          ? '#f97316'
                          : item.status === 'Ready'
                          ? '#22c55e'
                          : item.status === 'Served'
                          ? '#0284c7'
                          : '#64748b'
                      }`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc' }}>
                          [{item.quantity}x] {item.name}
                        </div>
                        {item.modifier && item.modifier !== 'Default' && (
                          <div style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 600, marginTop: '2px' }}>
                            Note: {item.modifier}
                          </div>
                        )}
                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                          {item.station}
                        </div>
                      </div>

                      <span
                        style={{
                          backgroundColor:
                            item.status === 'Cooking'
                              ? 'rgba(249, 115, 22, 0.2)'
                              : item.status === 'Ready'
                              ? 'rgba(34, 197, 94, 0.2)'
                              : item.status === 'Served'
                              ? 'rgba(2, 132, 199, 0.2)'
                              : 'rgba(100, 116, 139, 0.2)',
                          color:
                            item.status === 'Cooking'
                              ? '#fb923c'
                              : item.status === 'Ready'
                              ? '#4ade80'
                              : item.status === 'Served'
                              ? '#38bdf8'
                              : '#94a3b8',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 800
                        }}
                      >
                        {item.status}
                      </span>
                    </div>

                    {/* State Bump Action Buttons */}
                    <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                      {item.status === 'Pending' && (
                        <button
                          onClick={() => advanceTicketItemStatus(ticket.ticketId, item.id, 'Cooking')}
                          style={{
                            backgroundColor: '#f97316',
                            color: '#fff',
                            minHeight: '36px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700
                          }}
                        >
                          ▶ START COOKING
                        </button>
                      )}

                      {item.status === 'Cooking' && (
                        <>
                          <button
                            onClick={() => advanceTicketItemStatus(ticket.ticketId, item.id, 'Ready')}
                            style={{
                              backgroundColor: '#16a34a',
                              color: '#fff',
                              minHeight: '36px',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700
                            }}
                          >
                            ✓ BUMP TO READY
                          </button>

                          {item.quantity > 1 && (
                            <button
                              onClick={() => partialBumpItem(ticket.ticketId, item.id)}
                              style={{
                                backgroundColor: '#0284c7',
                                color: '#fff',
                                minHeight: '36px',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 700
                              }}
                            >
                              BUMP 1/{item.quantity}
                            </button>
                          )}

                          <button
                            onClick={() => showToast(`Spoilage logged for ${item.name}. Re-fire ticket active.`)}
                            style={{
                              backgroundColor: '#475569',
                              color: '#f8fafc',
                              minHeight: '36px',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 600
                            }}
                          >
                            LOG SPOILAGE
                          </button>
                        </>
                      )}

                      {item.status === 'Ready' && (
                        <div style={{ fontSize: '11px', color: '#4ade80', fontWeight: 600, padding: '4px 0' }}>
                          Awaiting Waiter Pickup at Pass
                        </div>
                      )}

                      {item.status === 'Served' && (
                        <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600, padding: '4px 0' }}>
                          ✓ Delivered to Table
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* SCR-KDS-02: 86 Out-of-Stock Management Modal */}
      {is86ModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card modal-dark">
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid #334155',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc' }}>
                86 ITEM MANAGEMENT (INSTANT MENU DISABLE)
              </h3>
              <button
                onClick={() => setIs86ModalOpen(false)}
                style={{ color: '#94a3b8', fontSize: '18px', fontWeight: 700 }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '16px' }}>
              <input
                type="text"
                placeholder="Search ingredient or dish (e.g. Salmon)..."
                value={searchTerm86}
                onChange={(e) => setSearchTerm86(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#0f172a',
                  border: '1px solid #475569',
                  color: '#fff',
                  marginBottom: '14px'
                }}
              />

              <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filtered86Items.map((dish) => (
                  <div
                    key={dish.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      border: '1px solid #334155'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                        {dish.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{dish.category} • {dish.price.toLocaleString()} VND</div>
                      {dish.disabledReason && (
                        <div style={{ fontSize: '10px', color: '#ef4444', marginTop: '2px' }}>
                          {dish.disabledReason}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => toggle86Item(dish.id)}
                      style={{
                        backgroundColor: dish.is86 ? '#16a34a' : '#dc2626',
                        color: '#fff',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}
                    >
                      {dish.is86 ? 'UN-86 RESTORE' : '86 NOW'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: '12px 16px', borderTop: '1px solid #334155', textAlign: 'right' }}>
              <button
                onClick={() => setIs86ModalOpen(false)}
                style={{
                  backgroundColor: '#334155',
                  color: '#fff',
                  padding: '6px 16px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
