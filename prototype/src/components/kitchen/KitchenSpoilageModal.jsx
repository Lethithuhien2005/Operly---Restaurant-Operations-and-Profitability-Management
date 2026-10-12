import React, { useState } from 'react';
import { AlertOctagon, RotateCcw, X, DollarSign, FileText } from 'lucide-react';

export const KitchenSpoilageModal = ({ isOpen, onClose, targetItem, ticketId, onConfirmSpoilage }) => {
  const [reason, setReason] = useState('Overcooked / Burnt');
  const [quantity, setQuantity] = useState(1);
  const [shouldRefire, setShouldRefire] = useState(true);
  const [notes, setNotes] = useState('');

  if (!isOpen || !targetItem) return null;

  const reasons = [
    { id: 'Overcooked / Burnt', label: 'Overcooked / Burnt', icon: '🔥' },
    { id: 'Dropped Plate', label: 'Dropped Plate / Spill', icon: '💥' },
    { id: 'Modifier Mistake', label: 'Preparation / Modifier Mistake', icon: '📋' },
    { id: 'Quality Issue', label: 'Quality Issue / Ingredient Expired', icon: '⚠️' }
  ];

  // Approximate BOM waste cost: ~40% of retail price or default 65,000 VND
  const estimatedUnitCost = targetItem.price ? Math.round(targetItem.price * 0.4) : 65000;
  const totalWasteLoss = estimatedUnitCost * quantity;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmSpoilage(ticketId, targetItem.id, reason, totalWasteLoss, notes, shouldRefire);
    onClose();
  };

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
          maxWidth: '520px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
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
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444'
              }}
            >
              <AlertOctagon size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc' }}>
                LOG KITCHEN SPOILAGE
              </h3>
              <p style={{ fontSize: '11px', color: '#94a3b8' }}>
                SCR-KDS-03 • Wastage Audit & Re-fire System
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              color: '#94a3b8',
              padding: '6px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Target Item Summary */}
          <div
            style={{
              backgroundColor: '#0f172a',
              borderRadius: '8px',
              padding: '12px 14px',
              border: '1px solid #334155',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc' }}>
                {targetItem.name}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                Ticket #{ticketId} • {targetItem.station}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Current Qty</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#38bdf8' }}>
                {targetItem.quantity}
              </div>
            </div>
          </div>

          {/* Reason Selection */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                color: '#cbd5e1',
                marginBottom: '8px'
              }}
            >
              Waste Reason *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {reasons.map((r) => {
                const isSelected = reason === r.id;
                return (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => setReason(r.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: isSelected ? 800 : 600,
                      backgroundColor: isSelected ? 'rgba(239, 68, 68, 0.2)' : '#0f172a',
                      border: `1.5px solid ${isSelected ? '#ef4444' : '#334155'}`,
                      color: isSelected ? '#ffffff' : '#94a3b8',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span>{r.icon}</span>
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Stepper & Cost Impact */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#cbd5e1',
                  marginBottom: '6px'
                }}
              >
                Spoiled Quantity
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    color: '#fff',
                    fontSize: '18px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  -
                </button>
                <div
                  style={{
                    flex: 1,
                    height: '40px',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 800,
                    color: '#f8fafc',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {quantity}
                </div>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.min(targetItem.quantity, prev + 1))}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    color: '#fff',
                    fontSize: '18px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#cbd5e1',
                  marginBottom: '6px'
                }}
              >
                Estimated Waste Loss
              </label>
              <div
                style={{
                  height: '40px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 12px',
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#fca5a5',
                  gap: '6px'
                }}
              >
                <DollarSign size={14} />
                <span>{totalWasteLoss.toLocaleString()} VND</span>
              </div>
            </div>
          </div>

          {/* Explanation Notes */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                color: '#cbd5e1',
                marginBottom: '6px'
              }}
            >
              Chef / Cook Incident Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Dropped during plating transfer, re-cooking immediately..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                color: '#f8fafc',
                fontSize: '12px',
                resize: 'none'
              }}
            />
          </div>

          {/* Re-fire Option Checkbox */}
          <div
            onClick={() => setShouldRefire(!shouldRefire)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              backgroundColor: shouldRefire ? 'rgba(56, 189, 248, 0.1)' : '#0f172a',
              border: `1px solid ${shouldRefire ? '#38bdf8' : '#334155'}`,
              borderRadius: '8px',
              padding: '12px 14px',
              cursor: 'pointer'
            }}
          >
            <input
              type="checkbox"
              checked={shouldRefire}
              onChange={(e) => setShouldRefire(e.target.checked)}
              style={{ marginTop: '2px', cursor: 'pointer' }}
            />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc' }}>
                Automatically Re-fire Item (Keep Ticket Active)
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                Maintains this ticket in the Cooking queue with an urgent [RE-FIRE] indicator without charging the customer again.
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px',
                minHeight: '44px',
                backgroundColor: '#334155',
                color: '#f8fafc',
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                minHeight: '44px',
                backgroundColor: shouldRefire ? '#ea580c' : '#dc2626',
                color: '#ffffff',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              <RotateCcw size={15} />
              <span>{shouldRefire ? 'CONFIRM SPOILAGE & RE-FIRE' : 'CONFIRM WRITE-OFF'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
