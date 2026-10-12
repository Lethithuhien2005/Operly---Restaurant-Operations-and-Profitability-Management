import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, MapPin, CheckCircle2, QrCode, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useMockStore } from '../../store/mockStore';

export const CustomerReservationWizard = ({ onBookingComplete, onReturnToMenu }) => {
  const { menuItems, createReservation, showToast } = useMockStore();

  const [step, setStep] = useState(1); // 1: Schedule, 2: Table Area, 3: Contact & Pre-order, 4: Deposit/Payment, 5: Confirmed
  const [partySize, setPartySize] = useState(4);
  const [bookingDate, setBookingDate] = useState('2026-09-26');
  const [bookingTime, setBookingTime] = useState('19:00');
  const [selectedArea, setSelectedArea] = useState('Indoor Dining Room');

  // Contact Info
  const [customerName, setCustomerName] = useState('Hoang Nam Le');
  const [phone, setPhone] = useState('0905123456');
  const [email, setEmail] = useState('nam.le@example.com');
  const [specialRequests, setSpecialRequests] = useState('Window view table, anniversary celebration');

  // Pre-ordered dishes
  const [preOrderItems, setPreOrderItems] = useState([
    { dishId: 'DISH-101', name: 'Seafood Spicy Hotpot', quantity: 1, price: 280000 },
    { dishId: 'DISH-105', name: 'Iced Herbal Tea', quantity: 4, price: 25000 }
  ]);

  // Payment Countdown Timer (10 minutes provisional lock)
  const [holdSeconds, setHoldSeconds] = useState(600);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    let timer;
    if (step === 4 && holdSeconds > 0) {
      timer = setInterval(() => {
        setHoldSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, holdSeconds]);

  // Pre-order calculations
  const preOrderTotal = preOrderItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

  // Exact PRD Deposit Mandate Formula:
  // If partySize < 8 AND preOrderTotal < 1,000,000 VND -> Deposit = 0 VND
  // Otherwise -> max(40% * preOrderTotal, partySize * 50,000 VND)
  const isDepositMandated = partySize >= 8 || preOrderTotal >= 1000000;
  const depositRequired = isDepositMandated
    ? Math.max(Math.round(preOrderTotal * 0.4), partySize * 50000)
    : 0;

  const timeSlots = ['11:30', '12:00', '12:30', '18:00', '18:30', '19:00', '19:30', '20:00'];

  const seatingAreas = [
    {
      id: 'Indoor Dining Room',
      name: 'Indoor Dining Room',
      desc: 'Air-conditioned main hall, cozy acoustic design',
      tableSample: 'Table T03 / T04 (Up to 10 guests)',
      icon: '🏛️'
    },
    {
      id: 'Garden Terrace Patio',
      name: 'Garden Terrace Patio',
      desc: 'Open-air courtyard with ambient festoon lighting',
      tableSample: 'Patio P02 (Up to 8 guests)',
      icon: '🌿'
    },
    {
      id: 'VIP Private Dining Room',
      name: 'VIP Private Dining Room',
      desc: 'Secluded luxury suite with dedicated server',
      tableSample: 'Suite V01 (Up to 12 guests)',
      icon: '👑'
    }
  ];

  const handleTogglePreOrderItem = (dish) => {
    const existing = preOrderItems.find((i) => i.dishId === dish.id);
    if (existing) {
      setPreOrderItems((prev) => prev.filter((i) => i.dishId !== dish.id));
    } else {
      setPreOrderItems((prev) => [
        ...prev,
        { dishId: dish.id, name: dish.name, quantity: 1, price: dish.price }
      ]);
    }
  };

  const handleProceedToPaymentOrConfirm = () => {
    if (depositRequired > 0) {
      setStep(4); // Show VietQR Deposit Payment screen
    } else {
      // Direct confirmation with 0 deposit
      finalizeBooking(0);
    }
  };

  const finalizeBooking = (depositPaidAmount) => {
    const newRes = createReservation({
      customerName,
      phone,
      email,
      partySize,
      date: bookingDate,
      time: bookingTime,
      area: selectedArea,
      tableId: selectedArea.includes('Indoor') ? 'T03' : selectedArea.includes('Patio') ? 'P02' : 'V01',
      specialRequests,
      preOrderItems,
      preOrderTotal,
      depositRequired,
      depositPaid: depositPaidAmount
    });
    setConfirmedBooking(newRes);
    setStep(5);
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#f8fafc' }}>
      {/* Step Header */}
      <div
        style={{
          padding: '14px 16px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
            Book a Table (SCR-CUST-01)
          </h2>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            {step === 1 && 'Step 1 of 4: Party Size & Schedule'}
            {step === 2 && 'Step 2 of 4: Seating Area Selection'}
            {step === 3 && 'Step 3 of 4: Guest Contact & Pre-Order'}
            {step === 4 && 'Step 4 of 4: Secure Deposit Payment (SCR-CUST-02)'}
            {step === 5 && 'Booking Confirmed!'}
          </div>
        </div>

        {step > 1 && step < 5 && (
          <button
            onClick={() => setStep((prev) => prev - 1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#0f766e',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>
        )}
      </div>

      {/* Step Progress Line */}
      <div style={{ height: '4px', backgroundColor: '#e2e8f0', width: '100%' }}>
        <div
          style={{
            height: '100%',
            backgroundColor: '#0f766e',
            width: `${(step / 4) * 100}%`,
            transition: 'width 0.3s ease'
          }}
        />
      </div>

      {/* Content Body */}
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
        {/* STEP 1: Schedule & Party Size */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Party Size */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
                Select Party Size
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  type="button"
                  onClick={() => setPartySize((p) => Math.max(1, p - 1))}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '20px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  -
                </button>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f766e', fontFamily: 'var(--font-mono)' }}>
                    {partySize} {partySize === 1 ? 'Guest' : 'Guests'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {partySize >= 8 ? 'Large party mandate applies' : 'Standard party'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPartySize((p) => Math.min(16, p + 1))}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '20px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Date Selection */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                Reservation Date
              </label>
              <input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Time Slot Selection */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  Select Time Slot
                </label>
                <span style={{ fontSize: '10px', color: '#0f766e', backgroundColor: '#ccfbf1', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  90-Min Table Buffer
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {timeSlots.map((slot) => {
                  const isSelected = bookingTime === slot;
                  return (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setBookingTime(slot)}
                      style={{
                        padding: '10px 6px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: isSelected ? 800 : 600,
                        backgroundColor: isSelected ? '#0f766e' : '#f8fafc',
                        color: isSelected ? '#ffffff' : '#334155',
                        border: `1.5px solid ${isSelected ? '#0f766e' : '#cbd5e1'}`,
                        cursor: 'pointer'
                      }}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              style={{
                width: '100%',
                minHeight: '48px',
                backgroundColor: '#0f766e',
                color: '#ffffff',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 6px rgba(15, 118, 110, 0.3)',
                cursor: 'pointer'
              }}
            >
              <span>Next: Choose Seating Area</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* STEP 2: Seating Area */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Select where your party would like to be seated:
            </div>

            {seatingAreas.map((area) => {
              const isSelected = selectedArea === area.id;
              return (
                <div
                  key={area.id}
                  onClick={() => setSelectedArea(area.id)}
                  style={{
                    backgroundColor: isSelected ? '#f0fdfa' : '#ffffff',
                    border: `2px solid ${isSelected ? '#0f766e' : '#e2e8f0'}`,
                    borderRadius: '14px',
                    padding: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    boxShadow: isSelected ? '0 0 10px rgba(15, 118, 110, 0.15)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '28px' }}>{area.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                        {area.name}
                      </h4>
                      {isSelected && (
                        <span style={{ backgroundColor: '#0f766e', color: '#fff', fontSize: '10px', padding: '2px 8px', borderRadius: '999px', fontWeight: 800 }}>
                          SELECTED
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      {area.desc}
                    </p>
                    <div style={{ fontSize: '11px', color: '#0f766e', fontWeight: 700, marginTop: '6px' }}>
                      {area.tableSample}
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              onClick={() => setStep(3)}
              style={{
                marginTop: '10px',
                width: '100%',
                minHeight: '48px',
                backgroundColor: '#0f766e',
                color: '#ffffff',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 6px rgba(15, 118, 110, 0.3)',
                cursor: 'pointer'
              }}
            >
              <span>Next: Guest Contact & Pre-Order</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* STEP 3: Contact & Pre-Order */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Contact Details */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
                Primary Guest Contact
              </h4>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Occasion & Special Requests
                </label>
                <input
                  type="text"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* Optional Pre-Order Items */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
                  Optional Food Pre-Order
                </h4>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f766e' }}>
                  {preOrderItems.length} items ({preOrderTotal.toLocaleString()} VND)
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                {menuItems.slice(0, 4).map((dish) => {
                  const isPreOrdered = preOrderItems.some((i) => i.dishId === dish.id);
                  return (
                    <div
                      key={dish.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 10px',
                        backgroundColor: isPreOrdered ? '#f0fdfa' : '#f8fafc',
                        borderRadius: '8px',
                        border: `1px solid ${isPreOrdered ? '#0f766e' : '#e2e8f0'}`
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>{dish.image}</span>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{dish.name}</div>
                          <div style={{ fontSize: '11px', color: '#0f766e', fontWeight: 600 }}>{dish.price.toLocaleString()} VND</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleTogglePreOrderItem(dish)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: isPreOrdered ? '#dc2626' : '#0f766e',
                          color: '#ffffff',
                          cursor: 'pointer'
                        }}
                      >
                        {isPreOrdered ? 'Remove' : '+ Add'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Deposit Calculation Policy Banner */}
            <div
              style={{
                backgroundColor: isDepositMandated ? '#fffbeb' : '#f0fdf4',
                border: `1.5px solid ${isDepositMandated ? '#f59e0b' : '#86efac'}`,
                borderRadius: '12px',
                padding: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '16px' }}>{isDepositMandated ? '⚠️' : '✓'}</span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: isDepositMandated ? '#b45309' : '#166534' }}>
                  {isDepositMandated
                    ? 'ADVANCE DEPOSIT MANDATED BY RESTAURANT POLICY'
                    : 'NO ADVANCE DEPOSIT REQUIRED (0 VND)'}
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#475569', lineHeight: 1.4 }}>
                {isDepositMandated
                  ? `Large party (${partySize} guests) or pre-order total (≥ 1M VND) requires a security deposit: max(40% food, party × 50,000 VND).`
                  : 'Parties under 8 guests with pre-orders under 1,000,000 VND confirm directly with zero deposit fee.'}
              </p>
              {isDepositMandated && (
                <div style={{ marginTop: '8px', fontSize: '15px', fontWeight: 900, color: '#b45309', fontFamily: 'var(--font-mono)' }}>
                  Required Deposit: {depositRequired.toLocaleString()} VND
                </div>
              )}
            </div>

            <button
              onClick={handleProceedToPaymentOrConfirm}
              style={{
                width: '100%',
                minHeight: '48px',
                backgroundColor: isDepositMandated ? '#d97706' : '#0f766e',
                color: '#ffffff',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
                cursor: 'pointer'
              }}
            >
              <span>{isDepositMandated ? `PROCEED TO SECURE DEPOSIT (${depositRequired.toLocaleString()} VND) >>>` : 'CONFIRM RESERVATION NOW (0 VND) >>>'}</span>
            </button>
          </div>
        )}

        {/* STEP 4: VietQR Deposit Payment Screen (SCR-CUST-02) */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 10-Min Hold Countdown */}
            <div
              style={{
                backgroundColor: '#fee2e2',
                border: '1.5px solid #ef4444',
                borderRadius: '12px',
                padding: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="#dc2626" />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#991b1b' }}>
                    PROVISIONAL TABLE LOCK ACTIVE
                  </div>
                  <div style={{ fontSize: '10px', color: '#7f1d1d' }}>
                    Table {selectedArea} held provisionally for 10 minutes
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '18px', fontWeight: 900, color: '#dc2626', fontFamily: 'var(--font-mono)' }}>
                {formatTimer(holdSeconds)}
              </div>
            </div>

            {/* VietQR Bank Card */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #cbd5e1',
                padding: '20px',
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f766e', letterSpacing: '0.05em' }}>
                VIETQR DYNAMIC PAYMENT GATEWAY
              </div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: '4px 0 12px 0', fontFamily: 'var(--font-mono)' }}>
                {depositRequired.toLocaleString()} VND
              </div>

              {/* Dynamic QR Graphic Simulation */}
              <div
                style={{
                  width: '180px',
                  height: '180px',
                  margin: '0 auto 14px auto',
                  backgroundColor: '#f8fafc',
                  border: '2px solid #0f766e',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <QrCode size={110} color="#0f766e" />
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#0f766e' }}>Scan with Any Bank App</span>
              </div>

              <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '10px', fontSize: '11px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Bank:</span>
                  <span style={{ fontWeight: 700 }}>Vietcombank (VCB)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Account:</span>
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>0123456789</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Beneficiary:</span>
                  <span style={{ fontWeight: 700 }}>OPERLY RESTAURANT CENTRAL</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Transfer Memo:</span>
                  <span style={{ fontWeight: 800, color: '#0f766e', fontFamily: 'var(--font-mono)' }}>OPL-RES-8942</span>
                </div>
              </div>
            </div>

            {/* Test Simulation Button */}
            <button
              onClick={() => finalizeBooking(depositRequired)}
              style={{
                width: '100%',
                minHeight: '48px',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 6px rgba(22, 163, 74, 0.3)',
                cursor: 'pointer'
              }}
              title="Simulate bank transfer webhook confirmation"
            >
              <CheckCircle2 size={16} />
              <span>SIMULATE INSTANT VIETQR TRANSFER (WEBHOOK)</span>
            </button>
          </div>
        )}

        {/* STEP 5: Booking Confirmed */}
        {step === 5 && confirmedBooking && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px', padding: '10px 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                border: '2px solid #22c55e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16a34a'
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                Table Reservation Confirmed!
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                Booking reference SMS dispatched to {confirmedBooking.phone}.
              </p>
            </div>

            {/* Confirmation Card */}
            <div
              style={{
                width: '100%',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '14px',
                padding: '16px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Booking Code:</span>
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#0f766e', fontFamily: 'var(--font-mono)' }}>
                  {confirmedBooking.code}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Guest Name:</span>
                <span style={{ fontSize: '12px', fontWeight: 700 }}>{confirmedBooking.customerName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Party Size:</span>
                <span style={{ fontSize: '12px', fontWeight: 700 }}>{confirmedBooking.partySize} Guests</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Date & Time:</span>
                <span style={{ fontSize: '12px', fontWeight: 700 }}>{confirmedBooking.date} at {confirmedBooking.time}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Area & Table:</span>
                <span style={{ fontSize: '12px', fontWeight: 700 }}>{confirmedBooking.area} ({confirmedBooking.tableId})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Deposit Paid:</span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f766e' }}>
                  {confirmedBooking.depositPaid.toLocaleString()} VND
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <button
                onClick={onReturnToMenu}
                style={{
                  flex: 1,
                  minHeight: '44px',
                  backgroundColor: '#0f766e',
                  color: '#ffffff',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Go to QR Menu (Table 05)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
