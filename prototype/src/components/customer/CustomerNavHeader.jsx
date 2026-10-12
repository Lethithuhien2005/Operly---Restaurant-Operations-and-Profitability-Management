import React, { useState } from 'react';
import { Utensils, Clock, CalendarDays, User, ShoppingBag, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { useMockStore } from '../../store/mockStore';

export const CustomerNavHeader = ({ activeTab, onSelectTab, cartItemCount, onOpenCart }) => {
  const { activeMember, loginMember, logoutMember, tables } = useMockStore();
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState('0912345678');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const success = loginMember(phoneInput.trim());
    if (success) {
      setIsMemberModalOpen(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0f766e', color: '#ffffff' }}>
      {/* Top Bar: Table Context, Member Badge, Cart Pill */}
      <div
        style={{
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '-0.01em' }}>
              Table 05 | Floor 1
            </span>

            {/* Member vs Guest Mode Pill */}
            {activeMember ? (
              <span
                style={{
                  backgroundColor: '#f59e0b',
                  color: '#78350f',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>★</span>
                <span>{activeMember.tier} VIP ({activeMember.tierDiscountPct}% OFF)</span>
              </span>
            ) : (
              <span
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: 700
                }}
              >
                Guest Mode
              </span>
            )}
          </div>

          <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '2px' }}>
            {activeMember
              ? `Member: ${activeMember.name} • Shared Table Cart`
              : 'Shared with: Guest-A (You), Guest-B'}
          </div>
        </div>

        {/* Member Login / Switcher & Cart Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {activeMember ? (
            <button
              onClick={logoutMember}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#fff',
                padding: '6px 8px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
              title="Logout to Guest Mode"
            >
              <LogOut size={13} />
              <span>Exit</span>
            </button>
          ) : (
            <button
              onClick={() => setIsMemberModalOpen(true)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#fff',
                padding: '6px 10px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
              title="Identify as Member to apply loyalty tier discounts"
            >
              <LogIn size={13} />
              <span>Member Mode</span>
            </button>
          )}

          {/* Quick Cart Pill Button */}
          {cartItemCount !== undefined && (
            <button
              onClick={onOpenCart}
              style={{
                backgroundColor: '#ffffff',
                color: '#0f766e',
                padding: '6px 12px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
                cursor: 'pointer'
              }}
              title="View Shared Table Cart"
            >
              <ShoppingBag size={14} strokeWidth={2.5} />
              <span>Cart ({cartItemCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Customer Navigation Tabs */}
      <nav
        style={{
          display: 'flex',
          backgroundColor: '#0d655e',
          padding: '4px 8px',
          gap: '4px',
          overflowX: 'auto'
        }}
        aria-label="Customer Navigation"
      >
        <button
          onClick={() => onSelectTab('menu')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px 10px',
            minHeight: '40px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: activeTab === 'menu' ? 800 : 600,
            backgroundColor: activeTab === 'menu' ? '#ffffff' : 'transparent',
            color: activeTab === 'menu' ? '#0f766e' : '#ccfbf1',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease'
          }}
        >
          <Utensils size={14} />
          <span>QR Menu</span>
        </button>

        <button
          onClick={() => onSelectTab('progress')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px 10px',
            minHeight: '40px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: activeTab === 'progress' ? 800 : 600,
            backgroundColor: activeTab === 'progress' ? '#ffffff' : 'transparent',
            color: activeTab === 'progress' ? '#0f766e' : '#ccfbf1',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease'
          }}
        >
          <Clock size={14} />
          <span>Meal Tracker</span>
        </button>

        <button
          onClick={() => onSelectTab('reserve')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px 10px',
            minHeight: '40px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: activeTab === 'reserve' ? 800 : 600,
            backgroundColor: activeTab === 'reserve' ? '#ffffff' : 'transparent',
            color: activeTab === 'reserve' ? '#0f766e' : '#ccfbf1',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease'
          }}
        >
          <CalendarDays size={14} />
          <span>Book Table</span>
        </button>

        <button
          onClick={() => onSelectTab('profile')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px 10px',
            minHeight: '40px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: activeTab === 'profile' ? 800 : 600,
            backgroundColor: activeTab === 'profile' ? '#ffffff' : 'transparent',
            color: activeTab === 'profile' ? '#0f766e' : '#ccfbf1',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease'
          }}
        >
          <User size={14} />
          <span>Loyalty</span>
        </button>
      </nav>

      {/* Member Identification Modal */}
      {isMemberModalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsMemberModalOpen(false);
          }}
        >
          <div
            className="modal-card"
            style={{
              padding: '20px',
              maxWidth: '380px',
              color: '#0f172a'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>👑</span>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                  Member Identification
                </h3>
              </div>
              <button
                onClick={() => setIsMemberModalOpen(false)}
                style={{ fontSize: '18px', color: '#64748b', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', lineHeight: 1.4 }}>
              Enter your registered loyalty mobile number to apply tier discounts (up to 10%) and earn reward points on this dine-in session.
            </p>

            <form onSubmit={handleLoginSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Mobile Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 0912345678"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    fontFamily: 'var(--font-mono)'
                  }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setPhoneInput('0912345678')}
                    style={{
                      fontSize: '11px',
                      color: '#0f766e',
                      backgroundColor: '#ccfbf1',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Use Gold (0912345678)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhoneInput('0905123456')}
                    style={{
                      fontSize: '11px',
                      color: '#0f766e',
                      backgroundColor: '#ccfbf1',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Use Silver (0905123456)
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    minHeight: '44px',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    padding: '10px',
                    minHeight: '44px',
                    backgroundColor: '#0f766e',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(15, 118, 110, 0.3)'
                  }}
                >
                  Verify & Apply Discount
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
