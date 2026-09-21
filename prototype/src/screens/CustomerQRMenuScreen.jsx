import React, { useState } from 'react';
import { useMockStore } from '../store/mockStore';
import { MOCK_AI_PAIRINGS } from '../mock/data';

export const CustomerQRMenuScreen = () => {
  const {
    menuItems,
    cartItems,
    addToCart,
    removeFromCart,
    submitCustomerOrder,
    setCustomerScreen
  } = useMockStore();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedModifiers, setSelectedModifiers] = useState({
    'DISH-101': 'Less Spicy',
    'DISH-102': 'Medium Rare',
    'DISH-105': 'Less Sweet'
  });

  const categories = ['All', 'Hotpot', 'BBQ / Grill', 'Appetizers', 'Drinks'];

  const filteredDishes = menuItems.filter(
    (dish) => selectedCategory === 'All' || dish.category === selectedCategory
  );

  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="device-mobile" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Header matching SCR-CUST-03 */}
      <div style={{ backgroundColor: '#0f766e', color: '#fff', padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '16px' }}>Table 05 | Floor 1</span>
              <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px' }}>
                Guest Mode
              </span>
            </div>
            <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '2px' }}>
              Shared with: Guest-A (You), Guest-B
            </div>
          </div>
          <button
            onClick={() => setCustomerScreen('progress')}
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            Track Order ➔
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '10px 14px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          overflowX: 'auto'
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: selectedCategory === cat ? 700 : 500,
              backgroundColor: selectedCategory === cat ? '#0f766e' : '#ffffff',
              color: selectedCategory === cat ? '#ffffff' : '#475569',
              border: '1px solid',
              borderColor: selectedCategory === cat ? '#0f766e' : '#cbd5e1',
              whiteSpace: 'nowrap'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Menu Scrollable Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
        {/* Menu Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredDishes.map((dish) => {
            const hasPairings = MOCK_AI_PAIRINGS[dish.id];
            const is86 = dish.is86;

            return (
              <div
                key={dish.id}
                style={{
                  backgroundColor: is86 ? '#f8fafc' : '#ffffff',
                  border: is86 ? '1px dashed #cbd5e1' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px',
                  opacity: is86 ? 0.65 : 1,
                  boxShadow: is86 ? 'none' : '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      backgroundColor: '#f1f5f9',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '28px',
                      flexShrink: 0
                    }}
                  >
                    {dish.image}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{dish.name}</h3>
                      {is86 && (
                        <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          86'D OUT
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{dish.description}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f766e' }}>
                        {dish.price.toLocaleString()} VND
                      </span>

                      {dish.modifiers.length > 0 && !is86 && (
                        <select
                          value={selectedModifiers[dish.id] || dish.modifiers[0]?.name}
                          onChange={(e) =>
                            setSelectedModifiers((prev) => ({ ...prev, [dish.id]: e.target.value }))
                          }
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '11px',
                            backgroundColor: '#fff'
                          }}
                        >
                          {dish.modifiers.map((mod) => (
                            <option key={mod.id} value={mod.name}>
                              {mod.name}
                            </option>
                          ))}
                        </select>
                      )}

                      {!is86 ? (
                        <button
                          onClick={() => addToCart(dish, selectedModifiers[dish.id] || 'Default', 'Guest-A (You)')}
                          style={{
                            backgroundColor: '#0f766e',
                            color: '#fff',
                            minWidth: '48px',
                            minHeight: '36px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700
                          }}
                        >
                          + ADD
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600 }}>Unavailable</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Recommender Carousel for hotpot / main item (FR-004 & SCR-CUST-03) */}
                {hasPairings && !is86 && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '10px',
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: '#166534', marginBottom: '6px' }}>
                      <span>✨</span>
                      <span>FREQUENTLY PAIRED WITH (AI RECOMMENDATION)</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
                      {hasPairings.map((pair) => (
                        <div
                          key={pair.dishId}
                          style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #bbf7d0',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            flexShrink: 0
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#14532d' }}>{pair.name}</div>
                            <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: 600 }}>
                              +{pair.price.toLocaleString()} VND
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const pairedDish = menuItems.find((m) => m.id === pair.dishId);
                              if (pairedDish) addToCart(pairedDish, 'Default', 'Guest-A (You)');
                            }}
                            style={{
                              backgroundColor: '#16a34a',
                              color: '#fff',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 700
                            }}
                          >
                            + Quick Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Shared Table Cart Box matching SCR-CUST-03 */}
        <div
          style={{
            marginTop: '16px',
            backgroundColor: '#ffffff',
            border: '2px solid #0f766e',
            borderRadius: '12px',
            padding: '14px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
              SHARED TABLE CART ({cartItems.length} Items)
            </span>
            <span style={{ fontSize: '11px', color: '#0f766e', fontWeight: 600 }}>Live Sync Active</span>
          </div>

          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px', color: '#94a3b8', fontSize: '12px' }}>
              Cart is currently empty. Add dishes above.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                    borderBottom: '1px dashed #f1f5f9',
                    paddingBottom: '6px'
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600 }}>
                      {item.quantity}x {item.name}
                    </span>
                    {item.modifier !== 'Default' && (
                      <span style={{ color: '#64748b', fontSize: '11px', marginLeft: '4px' }}>
                        ({item.modifier})
                      </span>
                    )}
                    <span style={{ marginLeft: '6px', fontSize: '10px', color: '#0284c7', backgroundColor: '#e0f2fe', padding: '1px 5px', borderRadius: '4px' }}>
                      {item.addedBy}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700 }}>{(item.price * item.quantity).toLocaleString()} VND</span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{ color: '#ef4444', fontSize: '14px', fontWeight: 700 }}
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '8px',
                  fontWeight: 800,
                  fontSize: '14px',
                  color: '#0f172a'
                }}
              >
                <span>Total Cart Value:</span>
                <span style={{ color: '#0f766e' }}>{cartTotal.toLocaleString()} VND</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Action Drawer matching Thumb-Zone optimization */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.05)'
        }}
      >
        <button
          onClick={submitCustomerOrder}
          disabled={cartItems.length === 0}
          style={{
            width: '100%',
            minHeight: '48px',
            backgroundColor: cartItems.length > 0 ? '#0f766e' : '#94a3b8',
            color: '#ffffff',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: cartItems.length > 0 ? '0 4px 6px rgba(15, 118, 110, 0.3)' : 'none'
          }}
        >
          <span>SUBMIT ORDER TO KITCHEN (LOCKED & SYNCED)</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
};
