import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingBag, Sparkles } from 'lucide-react';

export const CustomerDishModal = ({ isOpen, dish, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedModifier, setSelectedModifier] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [selectedDiner, setSelectedDiner] = useState('Guest-A (You)');

  useEffect(() => {
    if (dish) {
      setQuantity(1);
      setSelectedModifier(dish.modifiers?.[0]?.name || 'Default');
      setSpecialNotes('');
      setSelectedDiner('Guest-A (You)');
    }
  }, [dish]);

  if (!isOpen || !dish) return null;

  const quickNoteChips = ['No Cilantro', 'Less Spicy', 'Extra Sauce', 'Allergy: Peanuts', 'Well Done'];

  const handleAddChip = (chip) => {
    if (specialNotes.includes(chip)) return;
    setSpecialNotes((prev) => (prev ? `${prev}, ${chip}` : chip));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onAddToCart(dish, selectedModifier, selectedDiner, quantity, specialNotes.trim());
    onClose();
  };

  const totalLinePrice = dish.price * quantity;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-card"
        style={{
          maxWidth: '440px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          color: '#0f172a'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8fafc'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>{dish.image}</span>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                {dish.name}
              </h3>
              <p style={{ fontSize: '11px', color: '#64748b' }}>
                {dish.category} • {dish.station}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ color: '#64748b', padding: '6px', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Customization Content */}
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Description */}
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
              {dish.description}
            </p>

            {/* Modifier Selection */}
            {dish.modifiers && dish.modifiers.length > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Preparation Style / Modifier *
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {dish.modifiers.map((mod) => {
                    const isSelected = selectedModifier === mod.name;
                    return (
                      <button
                        type="button"
                        key={mod.id}
                        onClick={() => setSelectedModifier(mod.name)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: isSelected ? 800 : 600,
                          backgroundColor: isSelected ? '#0f766e' : '#f8fafc',
                          color: isSelected ? '#ffffff' : '#334155',
                          border: `1.5px solid ${isSelected ? '#0f766e' : '#cbd5e1'}`,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {mod.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Special Instructions & Dietary Tags */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '6px' }}>
                Kitchen Notes & Dietary Requests
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Extra spicy broth, no cilantro, dressing on side..."
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  resize: 'none'
                }}
              />
              {/* Quick Suggestion Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                {quickNoteChips.map((chip) => (
                  <button
                    type="button"
                    key={chip}
                    onClick={() => handleAddChip(chip)}
                    style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      color: '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Diner Attribution */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '8px' }}>
                Ordered For (Multi-Diner Tag)
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['Guest-A (You)', 'Guest-B'].map((diner) => {
                  const isSelected = selectedDiner === diner;
                  return (
                    <button
                      type="button"
                      key={diner}
                      onClick={() => setSelectedDiner(diner)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: isSelected ? 800 : 600,
                        backgroundColor: isSelected ? '#0284c7' : '#f8fafc',
                        color: isSelected ? '#ffffff' : '#475569',
                        border: `1.5px solid ${isSelected ? '#0284c7' : '#cbd5e1'}`,
                        cursor: 'pointer'
                      }}
                    >
                      {diner}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '8px' }}>
                Quantity
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f8fafc',
                    color: '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Minus size={16} />
                </button>

                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    minWidth: '32px',
                    textAlign: 'center'
                  }}
                >
                  {quantity}
                </div>

                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f8fafc',
                    color: '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Submit Bar */}
          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Item Total</div>
              <div style={{ fontSize: '16px', fontWeight: 900, color: '#0f766e', fontFamily: 'var(--font-mono)' }}>
                {totalLinePrice.toLocaleString()} VND
              </div>
            </div>

            <button
              type="submit"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                minHeight: '48px',
                backgroundColor: '#0f766e',
                color: '#ffffff',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 800,
                boxShadow: '0 4px 6px rgba(15, 118, 110, 0.3)',
                cursor: 'pointer'
              }}
            >
              <ShoppingBag size={16} />
              <span>Add to Shared Cart</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
