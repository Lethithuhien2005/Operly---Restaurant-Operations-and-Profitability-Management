import React, { useState } from 'react';
import { Search, Ban, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export const Kitchen86Modal = ({ isOpen, onClose, menuItems, onToggle86 }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  if (!isOpen) return null;

  const categories = ['All', 'Hotpot', 'BBQ / Grill', 'Appetizers', 'Drinks'];

  const filteredItems = menuItems.filter((dish) => {
    const matchesSearch =
      dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || dish.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const outOfStockItems = filteredItems.filter((dish) => dish.is86);
  const inStockItems = filteredItems.filter((dish) => !dish.is86);

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-card modal-dark"
        style={{
          maxWidth: '620px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #334155',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#0f172a'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(220, 38, 38, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444'
              }}
            >
              <Ban size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.02em' }}>
                86 ITEM MANAGEMENT
              </h3>
              <p style={{ fontSize: '11px', color: '#94a3b8' }}>
                Instant Menu Disable • Pushes live WebSocket update to diner QR carts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              color: '#94a3b8',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Controls: Search and Category Pills */}
        <div style={{ padding: '16px 20px 8px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: '12px', color: '#64748b', pointerEvents: 'none' }}
            />
            <input
              type="text"
              placeholder="Search ingredient or dish name (e.g. Salmon, Hotpot)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                borderRadius: '8px',
                backgroundColor: '#0f172a',
                border: '1px solid #475569',
                color: '#ffffff',
                fontSize: '13px'
              }}
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  color: '#94a3b8',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: isSelected ? 800 : 600,
                    backgroundColor: isSelected ? '#0284c7' : '#0f172a',
                    color: isSelected ? '#ffffff' : '#94a3b8',
                    border: isSelected ? '1px solid #38bdf8' : '1px solid #334155',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dishes List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px 20px 16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {/* Section 1: Currently 86'd Items */}
          {outOfStockItems.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#ef4444',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <AlertTriangle size={13} />
                <span>Currently 86'd Dishes ({outOfStockItems.length})</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {outOfStockItems.map((dish) => (
                  <div
                    key={dish.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      borderRadius: '8px',
                      border: '1px solid #ef4444',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>{dish.image}</span>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc' }}>
                          {dish.name}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#fca5a5', marginTop: '3px' }}>
                        {dish.disabledReason || 'Marked 86 by Kitchen Staff'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                        {dish.station} • {dish.price.toLocaleString()} VND
                      </div>
                    </div>

                    <button
                      onClick={() => onToggle86(dish.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#16a34a',
                        color: '#ffffff',
                        minHeight: '44px',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 4px rgba(22, 163, 74, 0.3)'
                      }}
                      title="Restore item back to menu"
                    >
                      <CheckCircle2 size={16} />
                      <span>UN-86 RESTORE</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: In-Stock Available Dishes */}
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#94a3b8',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}
            >
              Available Menu Dishes ({inStockItems.length})
            </div>

            {inStockItems.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                No dishes found matching search criteria.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {inStockItems.map((dish) => (
                  <div
                    key={dish.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      border: '1px solid #334155',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>{dish.image}</span>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc' }}>
                          {dish.name}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
                        {dish.station} • {dish.price.toLocaleString()} VND
                      </div>
                    </div>

                    <button
                      onClick={() => onToggle86(dish.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#dc2626',
                        color: '#ffffff',
                        minHeight: '44px',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)'
                      }}
                      title="Disable this item immediately across the restaurant"
                    >
                      <Ban size={15} />
                      <span>86 NOW</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid #334155',
            backgroundColor: '#0f172a',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            Tip: 86'd items are removed from customer carts in real time.
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#334155',
              color: '#ffffff',
              minHeight: '40px',
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
