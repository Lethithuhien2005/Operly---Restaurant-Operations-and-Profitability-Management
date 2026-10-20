import React, { useState, useEffect } from 'react';

/**
 * CashierPaymentModal
 * 4-Tab Payment Modal (SCR-POS-01):
 * 1. Cash (quick denomination keys, live change calculator, cash rounding)
 * 2. Card / POS Terminal (PAX terminal simulation, auth reference)
 * 3. VietQR / VNPAY (QR display, simulated webhook polling)
 * 4. e-Wallet (MoMo, ZaloPay, ShopeePay)
 */
export const CashierPaymentModal = ({
  isOpen,
  onClose,
  totalPayable = 0,
  tableName = 'Table 08',
  orderId = 'ORD-1045',
  onConfirmPayment
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('cash'); // 'cash' | 'card' | 'vietqr' | 'wallet'

  // Cash state
  const [cashReceived, setCashReceived] = useState(totalPayable);
  const changeDue = Math.max(0, cashReceived - totalPayable);
  const remainingCash = Math.max(0, totalPayable - cashReceived);

  // Card state
  const [cardType, setCardType] = useState('Visa');
  const [cardAuthCode, setCardAuthCode] = useState(`AUTH-${Math.floor(100000 + Math.random() * 900000)}`);
  const [isCardProcessing, setIsCardProcessing] = useState(false);
  const [isCardApproved, setIsCardApproved] = useState(false);

  // VietQR state
  const [isPollingGateway, setIsPollingGateway] = useState(false);
  const [gatewayVerified, setGatewayVerified] = useState(false);

  // e-Wallet state
  const [walletType, setWalletType] = useState('MoMo');
  const [walletRef, setWalletRef] = useState(`MM-${Math.floor(100000 + Math.random() * 900000)}`);

  // Quick cash buttons
  const cashPresets = [
    { label: 'Exact', amount: totalPayable },
    { label: '+50k', amount: totalPayable + 50000 },
    { label: '+100k', amount: totalPayable + 100000 },
    { label: '+200k', amount: totalPayable + 200000 },
    { label: '+500k', amount: totalPayable + 500000 },
    { label: '500,000 VND', amount: 500000 },
    { label: '1,000,000 VND', amount: 1000000 },
    { label: '2,000,000 VND', amount: 2000000 }
  ];

  const handleSimulateCard = () => {
    setIsCardProcessing(true);
    setTimeout(() => {
      setIsCardProcessing(false);
      setIsCardApproved(true);
    }, 1200);
  };

  const handleSimulateGatewayPush = () => {
    setIsPollingGateway(true);
    setTimeout(() => {
      setIsPollingGateway(false);
      setGatewayVerified(true);
    }, 1000);
  };

  const handleFinalize = () => {
    let method = 'Cash';
    let ref = '';

    if (activeTab === 'cash') {
      method = 'Cash';
      ref = `CASH-REC-${Math.floor(1000 + Math.random() * 9000)}`;
    } else if (activeTab === 'card') {
      method = `Card (${cardType})`;
      ref = cardAuthCode;
    } else if (activeTab === 'vietqr') {
      method = 'VietQR';
      ref = `VNPAY-${orderId}`;
    } else if (activeTab === 'wallet') {
      method = `e-Wallet (${walletType})`;
      ref = walletRef;
    }

    onConfirmPayment({
      method,
      amountPaid: totalPayable,
      cashReceived: activeTab === 'cash' ? cashReceived : totalPayable,
      changeDue: activeTab === 'cash' ? changeDue : 0,
      paymentRef: ref
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            backgroundColor: '#0f766e',
            color: '#ffffff',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <div style={{ fontSize: '16px', fontWeight: 900 }}>
              SELECT PAYMENT METHOD — {tableName}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>
              Order #{orderId} • Total Due:{' '}
              <strong style={{ color: '#a7f3d0' }}>{totalPayable.toLocaleString()} VND</strong>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              color: '#ffffff',
              fontSize: '20px',
              fontWeight: 700,
              padding: '4px 8px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {/* 4 Payment Navigation Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            backgroundColor: '#f1f5f9',
            borderBottom: '1px solid #cbd5e1'
          }}
        >
          {[
            { id: 'cash', label: '💵 Cash', icon: '💵' },
            { id: 'card', label: '💳 Card / POS', icon: '💳' },
            { id: 'vietqr', label: '📱 VietQR / VNPay', icon: '📱' },
            { id: 'wallet', label: '👛 e-Wallet', icon: '👛' }
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '12px 8px',
                  fontSize: '13px',
                  fontWeight: 800,
                  backgroundColor: isSelected ? '#ffffff' : '#f1f5f9',
                  color: isSelected ? '#0f766e' : '#64748b',
                  borderBottom: isSelected ? '3px solid #0f766e' : 'none',
                  borderRight: '1px solid #e2e8f0',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Body per Tab */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: CASH */}
          {activeTab === 'cash' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>
                    NET PAYABLE AMOUNT
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>
                    {totalPayable.toLocaleString()} VND
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>
                    ROUNDING POLICY
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f766e' }}>
                    Rounded to nearest 1,000 VND
                  </div>
                </div>
              </div>

              {/* Cash Received Input */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155' }}>
                  CASH RECEIVED FROM CUSTOMER:
                </label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <input
                    type="number"
                    step="1000"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(Number(e.target.value) || 0)}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      fontSize: '18px',
                      fontWeight: 800,
                      borderRadius: '8px',
                      border: '2px solid #cbd5e1',
                      color: '#0f172a'
                    }}
                  />
                  <span
                    style={{
                      alignSelf: 'center',
                      fontWeight: 800,
                      color: '#64748b',
                      fontSize: '14px'
                    }}
                  >
                    VND
                  </span>
                </div>
              </div>

              {/* Quick Cash Presets */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>
                  QUICK CASH BILL SUGGESTIONS:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {cashPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCashReceived(preset.amount)}
                      style={{
                        padding: '8px 4px',
                        backgroundColor: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#1e293b',
                        cursor: 'pointer'
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Change Calculator */}
              <div
                style={{
                  padding: '14px',
                  borderRadius: '8px',
                  backgroundColor: remainingCash > 0 ? '#fef2f2' : '#f0fdf4',
                  border: remainingCash > 0 ? '1px solid #fca5a5' : '1px solid #86efac',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: remainingCash > 0 ? '#991b1b' : '#166534'
                    }}
                  >
                    {remainingCash > 0 ? '⚠️ INSUFFICIENT CASH RECEIVED:' : '💵 CHANGE DUE TO CUSTOMER:'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    {remainingCash > 0
                      ? 'Please request additional cash from the customer.'
                      : 'Hand over exact change before printing final receipt.'}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '22px',
                    fontWeight: 900,
                    color: remainingCash > 0 ? '#dc2626' : '#15803d'
                  }}
                >
                  {remainingCash > 0
                    ? `-${remainingCash.toLocaleString()} VND`
                    : `${changeDue.toLocaleString()} VND`}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CARD / POS */}
          {activeTab === 'card' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '14px'
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>
                  PAX A920 SMART POS TERMINAL
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981'
                    }}
                  />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f766e' }}>
                    Terminal Online (IP: 192.168.1.120:8080)
                  </span>
                </div>
              </div>

              {/* Card Type Selector */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155' }}>
                  CARD SCHEME:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '6px' }}>
                  {['Visa', 'Mastercard', 'JCB', 'Napas ATM'].map((scheme) => (
                    <button
                      key={scheme}
                      onClick={() => setCardType(scheme)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '6px',
                        border: cardType === scheme ? '2px solid #0f766e' : '1px solid #cbd5e1',
                        backgroundColor: cardType === scheme ? '#f0fdfa' : '#ffffff',
                        fontWeight: 700,
                        fontSize: '12px',
                        color: cardType === scheme ? '#0f766e' : '#334155',
                        cursor: 'pointer'
                      }}
                    >
                      {scheme}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auth Code Field */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155' }}>
                  TRANSACTION AUTH / TRACE CODE:
                </label>
                <input
                  type="text"
                  value={cardAuthCode}
                  onChange={(e) => setCardAuthCode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    marginTop: '4px'
                  }}
                />
              </div>

              {/* Terminal Simulator Button */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  backgroundColor: isCardApproved ? '#f0fdf4' : '#f8fafc',
                  border: isCardApproved ? '1px solid #86efac' : '1px solid #e2e8f0',
                  textAlign: 'center'
                }}
              >
                {!isCardApproved ? (
                  <div>
                    <div style={{ fontSize: '13px', color: '#475569', marginBottom: '8px' }}>
                      Ready for customer to tap contactless card or insert EMV chip.
                    </div>
                    <button
                      onClick={handleSimulateCard}
                      disabled={isCardProcessing}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        borderRadius: '8px',
                        fontWeight: 800,
                        fontSize: '13px',
                        cursor: isCardProcessing ? 'wait' : 'pointer'
                      }}
                    >
                      {isCardProcessing ? '⏳ Communicating with Bank Terminal...' : '💳 Simulate Card Tap / Chip'}
                    </button>
                  </div>
                ) : (
                  <div style={{ color: '#166534' }}>
                    <div style={{ fontSize: '24px' }}>✓</div>
                    <div style={{ fontWeight: 800, fontSize: '14px' }}>
                      CARD AUTHORIZATION APPROVED!
                    </div>
                    <div style={{ fontSize: '12px', color: '#15803d' }}>
                      Amount Charged: {totalPayable.toLocaleString()} VND (Ref: {cardAuthCode})
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: VIETQR / VNPAY */}
          {activeTab === 'vietqr' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
              <div
                style={{
                  width: '280px',
                  border: '2px solid #0f766e',
                  borderRadius: '12px',
                  padding: '16px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 12px rgba(15,118,110,0.15)',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 900, color: '#0f766e' }}>
                  VIETQR / NAPAS 247
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                  RESTAURANT OPERLY DA NANG
                </div>

                {/* QR Visual */}
                <div
                  style={{
                    margin: '12px auto',
                    width: '180px',
                    height: '180px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  <div style={{ fontSize: '48px' }}>🏁</div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#475569', marginTop: '6px' }}>
                    [DYNAMIC QR CODE]
                  </div>
                  <div style={{ fontSize: '9px', color: '#94a3b8' }}>
                    Account: 0011002345678 (VCB)
                  </div>
                </div>

                <div style={{ fontSize: '15px', fontWeight: 900, color: '#0f766e' }}>
                  {totalPayable.toLocaleString()} VND
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                  Memo: <strong>{orderId} {tableName}</strong>
                </div>
              </div>

              {/* Polling / Webhook Simulation */}
              <div style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}>
                {!gatewayVerified ? (
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                      {isPollingGateway
                        ? '⏳ Querying NAPAS / Bank Open Banking Gateway...'
                        : 'Awaiting customer mobile banking transfer webhook...'}
                    </div>
                    <button
                      onClick={handleSimulateGatewayPush}
                      disabled={isPollingGateway}
                      style={{
                        padding: '10px 18px',
                        backgroundColor: '#0f766e',
                        color: '#ffffff',
                        borderRadius: '8px',
                        fontWeight: 800,
                        fontSize: '12px',
                        cursor: isPollingGateway ? 'wait' : 'pointer',
                        width: '100%'
                      }}
                    >
                      {isPollingGateway
                        ? 'Verifying Bank Webhook...'
                        : '⚡ Simulate Customer Bank App Push (Verify Webhook)'}
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #86efac',
                      color: '#166534'
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '13px' }}>
                      ✓ BANK TRANSFER RECEIVED & VERIFIED!
                    </div>
                    <div style={{ fontSize: '11px', marginTop: '2px' }}>
                      Reference: VNPAY-{orderId} • Bank: Vietcombank
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: E-WALLET */}
          {activeTab === 'wallet' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155' }}>
                  SELECT E-WALLET PROVIDER:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '6px' }}>
                  {[
                    { id: 'MoMo', name: 'MoMo Wallet', color: '#d82d8b' },
                    { id: 'ZaloPay', name: 'ZaloPay', color: '#0068ff' },
                    { id: 'ShopeePay', name: 'ShopeePay', color: '#ee4d2d' }
                  ].map((w) => (
                    <button
                      key={w.id}
                      onClick={() => {
                        setWalletType(w.id);
                        setWalletRef(`${w.id.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`);
                      }}
                      style={{
                        padding: '12px 8px',
                        borderRadius: '8px',
                        border: walletType === w.id ? `2px solid ${w.color}` : '1px solid #cbd5e1',
                        backgroundColor: walletType === w.id ? '#faf5ff' : '#ffffff',
                        fontWeight: 800,
                        fontSize: '12px',
                        color: walletType === w.id ? w.color : '#334155',
                        cursor: 'pointer'
                      }}
                    >
                      {w.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155' }}>
                  SCANNER / TRANSACTION REFERENCE:
                </label>
                <input
                  type="text"
                  value={walletRef}
                  onChange={(e) => setWalletRef(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    marginTop: '4px'
                  }}
                />
              </div>

              <div
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
                  border: '1px dashed #94a3b8',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>📱</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                  Scan customer wallet barcode with USB scanner or POS camera.
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                  Ready to charge {totalPayable.toLocaleString()} VND via {walletType}.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleFinalize}
            disabled={activeTab === 'cash' && remainingCash > 0}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              backgroundColor: activeTab === 'cash' && remainingCash > 0 ? '#cbd5e1' : '#0f766e',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '13px',
              cursor: activeTab === 'cash' && remainingCash > 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeTab === 'cash' && remainingCash > 0 ? 'none' : '0 2px 8px rgba(15,118,110,0.3)'
            }}
          >
            ✓ CONFIRM SETTLEMENT & PRINT RECEIPT
          </button>
        </div>
      </div>
    </div>
  );
};
