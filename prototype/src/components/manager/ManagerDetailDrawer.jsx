import React, { useState, useEffect } from 'react';
import { useMockStore } from '../../store/mockStore';

export const ManagerDetailDrawer = () => {
  const {
    selectedApproval,
    isApprovalDrawerOpen,
    closeApprovalDrawer,
    approveRequest,
    rejectRequest
  } = useMockStore();

  const [notes, setNotes] = useState('');

  // Sync or reset notes when active item changes
  useEffect(() => {
    if (selectedApproval?.notes) {
      setNotes(selectedApproval.notes);
    } else {
      setNotes('');
    }
  }, [selectedApproval]);

  if (!isApprovalDrawerOpen || !selectedApproval) {
    return null;
  }

  const isPending = selectedApproval.status === 'Pending';
  const isApproved = selectedApproval.status === 'Approved';
  const isRejected = selectedApproval.status === 'Rejected';

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'Critical':
        return (
          <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <span className="pulse-indicator" /> CRITICAL
          </span>
        );
      case 'High':
        return (
          <span style={{ backgroundColor: '#ffedd5', color: '#9a3412', border: '1px solid #fed7aa', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
            HIGH PRIORITY
          </span>
        );
      case 'Medium':
        return (
          <span style={{ backgroundColor: '#fef9c3', color: '#854d0e', border: '1px solid #fef08a', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
            MEDIUM
          </span>
        );
      default:
        return (
          <span style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
            STANDARD
          </span>
        );
    }
  };

  const handleApprove = () => {
    approveRequest(selectedApproval.id, notes);
    closeApprovalDrawer();
  };

  const handleReject = () => {
    rejectRequest(selectedApproval.id, notes);
    closeApprovalDrawer();
  };

  return (
    <div className="manager-drawer-backdrop" onClick={closeApprovalDrawer}>
      <div
        className="manager-drawer-content"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        {/* Drawer Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#0f766e', backgroundColor: '#ccfbf1', padding: '2px 8px', borderRadius: '4px' }}>
                {selectedApproval.id}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                {selectedApproval.category}
              </span>
              {getUrgencyBadge(selectedApproval.urgency)}
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>
              {selectedApproval.title}
            </h3>
          </div>

          <button
            onClick={closeApprovalDrawer}
            style={{
              fontSize: '20px',
              color: '#64748b',
              padding: '6px 10px',
              borderRadius: '6px',
              backgroundColor: '#f1f5f9'
            }}
            title="Close drawer panel (ESC)"
          >
            ✕
          </button>
        </div>

        {/* Status Banner */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: isPending ? '#fffbeb' : isApproved ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${isPending ? '#fef08a' : isApproved ? '#a7f3d0' : '#fecaca'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>
              {isPending ? '⏳' : isApproved ? '✅' : '❌'}
            </span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: isPending ? '#854d0e' : isApproved ? '#065f46' : '#991b1b' }}>
                {isPending ? 'Awaiting Duty Manager Authorization' : isApproved ? 'Approved and Executed' : 'Request Rejected'}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                {isPending
                  ? 'Submitted by operational floor/kitchen staff during shift'
                  : `Processed at ${selectedApproval.processedAt} by ${selectedApproval.processedBy || 'Duty Manager'}`}
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Requester Details */}
        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#475569', marginBottom: '10px', textTransform: 'uppercase' }}>
            1. REQUESTER & OPERATIONAL CHANNEL
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '13px' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Requesting Staff</span>
              <strong style={{ color: '#0f172a' }}>{selectedApproval.requester}</strong>
              <span style={{ fontSize: '11px', color: '#0f766e', marginLeft: '6px' }}>({selectedApproval.requesterRole})</span>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Submission Time</span>
              <strong style={{ color: '#0f172a' }}>{selectedApproval.timestamp}</strong>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Location / Target</span>
              <strong style={{ color: '#0f172a' }}>
                {selectedApproval.table || selectedApproval.supplier || selectedApproval.targetShift || 'All Stations'}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Transaction Type</span>
              <strong style={{ color: '#0f172a' }}>{selectedApproval.type}</strong>
            </div>
          </div>
        </div>

        {/* Section 2: Financial Impact */}
        {selectedApproval.amount !== null && (
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>
              2. FINANCIAL IMPACT & LEDGER VALUE
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Impact Amount:</span>
              <span style={{ fontSize: '20px', fontWeight: 900, color: '#0f766e' }}>
                {selectedApproval.amount.toLocaleString()} VND
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
              * Transaction will be posted immediately to shift ledger and recorded in FR-014 Audit Trail
            </div>
          </div>
        )}

        {/* Section 3: Reason & Operational Details */}
        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>
            3. JUSTIFICATION & OPERATIONAL CONTEXT
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
            "{selectedApproval.reason}"
          </div>
          <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5, backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <strong>Operational Details:</strong> {selectedApproval.details}
          </div>
        </div>

        {/* Section 4: Decision & Manager Notes */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>
            4. DUTY MANAGER DECISION & AUDIT TRAIL NOTE
          </div>

          {isPending ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter approval rationale or rejection explanation (required for compliance audit)..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  resize: 'none',
                  outline: 'none',
                  backgroundColor: '#ffffff'
                }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: 'auto' }}>
                <button
                  onClick={handleReject}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fca5a5',
                    color: '#991b1b',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  ✕ REJECT REQUEST
                </button>

                <button
                  onClick={handleApprove}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: '#0f766e',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 6px rgba(15, 118, 110, 0.25)'
                  }}
                >
                  ✓ AUTHORIZE & EXECUTE
                </button>
              </div>
            </div>
          ) : (
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Recorded Decision Note:</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                "{selectedApproval.notes || 'No supplementary notes.'}"
              </div>
              <div style={{ fontSize: '10px', color: '#16a34a', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>🔒 Synchronized with immutable Audit Trail (FR-014)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
