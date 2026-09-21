import React, { useState } from 'react';
import { useMockStore } from '../store/mockStore';

export const WaiterFloorScreen = () => {
  const {
    tables,
    readyDishesList,
    markItemServed,
    resetTableToAvailable,
    showToast
  } = useMockStore();

  const [selectedTableId, setSelectedTableId] = useState('T05');
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState(false);
  const [confirmCleanModal, setConfirmCleanModal] = useState(false);

  const selectedTable = tables.find((t) => t.id === selectedTableId) || tables[0];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return { label: 'FREE [G]', bg: '#dcfce7', text: '#166534', border: '#86efac' };
      case 'Occupied':
        return { label: 'OCCUPIED [R]', bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' };
      case 'Reserved':
        return { label: 'RESERVED [B]', bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' };
      case 'Cleaning':
        return { label: 'CLEANING [Y]', bg: '#fef3c7', text: '#92400e', border: '#fcd34d' };
      default:
        return { label: status, bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
    }
  };

  return (
    <div className="device-mobile" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Header matching SCR-WAIT-01 */}
      <div style={{ backgroundColor: '#0f766e', color: '#fff', padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '16px' }}>OPERLY WAITER | Floor 1</div>
            <div style={{ fontSize: '11px', opacity: 0.85 }}>Server: Minh Tuan Tran • Active Shift</div>
          </div>

          <button
            onClick={() => setIsAlertDrawerOpen(true)}
            style={{
              backgroundColor: readyDishesList.length > 0 ? '#ef4444' : 'rgba(255,255,255,0.2)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🔔</span>
            <span>Alerts ({readyDishesList.length})</span>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          padding: '8px 14px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          fontSize: '11px',
          color: '#64748b',
          display: 'flex',
          justifyContent: 'space-around'
        }}
      >
        <span>🟢 Free</span>
        <span>🔵 Reserved</span>
        <span>🔴 Occupied</span>
        <span>🟡 Cleaning</span>
      </div>

      {/* Interactive Floor Map Canvas */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px'
          }}
        >
          {tables.map((tbl) => {
            const badge = getStatusBadge(tbl.status);
            const isSelected = tbl.id === selectedTableId;

            return (
              <div
                key={tbl.id}
                onClick={() => setSelectedTableId(tbl.id)}
                style={{
                  backgroundColor: isSelected ? '#f0fdf4' : '#ffffff',
                  border: isSelected ? '2px solid #0f766e' : `1px solid ${badge.border}`,
                  borderRadius: '12px',
                  padding: '12px',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 4px 6px -1px rgba(15, 118, 110, 0.2)' : '0 1px 2px rgba(0,0,0,0.05)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{tbl.id}</span>
                  <span
                    style={{
                      backgroundColor: badge.bg,
                      color: badge.text,
                      fontSize: '9px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 700
                    }}
                  >
                    {tbl.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                  {tbl.seats} Seats
                </div>

                {tbl.note && (
                  <div style={{ fontSize: '10px', color: '#475569', marginTop: '6px', fontWeight: 600 }}>
                    {tbl.note}
                  </div>
                )}
                {tbl.billAmount && (
                  <div style={{ fontSize: '11px', color: '#0f766e', fontWeight: 700, marginTop: '4px' }}>
                    Bill: {tbl.billAmount.toLocaleString()} VND
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Table Detail & Quick Action Bar */}
        <div
          style={{
            marginTop: '16px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '14px'
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            QUICK ACTIONS: {selectedTable.name} ({selectedTable.status})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {selectedTable.status === 'Cleaning' && (
              <button
                onClick={() => setConfirmCleanModal(true)}
                style={{
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  minHeight: '44px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span>✨</span>
                <span>MARK TABLE CLEANED & RESET (AVAILABLE)</span>
              </button>
            )}

            {selectedTable.status === 'Occupied' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => showToast(`Assisted order opened for ${selectedTable.name}`)}
                  style={{
                    flex: 1,
                    minHeight: '40px',
                    backgroundColor: '#0f766e',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700
                  }}
                >
                  TAKE ORDER
                </button>
                <button
                  onClick={() => showToast(`Table ${selectedTable.name} merged`)}
                  style={{
                    flex: 1,
                    minHeight: '40px',
                    backgroundColor: '#f1f5f9',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  MERGE TABLE
                </button>
              </div>
            )}

            {selectedTable.status === 'Available' && (
              <button
                onClick={() => showToast(`Walk-in guests seated at ${selectedTable.name}`)}
                style={{
                  minHeight: '40px',
                  backgroundColor: '#0284c7',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700
                }}
              >
                SEAT WALK-IN GUESTS
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SCR-WAIT-03: Dish-Ready Notification Drawer */}
      {isAlertDrawerOpen && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxHeight: '80%' }}>
            <div
              style={{
                backgroundColor: '#dc2626',
                color: '#fff',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>📳</span>
                <span style={{ fontSize: '13px', fontWeight: 800 }}>
                  INCOMING DISH ALERTS ({readyDishesList.length})
                </span>
              </div>
              <button
                onClick={() => setIsAlertDrawerOpen(false)}
                style={{ color: '#fff', fontSize: '16px', fontWeight: 700 }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '14px', maxHeight: '350px', overflowY: 'auto' }}>
              {readyDishesList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '13px' }}>
                  No pending dishes ready at kitchen pass.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {readyDishesList.map((alert) => (
                    <div
                      key={`${alert.ticketId}-${alert.item.id}`}
                      style={{
                        backgroundColor: '#fff1f2',
                        border: '1px solid #fecdd3',
                        borderRadius: '10px',
                        padding: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#991b1b' }}>
                          [!] READY AT {alert.item.station.toUpperCase()}
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          Table {alert.tableId}
                        </span>
                      </div>

                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                        {alert.item.quantity}x {alert.item.name}
                      </div>
                      {alert.item.modifier && alert.item.modifier !== 'Default' && (
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Note: {alert.item.modifier}</div>
                      )}

                      <button
                        onClick={() => markItemServed(alert.ticketId, alert.item.id)}
                        style={{
                          marginTop: '10px',
                          width: '100%',
                          minHeight: '40px',
                          backgroundColor: '#16a34a',
                          color: '#fff',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>✓</span>
                        <span>PICKUP & MARK SERVED</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: '10px 14px', borderTop: '1px solid #e2e8f0', textAlign: 'right' }}>
              <button
                onClick={() => setIsAlertDrawerOpen(false)}
                style={{
                  padding: '6px 14px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#475569'
                }}
              >
                Dismiss Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Cleaned Confirmation Modal (PRD Rule 10) */}
      {confirmCleanModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Confirm Table Sanitization
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Has <strong>{selectedTable.name}</strong> been completely bused, sanitized, and reset with clean tableware?
            </p>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmCleanModal(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  backgroundColor: '#f1f5f9',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#475569'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetTableToAvailable(selectedTable.id);
                  setConfirmCleanModal(false);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 700
                }}
              >
                Confirm & Reset (Available)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
