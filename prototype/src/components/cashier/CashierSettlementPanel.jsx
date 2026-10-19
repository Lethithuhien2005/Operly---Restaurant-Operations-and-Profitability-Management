import React, { useState } from 'react';
import { MOCK_MEMBERS, MOCK_COUPONS } from '../../mock/data';

/**
 * CashierSettlementPanel
 * Right column of POS terminal (SCR-POS-01).
 * Handles Loyalty Member verification (FR-011), coupon vouchers (FR-008),
 * enforces PRD Rule 7 (40% cumulative discount cap), computes payable total,
 * and launches payment modal.
 */
export const CashierSettlementPanel = ({
  subtotal = 0,
  hasUnservedCooking = false,
  memberProfile,
  setMemberProfile,
  appliedCoupon,
  setAppliedCoupon,
  onProceedPayment,
  onRequestDiscountOverride
}) => {
  const [phoneInput, setPhoneInput] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [memberError, setMemberError] = useState('');
  const [couponError, setCouponError] = useState('');

  // Discount calculations enforcing PRD Rule 7 (max 40% cumulative cap)
  const memberDiscountPct = memberProfile ? memberProfile.tierDiscountPct : 0;
  const couponDiscountPct = appliedCoupon ? appliedCoupon.discountPct : 0;
  const rawTotalDiscountPct = memberDiscountPct + couponDiscountPct;
  const effectiveDiscountPct = Math.min(rawTotalDiscountPct, 40);
  const isDiscountCapped = rawTotalDiscountPct > 40;

  const totalDiscountAmount = Math.round((subtotal * effectiveDiscountPct) / 100);
  const totalPayable = Math.max(0, subtotal - totalDiscountAmount);

  // Cash rounding to nearest 1,000 VND
  const roundedPayable = Math.round(totalPayable / 1000) * 1000;

  const handleVerifyPhone = (phoneToTest) => {
    const target = (phoneToTest || phoneInput).trim();
    setMemberError('');
    if (!target) {
      setMemberError('Please enter a phone number.');
      return;
    }
    const found = MOCK_MEMBERS[target];
    if (found) {
      setMemberProfile(found);
      setPhoneInput(target);
    } else {
      setMemberProfile(null);
      setMemberError('Member not found. Check number or register guest.');
    }
  };

  const handleApplyCoupon = (codeToTest) => {
    const target = (codeToTest || couponInput).trim().toUpperCase();
    setCouponError('');
    if (!target) {
      setCouponError('Please enter a coupon code.');
      return;
    }
    const found = MOCK_COUPONS[target];
    if (found) {
      setAppliedCoupon(found);
      setCouponInput(target);
    } else {
      setAppliedCoupon(null);
      setCouponError('Invalid promo code or expired.');
    }
  };

  return (
    <div className="pos-settlement-pane">
      {/* Pane Title */}
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#ffffff'
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.02em' }}>
          SETTLEMENT & DISCOUNTS
        </span>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
        {/* Section 1: Member Loyalty Lookup (FR-011) */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b' }}>
              👤 LOYALTY MEMBER (FR-011)
            </span>
            {memberProfile && (
              <button
                onClick={() => {
                  setMemberProfile(null);
                  setPhoneInput('');
                }}
                style={{ fontSize: '11px', color: '#ef4444', fontWeight: 700 }}
              >
                ✕ Remove
              </button>
            )}
          </div>

          {!memberProfile ? (
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="Enter phone (e.g. 0912345678)"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyPhone()}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    backgroundColor: '#ffffff'
                  }}
                />
                <button
                  onClick={() => handleVerifyPhone()}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#0f766e',
                    color: '#ffffff',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700
                  }}
                >
                  Verify
                </button>
              </div>

              {memberError && (
                <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>
                  {memberError}
                </div>
              )}

              {/* Quick sample member pills */}
              <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '10px', color: '#64748b', alignSelf: 'center' }}>Quick:</span>
                {Object.values(MOCK_MEMBERS).map((m) => (
                  <button
                    key={m.phone}
                    onClick={() => handleVerifyPhone(m.phone)}
                    style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      backgroundColor: '#e2e8f0',
                      color: '#334155',
                      fontWeight: 600
                    }}
                  >
                    {m.name.split(' ')[0]} ({m.tier})
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div
              style={{
                marginTop: '8px',
                padding: '8px 10px',
                backgroundColor: '#ffffff',
                border: '1px solid #ccfbf1',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f766e' }}>
                  {memberProfile.name}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {memberProfile.phone} • Points: <strong>{memberProfile.pointsBalance}</strong>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
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
                  {memberProfile.tier} ({memberProfile.tierDiscountPct}%)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Promo Coupon Code (FR-008) */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b' }}>
              🏷️ PROMO COUPON (FR-008)
            </span>
            {appliedCoupon && (
              <button
                onClick={() => {
                  setAppliedCoupon(null);
                  setCouponInput('');
                }}
                style={{ fontSize: '11px', color: '#ef4444', fontWeight: 700 }}
              >
                ✕ Remove
              </button>
            )}
          </div>

          {!appliedCoupon ? (
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="Code (e.g. HAPPYHOUR)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    backgroundColor: '#ffffff',
                    textTransform: 'uppercase'
                  }}
                />
                <button
                  onClick={() => handleApplyCoupon()}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#0369a1',
                    color: '#ffffff',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700
                  }}
                >
                  Apply
                </button>
              </div>

              {couponError && (
                <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>
                  {couponError}
                </div>
              )}

              {/* Quick sample promo pills */}
              <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '10px', color: '#64748b', alignSelf: 'center' }}>Vouchers:</span>
                {Object.keys(MOCK_COUPONS).map((code) => (
                  <button
                    key={code}
                    onClick={() => handleApplyCoupon(code)}
                    style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      backgroundColor: '#e2e8f0',
                      color: '#334155',
                      fontWeight: 600
                    }}
                  >
                    {code} ({MOCK_COUPONS[code].discountPct}%)
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div
              style={{
                marginTop: '8px',
                padding: '8px 10px',
                backgroundColor: '#ffffff',
                border: '1px solid #bae6fd',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#0369a1' }}>
                  {appliedCoupon.code} (-{appliedCoupon.discountPct}%)
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {appliedCoupon.description}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PRD Rule 7 Cap Warning Banner */}
        {isDiscountCapped && (
          <div
            style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '6px',
              padding: '10px',
              fontSize: '11px',
              color: '#92400e'
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: '2px' }}>
              🛡️ PRD Rule 7 Cap Enforced: 40% Maximum
            </div>
            <div>
              Combined discount is <strong>{rawTotalDiscountPct}%</strong> ({memberProfile?.tier}{' '}
              {memberDiscountPct}% + {appliedCoupon?.code} {couponDiscountPct}%), capped to{' '}
              <strong>40%</strong>.
            </div>
            {onRequestDiscountOverride && (
              <button
                onClick={() =>
                  onRequestDiscountOverride({
                    subtotal,
                    requestedDiscountPct: rawTotalDiscountPct
                  })
                }
                style={{
                  marginTop: '6px',
                  color: '#b45309',
                  textDecoration: 'underline',
                  fontWeight: 700,
                  fontSize: '11px'
                }}
              >
                Request Manager Override to release &gt;40% discount →
              </button>
            )}
          </div>
        )}

        {/* Section 3: Financial Calculations Breakdown */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b' }}>
            <span>Bill Subtotal:</span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>{subtotal.toLocaleString()} VND</span>
          </div>

          {memberProfile && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#0f766e' }}>
              <span>Loyalty Discount ({memberProfile.tier} - {memberDiscountPct}%):</span>
              <span>-{Math.round((subtotal * memberDiscountPct) / 100).toLocaleString()} VND</span>
            </div>
          )}

          {appliedCoupon && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#0369a1' }}>
              <span>Promo Voucher ({appliedCoupon.code} - {couponDiscountPct}%):</span>
              <span>-{Math.round((subtotal * couponDiscountPct) / 100).toLocaleString()} VND</span>
            </div>
          )}

          {effectiveDiscountPct > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                fontWeight: 700,
                color: '#166534',
                paddingTop: '4px',
                borderTop: '1px dashed #e2e8f0'
              }}
            >
              <span>Total Savings ({effectiveDiscountPct}%):</span>
              <span>-{totalDiscountAmount.toLocaleString()} VND</span>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: '#94a3b8'
            }}
          >
            <span>Tax (VAT 8% Included):</span>
            <span>✓ Included</span>
          </div>

          {/* Large Total Payable */}
          <div
            style={{
              marginTop: '6px',
              paddingTop: '10px',
              borderTop: '2px solid #0f172a',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline'
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', letterSpacing: '0.04em' }}>
                TOTAL PAYABLE
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>(Cash rounded to nearest 1k)</div>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f766e' }}>
              {roundedPayable.toLocaleString()} <span style={{ fontSize: '13px' }}>VND</span>
            </div>
          </div>
        </div>

        {/* Section 4: Settlement Execution CTA */}
        <div style={{ marginTop: 'auto' }}>
          <button
            onClick={() => onProceedPayment && onProceedPayment(roundedPayable, effectiveDiscountPct)}
            disabled={hasUnservedCooking || subtotal === 0}
            className="pos-touch-btn"
            style={{
              width: '100%',
              backgroundColor: hasUnservedCooking || subtotal === 0 ? '#cbd5e1' : '#0f766e',
              color: '#ffffff',
              fontSize: '14px',
              cursor: hasUnservedCooking || subtotal === 0 ? 'not-allowed' : 'pointer',
              boxShadow: hasUnservedCooking || subtotal === 0 ? 'none' : '0 4px 12px rgba(15,118,110,0.35)'
            }}
          >
            {hasUnservedCooking
              ? '⛔ BLOCKED: FOOD IS COOKING'
              : subtotal === 0
              ? 'NO ITEMS TO SETTLE'
              : '💳 PROCEED TO PAYMENT'}
          </button>

          {/* Quick Payment Channel Badges */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '10px',
              fontSize: '11px',
              color: '#64748b'
            }}
          >
            <span>💵 Cash</span>
            <span>•</span>
            <span>💳 Card</span>
            <span>•</span>
            <span>📱 VietQR</span>
            <span>•</span>
            <span>👛 e-Wallet</span>
          </div>
        </div>
      </div>
    </div>
  );
};
