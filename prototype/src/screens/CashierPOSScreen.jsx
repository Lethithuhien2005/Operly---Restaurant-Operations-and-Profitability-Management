import React, { useState } from 'react';
import { useMockStore } from '../store/mockStore';
import { MOCK_MEMBERS, MOCK_COUPONS } from '../mock/data';

export const CashierPOSScreen = () => {
  const {
    tables,
    setTables,
    kdsTickets,
    menuItems,
    recordSettlement,
    showToast
  } = useMockStore();

  const [selectedTableId, setSelectedTableId] = useState('T08');
  const [phoneNumber, setPhoneNumber] = useState('0912345678');
  const [memberProfile, setMemberProfile] = useState(MOCK_MEMBERS['0912345678']);
  const [couponCode, setCouponCode] = useState('HAPPYHOUR');
  const [appliedCoupon, setAppliedCoupon] = useState(MOCK_COUPONS['HAPPYHOUR']);
  const [isVietQRModalOpen, setIsVietQRModalOpen] = useState(false);
  const [shiftTotalSales, setShiftTotalSales] = useState(18450000);
  const [isPollingGateway, setIsPollingGateway] = useState(false);
  const [gatewayVerified, setGatewayVerified] = useState(false);

  // Dynamically derive tables requiring settlement (Occupied, Bill Requested, or Checkout Queue)
  const settlementTables = tables.filter(
    (t) => t.status === 'Occupied' || t.checkoutQueue || t.billRequested
  );

  const activeTableId = settlementTables.some((t) => t.id === selectedTableId)
    ? selectedTableId
    : settlementTables[0]?.id || selectedTableId;

  const selectedTable = tables.find((t) => t.id === activeTableId) || tables[0];

  // Dynamic invoice derivation from live kdsTickets and menuItems (Task D)
  const getTableInvoiceItems = (tableId) => {
    const ticketsForTable = kdsTickets.filter((t) => t.tableId === tableId);
    if (ticketsForTable.length > 0) {
      const dynamicItems = ticketsForTable
        .flatMap((t) => t.items)
        .map((item) => {
          const menuItem = menuItems.find((m) => m.id === item.dishId);
          const price = menuItem ? menuItem.price : 100000;
          return {
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price,
            status: item.status,
            modifier: item.modifier
          };
        });
      if (dynamicItems.length > 0) return dynamicItems;
    }

    // Baseline fallback for demo tables without dynamic tickets
    if (tableId === 'T08') {
      return [
        { name: 'Fresh Atlantic Salmon Fillet', quantity: 1, price: 220000, status: 'Served' },
        { name: 'Spring Rolls Platter', quantity: 1, price: 130000, status: 'Served' }
      ];
    }
    if (tableId === 'T03') {
      return [
        { name: 'Grilled Ribeye Steak', quantity: 2, price: 250000, status: 'Cooking' },
        { name: 'Seafood Spicy Hotpot', quantity: 1, price: 280000, status: 'Cooking' },
        { name: 'Iced Herbal Tea', quantity: 2, price: 20000, status: 'Served' }
      ];
    }

    return [
      { name: 'Dine-In Menu Order', quantity: 1, price: selectedTable.billAmount || 150000, status: 'Served' }
    ];
  };

  const invoiceItems = getTableInvoiceItems(activeTableId);
  const subtotal = invoiceItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Discount calculations enforcing PRD Rule 7 (max 40% cumulative discount)
  const memberDiscountPct = memberProfile ? memberProfile.tierDiscountPct : 0;
  const couponDiscountPct = appliedCoupon ? appliedCoupon.discountPct : 0;
  const rawTotalDiscountPct = memberDiscountPct + couponDiscountPct;
  const effectiveDiscountPct = Math.min(rawTotalDiscountPct, 40); // 40% ceiling
  const isCapped = rawTotalDiscountPct > 40;

  const memberDiscountAmount = (subtotal * memberDiscountPct) / 100;
  const couponDiscountAmount = (subtotal * couponDiscountPct) / 100;
  const totalDiscountAmount = (subtotal * effectiveDiscountPct) / 100;
  const totalPayable = subtotal - totalDiscountAmount;

  // Payment Gate Check (PRD Rule 6 & EF-3.1): No line items can be in 'Cooking' or 'Pending'
  const hasUnservedCooking = invoiceItems.some((item) => item.status === 'Cooking' || item.status === 'Pending');

  const handleVerifyMember = () => {
    const member = MOCK_MEMBERS[phoneNumber.trim()];
    if (member) {
      setMemberProfile(member);
      showToast(`Member verified: ${member.name} (${member.tier} Tier - ${member.tierDiscountPct}%)`);
    } else {
      setMemberProfile(null);
      showToast('No member account found with this phone number.');
    }
  };

  const handleApplyCoupon = () => {
    const coupon = MOCK_COUPONS[couponCode.trim().toUpperCase()];
    if (coupon) {
      setAppliedCoupon(coupon);
      showToast(`Coupon applied: ${coupon.description}`);
    } else {
      setAppliedCoupon(null);
      showToast('Invalid coupon code.');
    }
  };

  const handleCashPayment = () => {
    if (hasUnservedCooking) return;
    // Cash Rounding to nearest 1,000 VND (PRD FR-008)
    const roundedCash = Math.round(totalPayable / 1000) * 1000;
    
    // Complete settlement
    finalizeSettlement(roundedCash, 'Cash');
  };

  const handleManualGatewayCheck = () => {
    setIsPollingGateway(true);
    setTimeout(() => {
      setIsPollingGateway(false);
      setGatewayVerified(true);
      showToast(`Manual API Gateway poll: Bank transfer reference ${selectedTable.orderId || 'ORD1048'} verified successfully!`);
    }, 1200);
  };

  const finalizeSettlement = (amountPaid, method) => {
    setShiftTotalSales((prev) => prev + amountPaid);
    setIsVietQRModalOpen(false);
    setGatewayVerified(false);

    // Record settlement in shared store for Manager metrics & Admin audit trail (Tasks F & G)
    recordSettlement(amountPaid, selectedTable.name, method);

    // Update table status to 'Cleaning' (yellow) per PRD lifecycle
    setTables((prev) =>
      prev.map((t) =>
        t.id === activeTableId
          ? {
              ...t,
              status: 'Cleaning',
              billAmount: null,
              billRequested: false,
              checkoutQueue: false,
              note: 'Settled (Needs busing)'
            }
          : t
      )
    );

    showToast(`Invoice for ${selectedTable.name} settled via ${method}! Table shifted to Cleaning.`);
  };

  return (
    <div className="device-desktop" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Header matching SCR-POS-01 */}
      <div
        style={{
          backgroundColor: '#0f766e',
          color: '#fff',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '18px', fontWeight: 800 }}>OPERLY POS TERMINAL</span>
          <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
            Cashier: Mai Le
          </span>
          <span style={{ fontSize: '12px', opacity: 0.85 }}>Shift: Evening</span>
        </div>

        <div style={{ fontSize: '14px', fontWeight: 800 }}>
          Total Shift Sales: <span style={{ color: '#a7f3d0' }}>{shiftTotalSales.toLocaleString()} VND</span>
        </div>
      </div>

      {/* Main Billing Desk Columns */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Column: Tables Awaiting Settlement */}
        <div
          style={{
            width: '320px',
            backgroundColor: '#f8fafc',
            borderRight: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
            TABLES AWAITING SETTLEMENT ({settlementTables.length})
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {settlementTables.map((tbl) => {
              const isSelected = tbl.id === activeTableId;
              const tableItems = getTableInvoiceItems(tbl.id);
              const tblSubtotal = tableItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
              const tblHasCooking = tableItems.some((i) => i.status === 'Cooking' || i.status === 'Pending');

              return (
                <div
                  key={tbl.id}
                  onClick={() => setSelectedTableId(tbl.id)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? '#ffffff' : '#f1f5f9',
                    border: isSelected
                      ? tblHasCooking
                        ? '2px solid #ef4444'
                        : '2px solid #0f766e'
                      : tbl.billRequested
                      ? '2px solid #f59e0b'
                      : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>{tbl.name}</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {tbl.billRequested && (
                        <span
                          style={{
                            backgroundColor: '#fef3c7',
                            color: '#b45309',
                            fontSize: '9px',
                            padding: '2px 5px',
                            borderRadius: '4px',
                            fontWeight: 800
                          }}
                        >
                          BILL REQUESTED
                        </span>
                      )}
                      <span
                        style={{
                          backgroundColor: tblHasCooking ? '#ffedd5' : '#dcfce7',
                          color: tblHasCooking ? '#9a3412' : '#166534',
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 700
                        }}
                      >
                        {tblHasCooking ? 'COOKING (BLOCKED)' : 'ALL SERVED'}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    {tbl.note || (tbl.orderId ? `Order #${tbl.orderId}` : 'Active Session')}
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 800,
                      color: tblHasCooking ? '#ef4444' : '#0f766e',
                      marginTop: '6px'
                    }}
                  >
                    Subtotal: {tblSubtotal.toLocaleString()} VND
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Invoice & Settlement Desk */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', overflowY: 'auto' }}>
          {/* Invoice Header */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                ACTIVE INVOICE: {selectedTable.name} (ORDER #{selectedTable.orderId || 'ORD-1045'})
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Status: {selectedTable.status}</div>
            </div>

            {hasUnservedCooking && (
              <div
                style={{
                  backgroundColor: '#fee2e2',
                  border: '1px solid #f87171',
                  color: '#991b1b',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}
              >
                <span>⚠️ Cannot settle bill: Items are still cooking (PRD Rule 6)</span>
                <span style={{ fontSize: '11px', fontWeight: 500, opacity: 0.9 }}>
                  Resolution: Wait for kitchen staff to mark served or obtain Manager authorization to void.
                </span>
              </div>
            )}
          </div>

          <div style={{ padding: '20px', flex: 1, display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
            {/* Left Box: Items Summary */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', backgroundColor: '#fcfcfc' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '12px' }}>
                ITEMS SUMMARY ({invoiceItems.length} ITEMS)
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {invoiceItems.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '13px',
                      borderBottom: '1px dashed #e2e8f0',
                      paddingBottom: '8px'
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600 }}>
                        • {item.quantity}x {item.name}
                      </span>
                      <span
                        style={{
                          marginLeft: '8px',
                          fontSize: '10px',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          backgroundColor: item.status === 'Served' ? '#dcfce7' : '#ffedd5',
                          color: item.status === 'Served' ? '#166534' : '#9a3412',
                          fontWeight: 700
                        }}
                      >
                        {item.status}
                      </span>
                    </div>
                    <span style={{ fontWeight: 700 }}>{(item.price * item.quantity).toLocaleString()} VND</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Box: Member Lookup, Coupons, Discount Calculation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Member Lookup Form */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', backgroundColor: '#f8fafc' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Customer Loyalty Lookup (FR-011)
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Phone number..."
                    style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                  <button
                    onClick={handleVerifyMember}
                    style={{
                      backgroundColor: '#0f766e',
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700
                    }}
                  >
                    Verify
                  </button>
                </div>

                {memberProfile && (
                  <div style={{ marginTop: '8px', fontSize: '11px', color: '#166534', fontWeight: 600 }}>
                    ✓ Profile: {memberProfile.name} ({memberProfile.tier} Tier - {memberProfile.tierDiscountPct}% Off)
                  </div>
                )}
              </div>

              {/* Coupon Code Input with Validated Auto-Uppercase */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', backgroundColor: '#f8fafc' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Promotional Coupon
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Coupon code..."
                    style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', textTransform: 'uppercase' }}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    style={{
                      backgroundColor: '#334155',
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700
                    }}
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Settlement Calculation Box */}
              <div style={{ backgroundColor: '#f1f5f9', borderRadius: '10px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                  <span>Subtotal (Food & Drinks):</span>
                  <span>{subtotal.toLocaleString()} VND</span>
                </div>

                {memberProfile && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>
                    <span>{memberProfile.tier} Member (-{memberDiscountPct}%):</span>
                    <span>-{memberDiscountAmount.toLocaleString()} VND</span>
                  </div>
                )}

                {appliedCoupon && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>
                    <span>Coupon {appliedCoupon.code} (-{couponDiscountPct}%):</span>
                    <span>-{couponDiscountAmount.toLocaleString()} VND</span>
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: isCapped ? '#dc2626' : '#0f766e',
                    borderTop: '1px dashed #cbd5e1',
                    paddingTop: '6px',
                    marginTop: '6px'
                  }}
                >
                  <span>Cumulative Discount (-{effectiveDiscountPct}% {isCapped ? '[CAPPED AT 40%]' : '<= 40%'}):</span>
                  <span>-{totalDiscountAmount.toLocaleString()} VND</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '2px solid #cbd5e1',
                    paddingTop: '10px',
                    marginTop: '10px',
                    fontSize: '16px',
                    fontWeight: 800,
                    color: '#0f172a'
                  }}
                >
                  <span>Total Payable:</span>
                  <span style={{ color: '#0f766e', fontSize: '18px' }}>
                    {totalPayable.toLocaleString()} VND
                  </span>
                </div>
              </div>

              {/* Fast Tender Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleCashPayment}
                  disabled={hasUnservedCooking}
                  style={{
                    flex: 1,
                    minHeight: '48px',
                    backgroundColor: hasUnservedCooking ? '#cbd5e1' : '#047857',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700
                  }}
                >
                  💵 PAY CASH (ROUNDED)
                </button>

                <button
                  onClick={() => {
                    setIsVietQRModalOpen(true);
                    setGatewayVerified(false);
                  }}
                  disabled={hasUnservedCooking}
                  style={{
                    flex: 1,
                    minHeight: '48px',
                    backgroundColor: hasUnservedCooking ? '#cbd5e1' : '#0284c7',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700
                  }}
                >
                  📲 DYNAMIC VIETQR
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SCR-POS-03: Dynamic VietQR Payment Modal */}
      {isVietQRModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '440px' }}>
            <div
              style={{
                backgroundColor: '#0284c7',
                color: '#fff',
                padding: '14px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <h3 style={{ fontSize: '14px', fontWeight: 800 }}>
                SETTLE BILL VIA VIETQR TRANSFER ({selectedTable.name})
              </h3>
              <button
                onClick={() => setIsVietQRModalOpen(false)}
                style={{ color: '#fff', fontSize: '16px', fontWeight: 700 }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>AMOUNT TO PAY:</div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#0284c7', marginTop: '2px' }}>
                {totalPayable.toLocaleString()} VND
              </div>
              <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>
                Beneficiary: <strong>OPERLY RESTAURANT</strong> (VietinBank - 102839482)
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', backgroundColor: '#f1f5f9', padding: '6px', borderRadius: '6px', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
                Transfer Content: ORD1048 {selectedTable.id}
              </div>

              {/* Rendered VietQR Graphic Frame */}
              <div
                style={{
                  margin: '16px auto',
                  width: '200px',
                  height: '200px',
                  backgroundColor: '#ffffff',
                  border: gatewayVerified ? '3px solid #16a34a' : '2px dashed #0284c7',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px',
                  position: 'relative'
                }}
              >
                {gatewayVerified ? (
                  <>
                    <div style={{ fontSize: '48px', color: '#16a34a' }}>✓</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
                      PAID & VERIFIED
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                      VietinBank API Confirmation
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '48px' }}>💳</div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
                      NAPAS / VietQR
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b', textAlign: 'center', marginTop: '4px' }}>
                      Scan with any Vietnamese Banking App
                    </div>
                  </>
                )}
              </div>

              {/* Gateway Connection / Verified Status Feedback */}
              <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: gatewayVerified ? '#16a34a' : isPollingGateway ? '#f59e0b' : '#22c55e'
                  }}
                />
                <span>
                  {gatewayVerified
                    ? 'Transfer confirmed via payment gateway webhook'
                    : isPollingGateway
                    ? 'Querying bank API gateway...'
                    : 'Status: Waiting for customer bank transfer... [Auto-listening]'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button
                  onClick={handleManualGatewayCheck}
                  disabled={isPollingGateway || gatewayVerified}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    backgroundColor: isPollingGateway ? '#e2e8f0' : '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#334155'
                  }}
                >
                  {isPollingGateway ? '⏳ CHECKING...' : '🔍 CHECK GATEWAY STATUS'}
                </button>

                <button
                  onClick={() => finalizeSettlement(totalPayable, 'VietQR')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    backgroundColor: '#16a34a',
                    color: '#fff',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  ✓ CONFIRM PAID
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
