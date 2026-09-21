import React, { useState } from 'react';
import { useMockStore } from '../store/mockStore';

export const AdminConsoleScreen = () => {
  const {
    adminTab,
    setAdminTab,
    staffAccounts,
    auditLogs,
    toggleStaffStatus,
    showToast
  } = useMockStore();

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [staffToSuspend, setStaffToSuspend] = useState(null);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesCategory = categoryFilter === 'All' || log.actionCategory === categoryFilter;
    const matchesSearch =
      log.actorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.clientIp.includes(searchTerm) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleActionClick = (staff) => {
    if (staff.status === 'Active') {
      // Require explicit confirmation before suspension (SPEC-AUTH-001)
      setStaffToSuspend(staff);
    } else {
      toggleStaffStatus(staff.id);
    }
  };

  const confirmSuspend = () => {
    if (staffToSuspend) {
      toggleStaffStatus(staffToSuspend.id);
      setStaffToSuspend(null);
    }
  };

  return (
    <div className="device-desktop" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Header matching SCR-ADM-01 */}
      <div
        style={{
          backgroundColor: '#1e293b',
          color: '#fff',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #334155'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8' }}>OPERLY ADMIN CONSOLE</span>
          <span style={{ backgroundColor: '#0f172a', border: '1px solid #475569', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', color: '#94a3b8' }}>
            Identity Governance & RBAC
          </span>
          <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Admin: Dinh Khoa Vu</span>
        </div>

        <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
          Security Level: High • RBAC Enforced
        </div>
      </div>

      {/* Sub-bar Navigation Tabs */}
      <div
        style={{
          backgroundColor: '#0f172a',
          borderBottom: '1px solid #334155',
          padding: '8px 20px',
          display: 'flex',
          gap: '8px'
        }}
      >
        <button
          onClick={() => setAdminTab('rbac')}
          style={{
            padding: '6px 16px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            backgroundColor: adminTab === 'rbac' ? '#0284c7' : '#1e293b',
            color: adminTab === 'rbac' ? '#ffffff' : '#94a3b8',
            border: '1px solid',
            borderColor: adminTab === 'rbac' ? '#0284c7' : '#334155'
          }}
        >
          👥 User Provisioning & Session Invalidation (SCR-ADM-01)
        </button>

        <button
          onClick={() => setAdminTab('audit')}
          style={{
            padding: '6px 16px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            backgroundColor: adminTab === 'audit' ? '#0284c7' : '#1e293b',
            color: adminTab === 'audit' ? '#ffffff' : '#94a3b8',
            border: '1px solid',
            borderColor: adminTab === 'audit' ? '#0284c7' : '#334155'
          }}
        >
          📜 Immutable System Audit Trail (SCR-ADM-02)
        </button>
      </div>

      {/* Main View Area */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#f8fafc' }}>
        {adminTab === 'rbac' ? (
          /* ======================================================== */
          /* SCR-ADM-01: User Provisioning & Session Invalidation     */
          /* ======================================================== */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                STAFF ACCOUNTS DIRECTORY:
              </div>

              <button
                onClick={() => showToast('User onboarding dialog opened.')}
                style={{
                  backgroundColor: '#0f766e',
                  color: '#fff',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700
                }}
              >
                + Create New User
              </button>
            </div>

            {/* Staff Accounts Table matching SCR-ADM-01 */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', backgroundColor: '#ffffff', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '12px 14px' }}>Name</th>
                    <th style={{ padding: '12px 14px' }}>Role</th>
                    <th style={{ padding: '12px 14px' }}>Phone / Email</th>
                    <th style={{ padding: '12px 14px' }}>Status</th>
                    <th style={{ padding: '12px 14px' }}>Token Ver</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staffAccounts.map((staff) => {
                    const isSuspended = staff.status === 'SUSPENDED';

                    return (
                      <tr key={staff.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                          {staff.name}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                            {staff.role}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', color: '#64748b' }}>{staff.contact}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span
                            style={{
                              backgroundColor: isSuspended ? '#fee2e2' : '#dcfce7',
                              color: isSuspended ? '#991b1b' : '#166534',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700
                            }}
                          >
                            {staff.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#475569' }}>
                          {staff.tokenVersion}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              onClick={() => showToast(`Editing profile for ${staff.name}`)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '4px',
                                backgroundColor: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                fontSize: '11px',
                                fontWeight: 600,
                                color: '#475569'
                              }}
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleActionClick(staff)}
                              style={{
                                padding: '4px 12px',
                                borderRadius: '4px',
                                backgroundColor: isSuspended ? '#16a34a' : '#dc2626',
                                color: '#ffffff',
                                fontSize: '11px',
                                fontWeight: 700
                              }}
                            >
                              {isSuspended ? 'ACTIVATE' : 'SUSPEND'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Architecture Explanation Box matching Wireframe Callout */}
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fca5a5',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#991b1b',
                fontSize: '12px',
                lineHeight: '1.5'
              }}
            >
              <strong>[!] Instant Session Revocation Mechanism (SPEC-AUTH-001):</strong>
              <div style={{ marginTop: '2px' }}>
                When 'SUSPEND' is clicked, the user's database <code>token_version</code> increments. On the user's next API request, the auth middleware detects the token version mismatch and immediately rejects with <strong>401 Unauthorized</strong> across all active mobile and desktop terminals.
              </div>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* SCR-ADM-02: Immutable Audit Log Explorer                 */
          /* ======================================================== */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
              SYSTEM AUDIT TRAIL (READ-ONLY APPEND-ONLY LOGS)
            </div>

            {/* Filter Bar matching Wireframe SCR-ADM-02 */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Event:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                >
                  <option value="All">All Categories</option>
                  <option value="BILL_VOID">BILL_VOID</option>
                  <option value="MENU_86_TOGGLE">MENU_86_TOGGLE</option>
                  <option value="USER_SUSPENDED">USER_SUSPENDED</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Date:</span>
                <select style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                  <option>Last 24 Hours</option>
                  <option>Last 7 Days</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  placeholder="Search IP, Actor ID, or details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>
            </div>

            {/* Audit Log Table matching SCR-ADM-02 with Empty State */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', backgroundColor: '#ffffff', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '10px 12px' }}>Timestamp (UTC)</th>
                    <th style={{ padding: '10px 12px' }}>Actor ID</th>
                    <th style={{ padding: '10px 12px' }}>Action Category</th>
                    <th style={{ padding: '10px 12px' }}>Client IP</th>
                    <th style={{ padding: '10px 12px' }}>Details Snapshot</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                        No audit log entries match the selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: '#64748b' }}>
                          {log.timestamp}
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>
                          {log.actorId}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span
                            style={{
                              backgroundColor:
                                log.actionCategory === 'BILL_VOID'
                                  ? '#fee2e2'
                                  : log.actionCategory === 'USER_SUSPENDED'
                                  ? '#ffedd5'
                                  : '#e0f2fe',
                              color:
                                log.actionCategory === 'BILL_VOID'
                                  ? '#991b1b'
                                  : log.actionCategory === 'USER_SUSPENDED'
                                  ? '#9a3412'
                                  : '#0369a1',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 700,
                              fontFamily: 'var(--font-mono)'
                            }}
                          >
                            {log.actionCategory}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: '#475569' }}>
                          {log.clientIp}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#0f172a' }}>{log.details}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions matching Wireframe SCR-ADM-02 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => showToast('Audit trail exported as audit_report_20260920.csv')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#334155'
                }}
              >
                📥 EXPORT AUDIT REPORT (CSV)
              </button>

              <button
                onClick={() => showToast('Cryptographic audit log checksum verified: SHA-256 HMAC VALID (Zero tampering).')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 700
                }}
              >
                🔒 VERIFY LOG CHECKSUM
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal before Account Suspension */}
      {staffToSuspend && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#991b1b', marginBottom: '8px' }}>
              Confirm Staff Account Suspension
            </h3>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', marginBottom: '16px' }}>
              Are you sure you want to suspend <strong>{staffToSuspend.name}</strong> ({staffToSuspend.role})?
              <br />
              This will increment their database token version and <strong>immediately revoke all active sessions</strong> across mobile and desktop terminals (HTTP 401).
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setStaffToSuspend(null)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#475569'
                }}
              >
                Cancel
              </button>

              <button
                onClick={confirmSuspend}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 700
                }}
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
