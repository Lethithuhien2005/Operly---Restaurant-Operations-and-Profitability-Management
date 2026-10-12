import React from 'react';
import { Sparkles, Plus } from 'lucide-react';
import { useMockStore } from '../../store/mockStore';

export const CustomerAIRecommendations = ({ onQuickAddDish, activeDishIds = [] }) => {
  const { menuItems, MOCK_AI_PAIRINGS_DATA } = useMockStore();

  // Curated Apriori recommendations based on current cart or popular pairings
  const recommendations = [
    {
      dishId: 'DISH-104',
      name: 'US Beef Slices',
      price: 80000,
      confidence: 88,
      reason: 'Frequently dipped in Hotpot',
      image: '🥓'
    },
    {
      dishId: 'DISH-105',
      name: 'Iced Herbal Tea',
      price: 25000,
      confidence: 76,
      reason: 'Cooling balance for spicy soup',
      image: '🍵'
    },
    {
      dishId: 'DISH-106',
      name: 'Spring Rolls Platter',
      price: 150000,
      confidence: 64,
      reason: 'Popular starter pairing',
      image: '🥟'
    }
  ];

  return (
    <div
      style={{
        backgroundColor: '#f0fdf4',
        border: '1.5px solid #86efac',
        borderRadius: '12px',
        padding: '12px',
        marginBottom: '16px'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '11px',
          fontWeight: 800,
          color: '#166534',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginBottom: '8px'
        }}
      >
        <Sparkles size={14} color="#16a34a" />
        <span>FREQUENTLY PAIRED WITH (AI RECOMMENDATION)</span>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '4px'
        }}
      >
        {recommendations.map((rec) => {
          const menuItem = menuItems.find((m) => m.id === rec.dishId);
          const is86 = menuItem?.is86;

          return (
            <div
              key={rec.dishId}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #bbf7d0',
                borderRadius: '10px',
                padding: '10px',
                minWidth: '200px',
                maxWidth: '220px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '8px',
                flexShrink: 0,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>{rec.image}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#14532d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {rec.name}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a' }}>
                      +{rec.price.toLocaleString()} VND
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span
                    style={{
                      backgroundColor: '#dcfce7',
                      color: '#15803d',
                      fontSize: '9px',
                      fontWeight: 800,
                      padding: '1px 5px',
                      borderRadius: '4px'
                    }}
                  >
                    {rec.confidence}% Match
                  </span>
                  <span style={{ fontSize: '10px', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {rec.reason}
                  </span>
                </div>
              </div>

              {!is86 ? (
                <button
                  onClick={() => {
                    if (menuItem) onQuickAddDish(menuItem);
                  }}
                  style={{
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    width: '100%',
                    boxShadow: '0 1px 2px rgba(22, 163, 74, 0.2)'
                  }}
                  title="1-tap quick add paired item to cart"
                >
                  <Plus size={12} strokeWidth={3} />
                  <span>Quick Add</span>
                </button>
              ) : (
                <span style={{ fontSize: '10px', color: '#ef4444', textAlign: 'center', fontWeight: 600 }}>
                  Sold Out (86'd)
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
