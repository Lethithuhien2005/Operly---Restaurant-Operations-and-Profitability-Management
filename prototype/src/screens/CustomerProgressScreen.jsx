import React, { useState, useEffect } from 'react';
import { useMockStore } from '../store/mockStore';

export const CustomerProgressScreen = () => {
  const { kdsTickets, setCustomerScreen, showToast } = useMockStore();

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
    showToast('Ding! Floor Waiter notified to visit Table 05');
    setWaiterCallCooldown(30);
  };

  const handleRequestBill = () => {
    if (billCallCooldown > 0) return;
    showToast('Cashier desk received Pre-print Bill request for Table 05');
    setBillCallCooldown(30);
  };

  // Find Table 05 ticket
  const tableTicket = kdsTickets.find((t) => t.tableId === 'T05') || kdsTickets[0];
  const items = tableTicket ? tableTicket.items : [];

  // Determine overall order stage
  const hasCooking = items.some((i) => i.status === 'Cooking');
  const hasReady = items.some((i) => i.status === 'Ready');
  const allServed = items.length > 0 && items.every((i) => i.status === 'Served');

  let currentStage = 'Ordered';
  if (allServed) currentStage = 'Served';
  else if (hasReady || hasCooking) currentStage = 'Cooking';

  return (
    <div className="device-mobile" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header matching SCR-CUST-04 */}
      <div style={{ backgroundColor: '#0f766e', color: '#fff', padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '16px' }}>Table 05 | Order #{tableTicket?.orderId || 'ORD-1048'}</div>
            <div style={{ fontSize: '11px', opacity: 0.85 }}>Placed at {tableTicket?.placedAt || '19:30'} • Real-time tracking</div>
          </div>
          <button
            onClick={() => setCustomerScreen('menu')}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: '#fff',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700
            }}
          >
            + Add Dishes
          </button>
        </div>
      </div>

      <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
        {/* Progress Stepper Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '14px' }}>
            MEAL PROGRESS:
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            {/* Step 1: Ordered */}
            <div style={{ textAlign: 'center', zIndex: 2, flex: 1 }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
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
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>Ordered</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>({tableTicket?.placedAt || '19:30'})</div>
            </div>

            <div style={{ flex: 1, height: '2px', backgroundColor: currentStage !== 'Ordered' ? '#16a34a' : '#cbd5e1' }} />

            {/* Step 2: Cooking */}
            <div style={{ textAlign: 'center', zIndex: 2, flex: 1 }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: currentStage === 'Cooking' || currentStage === 'Served' ? '#f97316' : '#cbd5e1',
                  color: '#fff',
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '14px'
                }}
              >
                •
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>Cooking</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>In Kitchen</div>
            </div>

            <div style={{ flex: 1, height: '2px', backgroundColor: currentStage === 'Served' ? '#16a34a' : '#cbd5e1' }} />

            {/* Step 3: Ready / Served */}
            <div style={{ textAlign: 'center', zIndex: 2, flex: 1 }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
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
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>
                {currentStage === 'Served' ? 'Served' : 'Ready / Served'}
              </div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>
                {currentStage === 'Served' ? 'Enjoy your meal!' : 'Est. 19:45'}
              </div>
            </div>
          </div>
        </div>

        {/* Current Dish Statuses List matching SCR-CUST-04 */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
            CURRENT DISH STATUSES:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {items.map((item) => {
              let badgeClass = 'badge-pending';
              if (item.status === 'Cooking') badgeClass = 'badge-cooking';
              if (item.status === 'Ready') badgeClass = 'badge-ready';
              if (item.status === 'Served') badgeClass = 'badge-served';

              return (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                      {item.quantity}x {item.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      {item.station} {item.modifier && item.modifier !== 'Default' ? `• ${item.modifier}` : ''}
                    </div>
                  </div>

                  <span className={`badge ${badgeClass}`}>{item.status}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assistance Actions with Spam-Prevention Cooldown (Validated Improvement) */}
        <div
          style={{
            marginTop: '20px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '12px'
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
            Need assistance at Table 05?
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleCallWaiter}
              disabled={waiterCallCooldown > 0}
              style={{
                flex: 1,
                minHeight: '44px',
                backgroundColor: waiterCallCooldown > 0 ? '#f1f5f9' : '#ffffff',
                border: '1px solid',
                borderColor: waiterCallCooldown > 0 ? '#e2e8f0' : '#cbd5e1',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                color: waiterCallCooldown > 0 ? '#94a3b8' : '#0f172a'
              }}
            >
              {waiterCallCooldown > 0 ? `⏳ WAITER CALLED (${waiterCallCooldown}s)` : '🙋 CALL WAITER'}
            </button>

            <button
              onClick={handleRequestBill}
              disabled={billCallCooldown > 0}
              style={{
                flex: 1,
                minHeight: '44px',
                backgroundColor: billCallCooldown > 0 ? '#f1f5f9' : '#ffffff',
                border: '1px solid',
                borderColor: billCallCooldown > 0 ? '#e2e8f0' : '#cbd5e1',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                color: billCallCooldown > 0 ? '#94a3b8' : '#0f172a'
              }}
            >
              {billCallCooldown > 0 ? `⏳ BILL REQUESTED (${billCallCooldown}s)` : '🧾 PRE-PRINT BILL'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
