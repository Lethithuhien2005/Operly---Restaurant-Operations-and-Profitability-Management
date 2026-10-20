import React, { useState } from 'react';

/**
 * CashierReceiptModal
 * Thermal POS 80mm Receipt Preview (SCR-POS-01).
 * Accurately simulates Vietnamese restaurant fiscal receipts with tax ID,
 * member discounts, payment references, and thermal printing feedback.
 */
export const CashierReceiptModal = ({
  isOpen,
  onClose,
  invoiceData,
  onPrintThermal
}) => {
  if (!isOpen || !invoiceData) return null;

  const [isPrinting, setIsPrinting] = useState(false);
  const [printSuccess, setPrintSuccess] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const {
    invoiceId = 'INV-20260920-101',
    orderId = 'ORD-1045',
    tableName = 'Table 08',
    area = 'Main Hall',
    cashierName = 'Mai Le',
    items = [],
    subtotal = 0,
    discountAmount = 0,
    discountDetail = 'None',
    finalTotal = 0,
    paymentMethod = 'VietQR',
    paymentRef = 'VNPAY-883492',
    cashReceived = 0,
    changeDue = 0,
    member = null
  } = invoiceData;

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
      setPrintSuccess(true);
      if (onPrintThermal) onPrintThermal();
    }, 1000);
  };

  const handleEmailInvoice = () => {
    setIsEmailSent(true);
    setTimeout(() => {
      setIsEmailSent(false);
    }, 3000);
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 1400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0f172a',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
        }}
      >
        {/* Top bar */}
        <div
          style={{
            padding: '12px 18px',
            backgroundColor: '#1e293b',
            color: '#f8fafc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '13px',
            fontWeight: 700
          }}
        >
          <span>🧾 POS RECEIPT PREVIEW</span>
          <button
            onClick={onClose}
            style={{ color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Receipt Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', backgroundColor: '#334155' }}>
          <div className="pos-thermal-receipt">
            {/* Store Header */}
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '0.04em' }}>
                OPERLY RESTAURANT & BAR
              </div>
              <div style={{ fontSize: '11px', color: '#475569' }}>Da Nang Central Branch</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>
                128 Bach Dang, Hai Chau, Da Nang
              </div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>
                Tax ID: 0401988221 • Tel: (0236) 3888-999
              </div>
            </div>

            <div className="pos-receipt-divider" />

            {/* Bill Info */}
            <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Invoice: <strong>{invoiceId}</strong></span>
                <span>Date: {dateStr} {timeStr}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Table: <strong>{tableName} ({area})</strong></span>
                <span>Order: #{orderId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Cashier: <strong>{cashierName}</strong></span>
                <span>Terminal: POS-01</span>
              </div>
              {member && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0f766e', fontWeight: 700 }}>
                  <span>Customer: {member.name}</span>
                  <span>{member.tier} Tier</span>
                </div>
              )}
            </div>

            <div className="pos-receipt-divider" />

            {/* Line Items */}
            <div style={{ fontSize: '11px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '24px 1fr 65px 75px',
                  fontWeight: 800,
                  borderBottom: '1px solid #cbd5e1',
                  paddingBottom: '4px',
                  marginBottom: '6px'
                }}
              >
                <span>Q</span>
                <span>Item</span>
                <span style={{ textAlign: 'right' }}>Price</span>
                <span style={{ textAlign: 'right' }}>Amount</span>
              </div>

              {items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '24px 1fr 65px 75px',
                    marginBottom: '4px',
                    fontSize: '11px'
                  }}
                >
                  <span style={{ fontWeight: 700 }}>{item.quantity}</span>
                  <div>
                    <div>{item.name}</div>
                    {item.modifier && item.modifier !== 'Default' && (
                      <div style={{ fontSize: '9px', color: '#64748b' }}>({item.modifier})</div>
                    )}
                  </div>
                  <span style={{ textAlign: 'right', color: '#64748b' }}>
                    {(item.price / 1000).toLocaleString()}k
                  </span>
                  <span style={{ textAlign: 'right', fontWeight: 700 }}>
                    {((item.price * item.quantity) / 1000).toLocaleString()}k
                  </span>
                </div>
              ))}
            </div>

            <div className="pos-receipt-double-divider" />

            {/* Totals */}
            <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span>
                <span>{subtotal.toLocaleString()} VND</span>
              </div>

              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0f766e' }}>
                  <span>Discount ({discountDetail}):</span>
                  <span>-{discountAmount.toLocaleString()} VND</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '10px' }}>
                <span>VAT (8% included):</span>
                <span>Included</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 900,
                  fontSize: '14px',
                  borderTop: '1px solid #1e293b',
                  paddingTop: '6px',
                  marginTop: '4px'
                }}
              >
                <span>TOTAL:</span>
                <span>{finalTotal.toLocaleString()} VND</span>
              </div>
            </div>

            <div className="pos-receipt-divider" />

            {/* Payment Details */}
            <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Payment Method:</span>
                <strong>{paymentMethod}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Ref Code:</span>
                <span style={{ fontFamily: 'monospace' }}>{paymentRef}</span>
              </div>
              {paymentMethod.toLowerCase().includes('cash') && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Cash Tendered:</span>
                    <span>{cashReceived.toLocaleString()} VND</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                    <span>Change Due:</span>
                    <span>{changeDue.toLocaleString()} VND</span>
                  </div>
                </>
              )}
            </div>

            <div className="pos-receipt-divider" />

            {/* Footer QR & Note */}
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <div style={{ fontSize: '32px' }}>🏁</div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                Scan to lookup electronic e-Invoice
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, marginTop: '8px' }}>
                Thank you for dining with us!
              </div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Wifi: Operly_Guest (Pass: 88888888)</div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div
          style={{
            padding: '14px 18px',
            backgroundColor: '#1e293b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              style={{
                padding: '8px 14px',
                backgroundColor: printSuccess ? '#166534' : '#0f766e',
                color: '#ffffff',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              {isPrinting ? '⏳ Printing...' : printSuccess ? '✓ Printed' : '🖨️ Thermal Print'}
            </button>

            <button
              onClick={handleEmailInvoice}
              style={{
                padding: '8px 12px',
                backgroundColor: isEmailSent ? '#0284c7' : '#334155',
                color: '#f8fafc',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {isEmailSent ? '✓ Sent SMS/Email' : '📧 e-Invoice'}
            </button>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            ✓ Done & Next Table
          </button>
        </div>
      </div>
    </div>
  );
};
