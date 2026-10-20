import React, { useState, useMemo } from 'react';

/**
 * CashierBillQueue
 * Left column of POS terminal (SCR-POS-01).
 * Displays area filters (Main Hall, VIP, Takeaway), search filter,
 * and cards for all tables awaiting bill settlement.
 */
export const CashierBillQueue = ({
  tables = [],
  selectedTableId,
  onSelectTable,
  getTableInvoiceItems
}) => {
  const [activeArea, setActiveArea] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Tables requiring settlement: status === 'Occupied', checkoutQueue, or billRequested
  const settlementTables = useMemo(() => {
    return tables.filter(
      (t) => t.status === 'Occupied' || t.checkoutQueue || t.billRequested
    );
  }, [tables]);

  // Filtered by Area and Search
  const filteredTables = useMemo(() => {
    return settlementTables.filter((tbl) => {
      const tblArea = tbl.area || 'Main Hall';
      const matchesArea = activeArea === 'All' || tblArea.toLowerCase() === activeArea.toLowerCase();
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        tbl.name.toLowerCase().includes(q) ||
        (tbl.orderId && tbl.orderId.toLowerCase().includes(q)) ||
        (tbl.note && tbl.note.toLowerCase().includes(q));
      return matchesArea && matchesQuery;
    });
  }, [settlementTables, activeArea, searchQuery]);

  const areas = ['All', 'Main Hall', 'VIP', 'Takeaway'];

  return (
    <div className="pos-queue-pane">
      {/* Pane Header */}
      <div
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#ffffff'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.02em' }}>
            BILLING QUEUE
          </span>
          <span
            style={{
              backgroundColor: '#0f766e',
              color: '#ffffff',
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '12px',
              fontWeight: 800
            }}
          >
            {settlementTables.length} Active
          </span>
        </div>

        {/* Search input */}
        <div style={{ marginTop: '8px' }}>
          <input
            type="text"
            placeholder="Search table or order #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '12px',
              backgroundColor: '#f8fafc',
              outline: 'none'
            }}
          />
        </div>

        {/* Area Filter Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginTop: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
          {areas.map((area) => {
            const isSelected = activeArea === area;
            return (
              <button
                key={area}
                onClick={() => setActiveArea(area)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  backgroundColor: isSelected ? '#0f766e' : '#f1f5f9',
                  color: isSelected ? '#ffffff' : '#64748b',
                  border: isSelected ? '1px solid #0f766e' : '1px solid #e2e8f0'
                }}
              >
                {area}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tables List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        {filteredTables.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '30px 16px',
              color: '#94a3b8',
              fontSize: '12px'
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🧾</div>
            <div style={{ fontWeight: 700, color: '#475569' }}>No Pending Bills</div>
            <div>No tables match the current filter or queue is empty.</div>
          </div>
        ) : (
          filteredTables.map((tbl) => {
            const isSelected = tbl.id === selectedTableId;
            const items = getTableInvoiceItems ? getTableInvoiceItems(tbl.id) : [];
            const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
            const hasCooking = items.some((i) => i.status === 'Cooking' || i.status === 'Pending');

            return (
              <div
                key={tbl.id}
                onClick={() => onSelectTable(tbl.id)}
                className={`pos-queue-card ${isSelected ? 'selected' : ''} ${hasCooking ? 'blocked' : ''}`}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: isSelected ? '#f0fdfa' : '#ffffff',
                  border: isSelected
                    ? hasCooking
                      ? '2px solid #ef4444'
                      : '2px solid #0f766e'
                    : '1px solid #e2e8f0',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                {/* Header row: Table name & Area */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>
                      {tbl.name}
                    </span>
                    <span
                      style={{
                        fontSize: '9px',
                        padding: '1px 5px',
                        borderRadius: '3px',
                        fontWeight: 700,
                        backgroundColor: '#e0f2fe',
                        color: '#0369a1'
                      }}
                    >
                      {tbl.area || 'Main Hall'}
                    </span>
                  </div>

                  {/* Bill requested pulse badge */}
                  {tbl.billRequested && (
                    <span
                      style={{
                        backgroundColor: '#fef3c7',
                        color: '#b45309',
                        fontSize: '9px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#f59e0b',
                          display: 'inline-block'
                        }}
                      />
                      REQUESTED
                    </span>
                  )}
                </div>

                {/* Sub row: Order ID & note */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '4px',
                    fontSize: '11px',
                    color: '#64748b'
                  }}
                >
                  <span>{tbl.orderId || 'Dine-In Session'}</span>
                  <span>{items.length} item{items.length > 1 ? 's' : ''}</span>
                </div>

                {/* Bottom row: Subtotal & cooking/served badge */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '6px',
                    paddingTop: '6px',
                    borderTop: '1px solid #f1f5f9'
                  }}
                >
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 800,
                      color: hasCooking ? '#b91c1c' : '#0f766e'
                    }}
                  >
                    {subtotal.toLocaleString()} VND
                  </span>

                  <span
                    style={{
                      fontSize: '9px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 700,
                      backgroundColor: hasCooking ? '#fee2e2' : '#dcfce7',
                      color: hasCooking ? '#991b1b' : '#166534'
                    }}
                  >
                    {hasCooking ? '⏳ COOKING' : '✓ ALL SERVED'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
