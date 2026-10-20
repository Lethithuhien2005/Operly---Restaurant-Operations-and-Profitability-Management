import React, { useState } from 'react';

/**
 * CashierHistoryDrawer
 * Slide-over drawer displaying past settled invoices during the current shift.
 * Allows cashier to review settled transactions, filter by payment method,
 * and re-open/print past thermal receipts.
 */
export const CashierHistoryDrawer = ({
  isOpen,
  onClose,
  history = [],
  onSelectReceipt
}) => {
  if (!isOpen) return null;

  const [filterMethod, setFilterMethod] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const methods = ['All', 'VietQR', 'Card', 'Cash', 'Wallet'];

  const filteredHistory = history.filter((inv) => {
    const matchesMethod =
      filterMethod === 'All' || inv.paymentMethod.toLowerCase().includes(filterMethod.toLowerCase());
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      inv.invoiceId.toLowerCase().includes(q) ||
      inv.tableName.toLowerCase().includes(q) ||
      inv.orderId.toLowerCase().includes(q);
    return matchesMethod && matchesSearch;
  });

  const totalSettledAmount = filteredHistory.reduce((acc, item) => acc + (item.finalTotal || 0), 0);

  return (
    <div className="manager-drawer-backdrop" onClick={onClose}>
      <div
        className="manager-drawer-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '580px' }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#0f766e',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <div style={{ fontSize: '16px', fontWeight: 900 }}>
              📜 SHIFT SETTLED BILLS HISTORY
            </div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>
              Audited POS Transactions • Evening Shift (Mai Le)
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ color: '#ffffff', fontSize: '20px', fontWeight: 700, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Filter bar */}
        <div
          style={{
            padding: '12px 20px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <input
            type="text"
            placeholder="Search invoice #, table, or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '12px'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {methods.map((m) => (
                <button
                  key={m}
                  onClick={() => setFilterMethod(m)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: filterMethod === m ? '#0f766e' : '#e2e8f0',
                    color: filterMethod === m ? '#ffffff' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  {m}
                </button>
              ))}
            </div>

            <div style={{ fontSize: '11px', color: '#64748b' }}>
              Settled: <strong>{filteredHistory.length}</strong> ({totalSettledAmount.toLocaleString()} VND)
            </div>
          </div>
        </div>

        {/* History List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              No settled invoices matching the current filter.
            </div>
          ) : (
            filteredHistory.map((inv) => (
              <div
                key={inv.invoiceId}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>
                      {inv.tableName}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        backgroundColor: '#f1f5f9',
                        padding: '1px 6px',
                        borderRadius: '3px'
                      }}
                    >
                      {inv.invoiceId}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        backgroundColor: '#ccfbf1',
                        color: '#0f766e',
                        padding: '1px 6px',
                        borderRadius: '3px'
                      }}
                    >
                      {inv.paymentMethod}
                    </span>
                  </div>

                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                    Order: #{inv.orderId} • Settled at: {inv.settledAt} • Ref: {inv.paymentRef || 'N/A'}
                  </div>
                  {inv.discountAmount > 0 && (
                    <div style={{ fontSize: '11px', color: '#0f766e', marginTop: '2px' }}>
                      Discount: -{inv.discountAmount.toLocaleString()} VND ({inv.discountDetail})
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '15px', fontWeight: 900, color: '#0f766e' }}>
                    {inv.finalTotal.toLocaleString()} VND
                  </div>
                  <button
                    onClick={() => onSelectReceipt && onSelectReceipt(inv)}
                    style={{
                      marginTop: '6px',
                      padding: '4px 8px',
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#0f766e',
                      cursor: 'pointer'
                    }}
                  >
                    View Receipt
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
