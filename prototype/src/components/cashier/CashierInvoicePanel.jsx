import React from 'react';

/**
 * CashierInvoicePanel
 * Middle column of POS terminal (SCR-POS-01).
 * Displays line item breakdown of the active table invoice,
 * preparation status badges, policy blocker banners (PRD Rule 6),
 * and triggers for Void Dish approval requests.
 */
export const CashierInvoicePanel = ({
  selectedTable,
  invoiceItems = [],
  onRequestVoidDish,
  onRequestDiscountOverride
}) => {
  if (!selectedTable) {
    return (
      <div
        className="pos-invoice-pane"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#94a3b8',
          padding: '40px'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>📋</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#475569' }}>
            No Table Selected
          </div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>
            Please select a table from the Billing Queue on the left.
          </div>
        </div>
      </div>
    );
  }

  const subtotal = invoiceItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cookingItems = invoiceItems.filter(
    (item) => item.status === 'Cooking' || item.status === 'Pending'
  );
  const hasUnservedCooking = cookingItems.length > 0;

  return (
    <div className="pos-invoice-pane">
      {/* Invoice Header */}
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>
              {selectedTable.name}
            </span>
            <span
              style={{
                backgroundColor: '#e0f2fe',
                color: '#0369a1',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700
              }}
            >
              {selectedTable.area || 'Main Hall'}
            </span>
            <span
              style={{
                backgroundColor: '#f1f5f9',
                color: '#475569',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600
              }}
            >
              Order #{selectedTable.orderId || 'ORD-1045'}
            </span>
          </div>

          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
            Table Seats: {selectedTable.seats || 4} • Status: <strong>{selectedTable.status}</strong>
            {selectedTable.note && ` • ${selectedTable.note}`}
          </div>
        </div>

        {/* Manager Override Shortcut */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() =>
              onRequestDiscountOverride &&
              onRequestDiscountOverride({
                table: selectedTable.name,
                orderId: selectedTable.orderId,
                subtotal
              })
            }
            style={{
              padding: '6px 10px',
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              color: '#b45309',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Request Manager Discount Override beyond 40% cap"
          >
            🏷️ Request Discount Override
          </button>
        </div>
      </div>

      {/* Cooking / Unserved Blocker Warning (PRD Rule 6 & EF-3.1) */}
      {hasUnservedCooking && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            borderBottom: '1px solid #fecaca',
            padding: '10px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <span style={{ fontSize: '18px' }}>⚠️</span>
          <div style={{ fontSize: '12px', color: '#991b1b', lineHeight: 1.4 }}>
            <strong>SETTLEMENT BLOCKED (PRD Rule 6):</strong> There are{' '}
            <strong>{cookingItems.length} dish(es)</strong> currently in preparation (Cooking/Pending).
            Settlement is disabled until all items are served by kitchen/waiter or authorized for Void by
            Manager.
          </div>
        </div>
      )}

      {/* Itemized Table Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 80px 100px 110px 80px',
          padding: '8px 18px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          fontSize: '11px',
          fontWeight: 800,
          color: '#64748b',
          letterSpacing: '0.04em'
        }}
      >
        <span>ITEM & MODIFIER</span>
        <span style={{ textAlign: 'center' }}>QTY</span>
        <span style={{ textAlign: 'right' }}>UNIT PRICE</span>
        <span style={{ textAlign: 'right' }}>TOTAL</span>
        <span style={{ textAlign: 'center' }}>ACTION</span>
      </div>

      {/* Line Items List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {invoiceItems.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
            No line items recorded for this order session.
          </div>
        ) : (
          invoiceItems.map((item, idx) => {
            const isCooking = item.status === 'Cooking' || item.status === 'Pending';
            const isReady = item.status === 'Ready';
            const isServed = item.status === 'Served';

            return (
              <div
                key={item.id || idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 80px 100px 110px 80px',
                  alignItems: 'center',
                  padding: '12px 18px',
                  borderBottom: '1px solid #f1f5f9',
                  backgroundColor: isCooking ? '#fffbf5' : '#ffffff',
                  fontSize: '13px'
                }}
              >
                {/* Dish Info */}
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                    {item.modifier && item.modifier !== 'Default' && (
                      <span
                        style={{
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          fontSize: '10px',
                          padding: '1px 6px',
                          borderRadius: '3px'
                        }}
                      >
                        {item.modifier}
                      </span>
                    )}

                    {/* Status Badge */}
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '3px',
                        backgroundColor: isServed
                          ? '#dcfce7'
                          : isReady
                          ? '#ccfbf1'
                          : isCooking
                          ? '#ffedd5'
                          : '#f1f5f9',
                        color: isServed
                          ? '#166534'
                          : isReady
                          ? '#0f766e'
                          : isCooking
                          ? '#9a3412'
                          : '#475569'
                      }}
                    >
                      {item.status || 'Served'}
                    </span>
                  </div>
                </div>

                {/* Quantity */}
                <div style={{ textAlign: 'center', fontWeight: 800, color: '#0f172a' }}>
                  {item.quantity}
                </div>

                {/* Unit Price */}
                <div style={{ textAlign: 'right', color: '#64748b' }}>
                  {item.price.toLocaleString()}
                </div>

                {/* Line Total */}
                <div style={{ textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                  {(item.price * item.quantity).toLocaleString()} VND
                </div>

                {/* Void Action */}
                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={() =>
                      onRequestVoidDish &&
                      onRequestVoidDish({
                        item,
                        table: selectedTable.name,
                        orderId: selectedTable.orderId
                      })
                    }
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 700,
                      backgroundColor: '#fee2e2',
                      color: '#991b1b',
                      border: '1px solid #fca5a5',
                      cursor: 'pointer'
                    }}
                    title="Send Void Dish escalation to Manager"
                  >
                    Void
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Subtotal Summary Footer */}
      <div
        style={{
          padding: '12px 18px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ fontSize: '12px', color: '#64748b' }}>
          Total Line Items: <strong>{invoiceItems.length}</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>Invoice Subtotal:</span>
          <span style={{ fontSize: '17px', fontWeight: 900, color: '#0f172a' }}>
            {subtotal.toLocaleString()} VND
          </span>
        </div>
      </div>
    </div>
  );
};
