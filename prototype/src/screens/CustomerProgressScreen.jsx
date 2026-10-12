import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Flame, Bell, Utensils, AlertCircle } from 'lucide-react';
import { useMockStore } from '../store/mockStore';
import { CustomerNavHeader } from '../components/customer/CustomerNavHeader';

export const CustomerProgressScreen = () => {
  const { kdsTickets, setCustomerScreen, addServiceCall, requestBill, tables, cartItems } = useMockStore();

  const [waiterCallCooldown, setWaiterCallCooldown] = useState(0);
  const [billCallCooldown, setBillCallCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (waiterCallCooldown > 0) {
      timer = setInterval(() => {
        setWaiterCallCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [waiterCallCooldown]);

  useEffect(() => {
    let timer;
    if (billCallCooldown > 0) {
      timer = setInterval(() => {
        setBillCallCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [billCallCooldown]);

  const handleCallWaiter = () => {
    if (waiterCallCooldown > 0) return;
    addServiceCall('T05', 'Diner assistance requested at Table 05');
    setWaiterCallCooldown(30);
  };

  const handleRequestBill = () => {
    if (billCallCooldown > 0) return;
    requestBill('T05');
    setBillCallCooldown(30);
  };

  // Find all Table 05 tickets
  const tableTickets = kdsTickets.filter((t) => t.tableId === 'T05');
  const items = tableTickets.length > 0 ? tableTickets.flatMap((t) => t.items) : (kdsTickets[0]?.items || []);
  const latestTicket = tableTickets[tableTickets.length - 1] || kdsTickets[0];

  // Table information
  const table05 = tables.find((t) => t.id === 'T05');

  // Determine overall order stage
  const hasCooking = items.some((i) => i.status === 'Cooking' || i.status === 'Pending');
  const hasReady = items.some((i) => i.status === 'Ready');
  const allServed = items.length > 0 && items.every((i) => i.status === 'Served');

  let currentStage = 'Ordered';
  if (allServed) currentStage = 'Served';
  else if (hasReady || hasCooking) currentStage = 'Cooking';

  return (
    <div className="device-mobile" style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#f8fafc' }}>
      {/* Persistent Customer Navigation Header */}
      <CustomerNavHeader
        activeTab="progress"
        onSelectTab={(tab) => setCustomerScreen(tab)}
        cartItemCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        onOpenCart={() => setCustomerScreen('menu')}
      />

      {/* Screen Title & Order Reference Header (SCR-CUST-04) */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
            Table 05 | Order #{latestTicket?.orderId || 'ORD-1048'}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            Placed at {latestTicket?.placedAt || '19:30'} • Real-time kitchen tracking
          </div>
        </div>

        <button
          onClick={() => setCustomerScreen('menu')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#0f766e',
            color: '#ffffff',
            padding: '7px 12px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <Utensils size={12} />
          <span>+ Add Dishes</span>
        </button>
      </div>

      {/* Main Tracker Scrollable View */}
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Progress Stepper Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
              MEAL PREPARATION STAGES:
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f766e', backgroundColor: '#ccfbf1', padding: '2px 6px', borderRadius: '4px' }}>
              {currentStage === 'Served' ? 'All Dishes Served' : 'Kitchen Active'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            {/* Step 1: Ordered */}
            <div style={{ textAlign: 'center', zIndex: 2, flex: 1 }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#16a34a',
                  color: '#fff',
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '14px'
                }}
              >
                ✓
              </div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>Ordered</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>{latestTicket?.placedAt || '19:30'}</div>
            </div>

            <div style={{ flex: 1, height: '3px', backgroundColor: currentStage !== 'Ordered' ? '#16a34a' : '#cbd5e1' }} />

            {/* Step 2: Cooking */}
            <div style={{ textAlign: 'center', zIndex: 2, flex: 1 }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: currentStage === 'Cooking' || currentStage === 'Served' ? '#f97316' : '#f1f5f9',
                  color: currentStage === 'Cooking' || currentStage === 'Served' ? '#fff' : '#94a3b8',
                  border: currentStage === 'Cooking' || currentStage === 'Served' ? 'none' : '2px dashed #cbd5e1',
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '14px'
                }}
              >
                <Flame size={18} />
              </div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>Cooking</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Station Line</div>
            </div>

            <div style={{ flex: 1, height: '3px', backgroundColor: currentStage === 'Served' ? '#16a34a' : '#cbd5e1' }} />

            {/* Step 3: Ready / Served */}
            <div style={{ textAlign: 'center', zIndex: 2, flex: 1 }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: currentStage === 'Served' ? '#16a34a' : '#f1f5f9',
                  color: currentStage === 'Served' ? '#fff' : '#94a3b8',
                  border: currentStage === 'Served' ? 'none' : '2px dashed #cbd5e1',
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '14px'
                }}
              >
                {currentStage === 'Served' ? '✓' : '🍽️'}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
                {currentStage === 'Served' ? 'Served' : 'Ready'}
              </div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>
                {currentStage === 'Served' ? 'Enjoy Dining' : 'At Kitchen Pass'}
              </div>
            </div>
          </div>
        </div>

        {/* Current Dish Statuses List matching SCR-CUST-04 */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
            ORDERED ITEMS STATUS ({items.length}):
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {items.map((item) => {
              let badgeBg = '#f1f5f9';
              let badgeColor = '#475569';
              let badgeBorder = '#cbd5e1';

              if (item.status === 'Cooking') {
                badgeBg = 'rgba(249, 115, 22, 0.15)';
                badgeColor = '#ea580c';
                badgeBorder = '#f97316';
              } else if (item.status === 'Ready') {
                badgeBg = 'rgba(34, 197, 94, 0.15)';
                badgeColor = '#16a34a';
                badgeBorder = '#22c55e';
              } else if (item.status === 'Served') {
                badgeBg = 'rgba(2, 132, 199, 0.15)';
                badgeColor = '#0284c7';
                badgeBorder = '#38bdf8';
              }

              return (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                      {item.quantity}x {item.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      {item.station} {item.modifier && item.modifier !== 'Default' ? `• ${item.modifier}` : ''}
                    </div>
                  </div>

                  <span
                    style={{
                      backgroundColor: badgeBg,
                      color: badgeColor,
                      border: `1px solid ${badgeBorder}`,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {item.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Table Bill & Service Assistance Actions (REV-002: Anti-spam cooldown) */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
              Active Bill Total for Table 05:
            </span>
            <span style={{ fontSize: '16px', fontWeight: 900, color: '#0f766e', fontFamily: 'var(--font-mono)' }}>
              {(table05?.billAmount || 0).toLocaleString()} VND
            </span>
          </div>

          <div style={{ fontSize: '12px', color: '#64748b', borderTop: '1px dashed #e2e8f0', paddingTop: '8px' }}>
            Need assistance or ready to check out?
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleCallWaiter}
              disabled={waiterCallCooldown > 0}
              style={{
                flex: 1,
                minHeight: '44px',
                backgroundColor: waiterCallCooldown > 0 ? '#f1f5f9' : '#0f766e',
                color: waiterCallCooldown > 0 ? '#94a3b8' : '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: waiterCallCooldown > 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Bell size={14} />
              <span>{waiterCallCooldown > 0 ? `Called (${waiterCallCooldown}s)` : 'Call Waiter'}</span>
            </button>

            <button
              onClick={handleRequestBill}
              disabled={billCallCooldown > 0}
              style={{
                flex: 1,
                minHeight: '44px',
                backgroundColor: billCallCooldown > 0 ? '#f1f5f9' : '#0284c7',
                color: billCallCooldown > 0 ? '#94a3b8' : '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: billCallCooldown > 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>🧾</span>
              <span>{billCallCooldown > 0 ? `Requested (${billCallCooldown}s)` : 'Pre-print Bill'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
