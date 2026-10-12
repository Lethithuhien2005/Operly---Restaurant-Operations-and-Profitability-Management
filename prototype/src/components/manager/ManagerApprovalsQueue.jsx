import React, { useState } from 'react';
import { useMockStore } from '../../store/mockStore';
import { ManagerEmptyState } from './ManagerEmptyState';

export const ManagerApprovalsQueue = () => {
  const {
    managerApprovals,
    approveRequest,
    rejectRequest,
    openApprovalDrawer,
    addSimulatedUrgentApproval
  } = useMockStore();

  const [activeFilterTab, setActiveFilterTab] = useState('pending'); // 'pending' | 'processed' | 'all'
  const [selectedCategory, setSelectedCategory] = useState('ALL'); // 'ALL' | 'Billing' | 'Inventory' | 'Policy' | 'Staffing'

  // Filter items
  const pendingItems = managerApprovals.filter((a) => a.status === 'Pending');
  const processedItems = managerApprovals.filter((a) => a.status === 'Approved' || a.status === 'Rejected');

  let displayItems = managerApprovals;
  if (activeFilterTab === 'pending') {
    displayItems = pendingItems;
  } else if (activeFilterTab === 'processed') {
    displayItems = processedItems;
  }

  if (selectedCategory !== 'ALL') {
    displayItems = displayItems.filter((a) => a.category === selectedCategory);
  }

  const renderUrgencyTag = (urgency) => {
    switch (urgency) {
      case 'Critical':
        return (
          <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span className="pulse-indicator" /> CRITICAL
          </span>
        );
      case 'High':
        return (
          <span style={{ backgroundColor: '#ffedd5', color: '#9a3412', border: '1px solid #fed7aa', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 800 }}>
            HIGH PRIORITY
          </span>
        );
      case 'Medium':
        return (
          <span style={{ backgroundColor: '#fef9c3', color: '#854d0e', border: '1px solid #fef08a', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
            MEDIUM
          </span>
        );
      default:
        return (
          <span style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
            STANDARD
          </span>
        );
    }
  };

  return (
    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
      {/* Header with Title and Simulation trigger */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
              URGENT APPROVALS & DECISION QUEUE
            </h3>
            {pendingItems.length > 0 && (
              <span
                style={{
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}
              >
                {pendingItems.length} ACTION REQUIRED
              </span>
            )}
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            Manage void requests, discount overrides, emergency requisitions, and shift swaps
          </p>
        </div>

        {/* Test Simulation Button */}
        <button
          onClick={addSimulatedUrgentApproval}
          style={{
            backgroundColor: '#f0fdf4',
            color: '#166534',
            border: '1px solid #86efac',
            padding: '7px 14px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
          title="Simulate an incoming urgent request from POS or Kitchen to evaluate approval workflows"
        >
          <span>⚡ Simulate Incoming Request</span>
        </button>
      </div>

      {/* Tabs Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
        {/* Main State Tabs */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setActiveFilterTab('pending')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: activeFilterTab === 'pending' ? '#0f766e' : '#f8fafc',
              color: activeFilterTab === 'pending' ? '#ffffff' : '#475569',
              border: '1px solid',
              borderColor: activeFilterTab === 'pending' ? '#0f766e' : '#cbd5e1'
            }}
          >
            <span>⏳ Pending Approvals</span>
            <span
              style={{
                backgroundColor: activeFilterTab === 'pending' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                color: activeFilterTab === 'pending' ? '#ffffff' : '#334155',
                padding: '1px 6px',
                borderRadius: '10px',
                fontSize: '10px',
                fontWeight: 800
              }}
            >
              {pendingItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFilterTab('processed')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: activeFilterTab === 'processed' ? '#0f766e' : '#f8fafc',
              color: activeFilterTab === 'processed' ? '#ffffff' : '#475569',
              border: '1px solid',
              borderColor: activeFilterTab === 'processed' ? '#0f766e' : '#cbd5e1'
            }}
          >
            <span>🕒 Recently Processed</span>
            <span
              style={{
                backgroundColor: activeFilterTab === 'processed' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                color: activeFilterTab === 'processed' ? '#ffffff' : '#334155',
                padding: '1px 6px',
                borderRadius: '10px',
                fontSize: '10px',
                fontWeight: 800
              }}
            >
              {processedItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFilterTab('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              backgroundColor: activeFilterTab === 'all' ? '#0f766e' : '#f8fafc',
              color: activeFilterTab === 'all' ? '#ffffff' : '#475569',
              border: '1px solid',
              borderColor: activeFilterTab === 'all' ? '#0f766e' : '#cbd5e1'
            }}
          >
            All Requests ({managerApprovals.length})
          </button>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {['ALL', 'Billing', 'Inventory', 'Policy', 'Staffing'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: selectedCategory === cat ? '#0284c7' : '#f1f5f9',
                color: selectedCategory === cat ? '#ffffff' : '#64748b',
                border: '1px solid',
                borderColor: selectedCategory === cat ? '#0284c7' : '#e2e8f0'
              }}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Approvals List */}
      {displayItems.length === 0 ? (
        <ManagerEmptyState
          icon={activeFilterTab === 'pending' ? '🎉' : '📂'}
          title={
            activeFilterTab === 'pending'
              ? 'All Clear! No Pending Approvals'
              : 'No Requests Found'
          }
          description={
            activeFilterTab === 'pending'
              ? 'All staff requisitions, void requests, and policy exceptions have been resolved for this shift.'
              : 'Try selecting a different category filter or click "Simulate Incoming Request" to test.'
          }
          actionLabel={activeFilterTab === 'pending' ? 'Simulate Sample Request' : undefined}
          onAction={activeFilterTab === 'pending' ? addSimulatedUrgentApproval : undefined}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {displayItems.map((item) => {
            const isPending = item.status === 'Pending';
            const isApproved = item.status === 'Approved';
            const isRejected = item.status === 'Rejected';

            return (
              <div
                key={item.id}
                style={{
                  border: '1px solid',
                  borderColor: isPending && item.urgency === 'Critical' ? '#fca5a5' : '#e2e8f0',
                  borderRadius: '10px',
                  padding: '16px',
                  backgroundColor: isPending && item.urgency === 'Critical' ? '#fffaf0' : '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'box-shadow 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
              >
                {/* Top Row: Badges, Requester & Time */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#0f766e', backgroundColor: '#ccfbf1', padding: '2px 8px', borderRadius: '4px' }}>
                      {item.id}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '2px 8px', borderRadius: '4px' }}>
                      {item.type}
                    </span>
                    {renderUrgencyTag(item.urgency)}
                  </div>

                  <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>👤 <strong>{item.requester}</strong> ({item.requesterRole})</span>
                    <span>•</span>
                    <span>🕒 {item.timestamp}</span>
                  </div>
                </div>

                {/* Middle Row: Content & Amount */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: '260px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                      {item.title}
                    </h4>
                    <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                      <strong>Reason:</strong> {item.reason}
                    </p>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                      {item.table && <span>Location: <strong>{item.table}</strong> • </span>}
                      {item.supplier && <span>Supplier: <strong>{item.supplier}</strong> • </span>}
                      {item.targetShift && <span>Target Shift: <strong>{item.targetShift}</strong> • </span>}
                      <span>{item.details}</span>
                    </div>
                  </div>

                  {item.amount !== null && (
                    <div style={{ textAlign: 'right', minWidth: '130px' }}>
                      <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>FINANCIAL IMPACT</span>
                      <span style={{ fontSize: '16px', fontWeight: 900, color: '#0f766e' }}>
                        {item.amount.toLocaleString()} VND
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Row: Actions or Status Decision */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  {isPending ? (
                    <>
                      <div style={{ fontSize: '11px', color: '#eab308', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                        <span>⚡ Requires Duty Manager authorization to proceed</span>
                      </div>

                      {/* Quick Action Buttons (Optimistic UI) */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => openApprovalDrawer(item)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#334155',
                            cursor: 'pointer'
                          }}
                        >
                          🔍 View Details
                        </button>

                        <button
                          onClick={() => rejectRequest(item.id, 'Quick rejected by Manager')}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#fee2e2',
                            border: '1px solid #fca5a5',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#991b1b',
                            cursor: 'pointer'
                          }}
                        >
                          ✕ Reject
                        </button>

                        <button
                          onClick={() => approveRequest(item.id, 'Quick approved from dashboard')}
                          style={{
                            padding: '6px 16px',
                            borderRadius: '6px',
                            backgroundColor: '#0f766e',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: 800,
                            color: '#ffffff',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(15,118,110,0.2)'
                          }}
                        >
                          ✓ Quick Approve
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Already Processed Outcome Tag */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          style={{
                            backgroundColor: isApproved ? '#ecfdf5' : '#fef2f2',
                            color: isApproved ? '#065f46' : '#991b1b',
                            border: `1px solid ${isApproved ? '#a7f3d0' : '#fecaca'}`,
                            padding: '3px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 800
                          }}
                        >
                          {isApproved ? '✓ APPROVED' : '✕ REJECTED'}
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          At {item.processedAt} by {item.processedBy} • Note: "<em>{item.notes}</em>"
                        </span>
                      </div>

                      <button
                        onClick={() => openApprovalDrawer(item)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '6px',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#475569',
                          cursor: 'pointer'
                        }}
                      >
                        Inspect Audit File
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
