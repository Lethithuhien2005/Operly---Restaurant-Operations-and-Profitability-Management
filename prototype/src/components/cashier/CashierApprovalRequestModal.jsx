import React, { useState } from 'react';

/**
 * CashierApprovalRequestModal
 * Modal allowing POS Cashier to escalate Void Dish or Discount Override
 * requests directly to the Duty Manager Approvals Queue (SCR-POS-01 -> SCR-MGR-01).
 */
export const CashierApprovalRequestModal = ({
  isOpen,
  onClose,
  initialData = {},
  onSubmitApproval
}) => {
  if (!isOpen) return null;

  const defaultType = initialData.type || 'Void Dish';
  const [requestType, setRequestType] = useState(defaultType);
  const [urgency, setUrgency] = useState('High');
  const [targetTable, setTargetTable] = useState(initialData.table || 'Table 08');
  const [dishName, setDishName] = useState(initialData.item?.name || 'Seafood Spicy Hotpot');
  const [amount, setAmount] = useState(
    initialData.item ? initialData.item.price * initialData.item.quantity : initialData.subtotal || 280000
  );
  const [reasonCategory, setReasonCategory] = useState(
    requestType === 'Void Dish' ? 'Guest Allergy / Dietary Change' : 'VIP Owner Invitation'
  );
  const [notes, setNotes] = useState('');

  const voidReasons = [
    'Guest Allergy / Dietary Change',
    'Customer Cancelled Before Cooking',
    'Accidental Duplicate Keying',
    'Kitchen Delay Exceeded 30 Mins',
    'Customer Dissatisfaction'
  ];

  const discountReasons = [
    'VIP Owner Invitation (Exceeds 40% Policy Cap)',
    'Corporate Banquet Partner Agreement',
    'Customer Service Recovery Compensation',
    'Staff Family Special Discount (50%)'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      type: requestType,
      category: requestType === 'Void Dish' ? 'Billing' : 'Policy',
      urgency,
      title:
        requestType === 'Void Dish'
          ? `Void Dish: ${dishName} (${targetTable})`
          : `Discount Override (${targetTable})`,
      table: targetTable,
      amount: Number(amount),
      reason: reasonCategory,
      details: notes.trim()
        ? `${reasonCategory}. Additional details: ${notes.trim()}`
        : `${reasonCategory}. Dispatched from POS Terminal 01 by Cashier Mai Le.`
    };

    if (onSubmitApproval) {
      onSubmitApproval(payload);
    }
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 1350,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: '#0f766e',
            color: '#ffffff',
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>⚡</span>
            <span style={{ fontSize: '15px', fontWeight: 900 }}>
              ESCALATE APPROVAL TO MANAGER
            </span>
          </div>

          <button
            onClick={onClose}
            style={{ color: '#ffffff', fontSize: '18px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Request Type Toggle */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155' }}>
              ESCALATION CATEGORY:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
              {['Void Dish', 'Discount Override'].map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => {
                    setRequestType(type);
                    setReasonCategory(type === 'Void Dish' ? voidReasons[0] : discountReasons[0]);
                  }}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    border: requestType === type ? '2px solid #0f766e' : '1px solid #cbd5e1',
                    backgroundColor: requestType === type ? '#f0fdfa' : '#ffffff',
                    fontWeight: 700,
                    fontSize: '12px',
                    color: requestType === type ? '#0f766e' : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  {type === 'Void Dish' ? '🗑️ Void Dish' : '🏷️ Discount Override'}
                </button>
              ))}
            </div>
          </div>

          {/* Table & Amount Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                Table / Session:
              </label>
              <input
                type="text"
                value={targetTable}
                onChange={(e) => setTargetTable(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  marginTop: '4px'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                Financial Impact (VND):
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  marginTop: '4px'
                }}
              />
            </div>
          </div>

          {/* Dish Name (if Void) */}
          {requestType === 'Void Dish' && (
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                Dish to Void:
              </label>
              <input
                type="text"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  marginTop: '4px'
                }}
              />
            </div>
          )}

          {/* Reason Category Dropdown */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
              Standard Justification:
            </label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                marginTop: '4px',
                backgroundColor: '#ffffff'
              }}
            >
              {(requestType === 'Void Dish' ? voidReasons : discountReasons).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Urgency Selector */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
              Urgency Level:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '4px' }}>
              {['Medium', 'High', 'Critical'].map((level) => {
                const isSelected = urgency === level;
                return (
                  <button
                    type="button"
                    key={level}
                    onClick={() => setUrgency(level)}
                    style={{
                      padding: '6px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      border: isSelected ? '2px solid' : '1px solid #cbd5e1',
                      borderColor: isSelected
                        ? level === 'Critical'
                          ? '#ef4444'
                          : level === 'High'
                          ? '#f59e0b'
                          : '#0f766e'
                        : '#cbd5e1',
                      backgroundColor: isSelected
                        ? level === 'Critical'
                          ? '#fef2f2'
                          : level === 'High'
                          ? '#fffbeb'
                          : '#f0fdfa'
                        : '#ffffff',
                      color: isSelected
                        ? level === 'Critical'
                          ? '#991b1b'
                          : level === 'High'
                          ? '#b45309'
                          : '#0f766e'
                        : '#475569'
                    }}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Freeform Notes */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
              Additional Context / Explanation:
            </label>
            <textarea
              rows={3}
              placeholder="Provide operational reason or verification passcode details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                marginTop: '4px',
                resize: 'none'
              }}
            />
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '10px',
              borderTop: '1px solid #f1f5f9',
              paddingTop: '14px'
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={{
                padding: '8px 20px',
                borderRadius: '6px',
                backgroundColor: '#0f766e',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🚀 Dispatch to Manager Queue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
