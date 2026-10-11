import React from 'react';
import { ShoppingBag, Users, Trash2, Plus, Minus, ArrowRight, Sparkles, Radio } from 'lucide-react';
import { useMockStore } from '../../store/mockStore';

export const CustomerSharedCart = ({ onSubmitOrder, onScrollToMenu }) => {
  const {
    cartItems,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    simulateGuestBOrder,
    activeMember
  } = useMockStore();

  const rawSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountPct = activeMember?.tierDiscountPct || 0;
  const discountAmount = Math.round((rawSubtotal * discountPct) / 100);
  const finalTotal = Math.max(0, rawSubtotal - discountAmount);

  const guestAItems = cartItems.filter((i) => i.addedBy.includes('Guest-A'));
  const guestBItems = cartItems.filter((i) => i.addedBy.includes('Guest-B'));

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '2px solid #0f766e',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(15, 118, 110, 0.12)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      {/* Header with Live Sync Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingBag size={18} color="#0f766e" />
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
            SHARED TABLE CART ({cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'})
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              display: 'inline-block'
            }}
          />
          <span style={{ fontSize: '11px', color: '#0f766e', fontWeight: 700 }}>
            WebSocket Live Sync
          </span>
        </div>
      </div>

      {/* Cart Content: Empty vs Populated */}
      {cartItems.length === 0 ? (
        <div
          style={{
            padding: '24px 12px',
            textAlign: 'center',
            color: '#64748b',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <div style={{ fontSize: '32px' }}>🛒</div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
            Shared Cart is Empty
          </div>
          <p style={{ fontSize: '12px', maxWidth: '280px', lineHeight: 1.4 }}>
            Browse the menu above and tap "+ Add" to populate the shared table cart with your companions.
          </p>

          <button
            onClick={simulateGuestBOrder}
            style={{
              marginTop: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: '#f0fdfa',
              border: '1px solid #0f766e',
              color: '#0f766e',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            title="Simulate Guest-B adding an item over WebSocket"
          >
            <Users size={12} />
            <span>Simulate Companion (Guest-B) Adding Item</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Line items list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
            {cartItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 10px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  gap: '8px'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                      {item.name}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        backgroundColor: item.addedBy.includes('Guest-A') ? '#e0f2fe' : '#fef3c7',
                        color: item.addedBy.includes('Guest-A') ? '#0284c7' : '#b45309',
                        padding: '1px 5px',
                        borderRadius: '4px'
                      }}
                    >
                      {item.addedBy}
                    </span>
                  </div>

                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    {item.modifier !== 'Default' ? item.modifier : 'Standard'}
                    {item.specialNotes ? ` • Note: ${item.specialNotes}` : ''}
                  </div>
                </div>

                {/* Stepper & Price */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '2px' }}>
                    <button
                      onClick={() => updateCartItemQuantity(item.id, -1)}
                      style={{
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b',
                        cursor: 'pointer'
                      }}
                      title="Decrease quantity"
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ fontSize: '12px', fontWeight: 800, minWidth: '16px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartItemQuantity(item.id, 1)}
                      style={{
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b',
                        cursor: 'pointer'
                      }}
                      title="Increase quantity"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: '72px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f766e', fontFamily: 'var(--font-mono)' }}>
                      {(item.price * item.quantity).toLocaleString()} VND
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{ color: '#ef4444', padding: '4px', cursor: 'pointer' }}
                    title="Remove item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Multi-Diner Sync Simulation Action */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
            <button
              onClick={simulateGuestBOrder}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                color: '#0284c7',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Simulate companion on Table 05 adding an item via WebSocket"
            >
              <Users size={12} />
              <span>Simulate Guest-B adding dish</span>
            </button>

            <button
              onClick={clearCart}
              style={{ fontSize: '11px', color: '#94a3b8', cursor: 'pointer' }}
            >
              Clear Cart
            </button>
          </div>

          {/* Pricing Breakdown */}
          <div
            style={{
              paddingTop: '8px',
              borderTop: '1px dashed #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
              <span>Subtotal ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items):</span>
              <span>{rawSubtotal.toLocaleString()} VND</span>
            </div>

            {activeMember && discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#b45309', fontWeight: 700 }}>
                <span>{activeMember.tier} VIP Discount ({discountPct}%):</span>
                <span>-{discountAmount.toLocaleString()} VND</span>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '15px',
                fontWeight: 900,
                color: '#0f172a',
                paddingTop: '4px'
              }}
            >
              <span>Total Cart Value:</span>
              <span style={{ color: '#0f766e', fontFamily: 'var(--font-mono)' }}>
                {finalTotal.toLocaleString()} VND
              </span>
            </div>
          </div>

          {/* Thumb-Zone Submit Order Button (Min-Height >= 48px) */}
          <button
            onClick={onSubmitOrder}
            style={{
              width: '100%',
              minHeight: '48px',
              backgroundColor: '#0f766e',
              color: '#ffffff',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 6px rgba(15, 118, 110, 0.3)',
              cursor: 'pointer',
              marginTop: '4px'
            }}
            title="Lock prices and submit table order to kitchen display"
          >
            <span>SUBMIT ORDER TO KITCHEN (LOCKED & SYNCED)</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
