import React, { useState } from 'react';
import { User, Award, Calendar, Clock, CreditCard, ChevronRight, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { useMockStore } from '../../store/mockStore';

export const CustomerProfileView = ({ onNavigateToMenu, onNavigateToReserve }) => {
  const { activeMember, loginMember, logoutMember, reservations, tables, kdsTickets } = useMockStore();
  const [phoneInput, setPhoneInput] = useState('0912345678');
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'history'

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    loginMember(phoneInput.trim());
  };

  const table05 = tables.find((t) => t.id === 'T05');
  const table05Tickets = kdsTickets.filter((t) => t.tableId === 'T05');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#f8fafc', padding: '16px', overflowY: 'auto', gap: '16px' }}>
      {/* Member Profile or Guest Login Card */}
      {activeMember ? (
        <div
          style={{
            backgroundColor: '#0f766e',
            color: '#ffffff',
            borderRadius: '16px',
            padding: '18px',
            boxShadow: '0 4px 10px rgba(15, 118, 110, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px'
                }}
              >
                👑
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800 }}>{activeMember.name}</h3>
                <div style={{ fontSize: '12px', opacity: 0.85, fontFamily: 'var(--font-mono)' }}>
                  {activeMember.phone}
                </div>
              </div>
            </div>

            <button
              onClick={logoutMember}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Sign Out
            </button>
          </div>

          {/* Tier & Points Statistics */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              backgroundColor: 'rgba(0, 0, 0, 0.15)',
              borderRadius: '10px',
              padding: '12px'
            }}
          >
            <div>
              <div style={{ fontSize: '10px', opacity: 0.8, textTransform: 'uppercase', fontWeight: 700 }}>
                Loyalty Tier
              </div>
              <div style={{ fontSize: '16px', fontWeight: 900, color: '#fef08a' }}>
                {activeMember.tier} VIP
              </div>
              <div style={{ fontSize: '10px', opacity: 0.9 }}>
                {activeMember.tierDiscountPct}% Dine-in discount
              </div>
            </div>

            <div>
              <div style={{ fontSize: '10px', opacity: 0.8, textTransform: 'uppercase', fontWeight: 700 }}>
                Reward Points
              </div>
              <div style={{ fontSize: '16px', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                {activeMember.pointsBalance} Pts
              </div>
              <div style={{ fontSize: '10px', opacity: 0.9 }}>
                ≈ {(activeMember.pointsBalance * 100).toLocaleString()} VND Value
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '20px' }}>📱</span>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
              Member Identification (Guest Mode Active)
            </h3>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px', lineHeight: 1.4 }}>
            Sign in with your mobile number to view loyalty benefits, tier discounts, and booking history.
          </p>

          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="tel"
              placeholder="0912345678"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                fontFamily: 'var(--font-mono)'
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: '#0f766e',
                color: '#fff',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
          </form>

          <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={() => {
                setPhoneInput('0912345678');
                loginMember('0912345678');
              }}
              style={{ fontSize: '11px', color: '#0f766e', backgroundColor: '#ccfbf1', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
            >
              Test Gold (0912345678)
            </button>
            <button
              type="button"
              onClick={() => {
                setPhoneInput('0905123456');
                loginMember('0905123456');
              }}
              style={{ fontSize: '11px', color: '#0f766e', backgroundColor: '#ccfbf1', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
            >
              Test Silver (0905123456)
            </button>
          </div>
        </div>
      )}

      {/* Active Table Session Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
            Current Dine-in Session: Table 05
          </div>
          <span style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
            {table05?.status || 'Occupied'}
          </span>
        </div>

        <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
          <span>Accumulated Bill:</span>
          <span style={{ fontWeight: 800, color: '#0f766e', fontFamily: 'var(--font-mono)' }}>
            {(table05?.billAmount || 0).toLocaleString()} VND
          </span>
        </div>
        <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
          <span>Active Kitchen Tickets:</span>
          <span style={{ fontWeight: 700 }}>{table05Tickets.length} Tickets</span>
        </div>

        <button
          onClick={onNavigateToMenu}
          style={{
            marginTop: '10px',
            width: '100%',
            padding: '8px',
            backgroundColor: '#f0fdfa',
            border: '1px solid #0f766e',
            color: '#0f766e',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          View QR Ordering Menu ➔
        </button>
      </div>

      {/* Sub Tabs: Bookings vs History */}
      <div>
        <div style={{ display: 'flex', borderBottom: '1px solid #cbd5e1', marginBottom: '12px' }}>
          <button
            onClick={() => setActiveTab('bookings')}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: activeTab === 'bookings' ? 800 : 600,
              color: activeTab === 'bookings' ? '#0f766e' : '#64748b',
              borderBottom: activeTab === 'bookings' ? '2px solid #0f766e' : 'none',
              cursor: 'pointer'
            }}
          >
            Reservations ({reservations.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: activeTab === 'history' ? 800 : 600,
              color: activeTab === 'history' ? '#0f766e' : '#64748b',
              borderBottom: activeTab === 'history' ? '2px solid #0f766e' : 'none',
              cursor: 'pointer'
            }}
          >
            Order Activity ({table05Tickets.length})
          </button>
        </div>

        {/* Tab 1: Bookings List */}
        {activeTab === 'bookings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {reservations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '13px' }}>
                No active bookings found.
              </div>
            ) : (
              reservations.map((res) => (
                <div
                  key={res.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color="#0f766e" />
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                        {res.date} • {res.time}
                      </span>
                    </div>
                    <span
                      style={{
                        backgroundColor: res.status === 'Confirmed' ? '#dcfce7' : '#fee2e2',
                        color: res.status === 'Confirmed' ? '#166534' : '#991b1b',
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}
                    >
                      {res.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Code: <strong style={{ color: '#0f766e', fontFamily: 'var(--font-mono)' }}>{res.code}</strong> • {res.partySize} Guests • {res.area}
                  </div>

                  {res.depositPaid > 0 && (
                    <div style={{ fontSize: '11px', color: '#166534', fontWeight: 600 }}>
                      Advance Deposit: {res.depositPaid.toLocaleString()} VND (VietQR Verified)
                    </div>
                  )}
                </div>
              ))
            )}

            <button
              onClick={onNavigateToReserve}
              style={{
                marginTop: '6px',
                padding: '10px',
                backgroundColor: '#0f766e',
                color: '#ffffff',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              + Book Another Table
            </button>
          </div>
        )}

        {/* Tab 2: Order Activity */}
        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {table05Tickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '13px' }}>
                No orders placed in this session yet.
              </div>
            ) : (
              table05Tickets.map((ticket) => (
                <div
                  key={ticket.ticketId}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                      Ticket #{ticket.ticketId} ({ticket.placedAt})
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      {ticket.items.length} items
                    </span>
                  </div>

                  <div style={{ fontSize: '11px', color: '#475569' }}>
                    {ticket.items.map((i) => `${i.quantity}x ${i.name} [${i.status}]`).join(', ')}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
