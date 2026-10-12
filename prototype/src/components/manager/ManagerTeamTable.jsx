import React, { useState } from 'react';
import { useMockStore } from '../../store/mockStore';
import { ManagerEmptyState } from './ManagerEmptyState';

export const ManagerTeamTable = () => {
  const { teamRoster, updateStaffShiftStatus } = useMockStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL'); // 'ALL' | 'FOH' | 'BOH'
  const [selectedStatus, setSelectedStatus] = useState('ALL'); // 'ALL' | 'On Duty' | 'On Break' | 'Off Duty'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter roster
  const filteredRoster = teamRoster.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.phone.includes(searchTerm);

    const matchesDept = selectedDept === 'ALL' || staff.department === selectedDept;
    const matchesStatus = selectedStatus === 'ALL' || staff.status === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredRoster.length / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedStaff = filteredRoster.slice(startIndex, startIndex + itemsPerPage);

  // Overall stats
  const onDutyCount = teamRoster.filter((s) => s.status === 'On Duty').length;
  const onBreakCount = teamRoster.filter((s) => s.status === 'On Break').length;
  const fohCount = teamRoster.filter((s) => s.department === 'FOH' && s.status === 'On Duty').length;
  const bohCount = teamRoster.filter((s) => s.department === 'BOH' && s.status === 'On Duty').length;
  const avgRating = (
    teamRoster.reduce((acc, s) => acc + (s.rating || 5), 0) / teamRoster.length
  ).toFixed(2);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'On Duty':
        return (
          <span style={{ backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16a34a' }} />
            ON DUTY
          </span>
        );
      case 'On Break':
        return (
          <span style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#d97706' }} />
            ON BREAK
          </span>
        );
      default:
        return (
          <span style={{ backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#94a3b8' }} />
            OFF SHIFT
          </span>
        );
    }
  };

  return (
    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
      {/* Top Header & Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
            OPERATIONS & TEAM MANAGEMENT (DUTY ROSTER)
          </h3>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            Live oversight of Front-of-House (FOH) and Back-of-House (BOH) staff coverage
          </p>
        </div>

        {/* Live Status Summary Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 12px', fontSize: '12px' }}>
          <span>Live Coverage:</span>
          <strong style={{ color: '#166534' }}>{onDutyCount} On Duty</strong>
          <span>•</span>
          <strong style={{ color: '#d97706' }}>{onBreakCount} On Break</strong>
          <span>•</span>
          <span style={{ color: '#64748b' }}>FOH: {fohCount} | BOH: {bohCount}</span>
          <span>•</span>
          <span style={{ color: '#0f766e', fontWeight: 700 }}>⭐ Avg {avgRating}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}>
          <span style={{ fontSize: '14px', color: '#64748b' }}>🔍</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by staff name, role, or phone number..."
            style={{
              width: '100%',
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '12px',
              outline: 'none',
              backgroundColor: '#ffffff'
            }}
          />
        </div>

        {/* Department Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Department:</span>
          {['ALL', 'FOH', 'BOH'].map((dept) => (
            <button
              key={dept}
              onClick={() => {
                setSelectedDept(dept);
                setCurrentPage(1);
              }}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: selectedDept === dept ? '#0f766e' : '#ffffff',
                color: selectedDept === dept ? '#ffffff' : '#475569',
                border: '1px solid',
                borderColor: selectedDept === dept ? '#0f766e' : '#cbd5e1'
              }}
            >
              {dept === 'ALL' ? 'All' : dept}
            </button>
          ))}
        </div>

        {/* Status Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Status:</span>
          {['ALL', 'On Duty', 'On Break', 'Off Duty'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setSelectedStatus(st);
                setCurrentPage(1);
              }}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: selectedStatus === st ? '#0f766e' : '#ffffff',
                color: selectedStatus === st ? '#ffffff' : '#475569',
                border: '1px solid',
                borderColor: selectedStatus === st ? '#0f766e' : '#cbd5e1'
              }}
            >
              {st === 'ALL' ? 'All' : st === 'On Duty' ? 'On Duty' : st === 'On Break' ? 'On Break' : 'Off Shift'}
            </button>
          ))}
        </div>
      </div>

      {/* Roster Table */}
      {paginatedStaff.length === 0 ? (
        <ManagerEmptyState
          icon="👥"
          title="No matching staff members found"
          description={`No team members match your current filter query: "${searchTerm}".`}
          actionLabel="Reset Search Filters"
          onAction={() => {
            setSearchTerm('');
            setSelectedDept('ALL');
            setSelectedStatus('ALL');
          }}
        />
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>Staff Member</th>
                <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>Department & Role</th>
                <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>Shift Schedule</th>
                <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>Attendance Verification</th>
                <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>Live Shift Metrics</th>
                <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>Rating</th>
                <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>Status & Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStaff.map((staff, idx) => (
                <tr
                  key={staff.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fcfcfc',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  {/* Name & Phone */}
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>{staff.avatar || '👤'}</span>
                      <div>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{staff.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          ID: {staff.id} • {staff.phone}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Dept & Role */}
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          backgroundColor: staff.department === 'FOH' ? '#e0f2fe' : '#fef3c7',
                          color: staff.department === 'FOH' ? '#0369a1' : '#b45309',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 800
                        }}
                      >
                        {staff.department}
                      </span>
                      <strong style={{ color: '#334155' }}>{staff.role}</strong>
                    </div>
                  </td>

                  {/* Shift */}
                  <td style={{ padding: '12px 14px', color: '#475569', fontWeight: 600 }}>
                    {staff.shift}
                  </td>

                  {/* Check-in verification */}
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: '11px', color: '#166534', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span>📍</span> {staff.checkInTime}
                    </span>
                  </td>

                  {/* Live Performance metric */}
                  <td style={{ padding: '12px 14px' }}>
                    {staff.tablesHandled !== undefined && (
                      <span style={{ fontWeight: 700, color: '#0f766e' }}>
                        🍽️ {staff.tablesHandled} tables served
                      </span>
                    )}
                    {staff.ordersCooked !== undefined && (
                      <span style={{ fontWeight: 700, color: '#c2410c' }}>
                        🍳 {staff.ordersCooked} orders prepared
                      </span>
                    )}
                    {staff.billsSettled !== undefined && (
                      <span style={{ fontWeight: 700, color: '#0284c7' }}>
                        💵 {staff.billsSettled} bills settled
                      </span>
                    )}
                    {staff.drinksPrepared !== undefined && (
                      <span style={{ fontWeight: 700, color: '#7c3aed' }}>
                        🍹 {staff.drinksPrepared} drinks served
                      </span>
                    )}
                    {staff.tablesCleaned !== undefined && (
                      <span style={{ fontWeight: 700, color: '#059669' }}>
                        🧹 {staff.tablesCleaned} tables bussed
                      </span>
                    )}
                    {staff.guestsGreeted !== undefined && (
                      <span style={{ fontWeight: 700, color: '#db2777' }}>
                        👋 {staff.guestsGreeted} guests welcomed
                      </span>
                    )}
                  </td>

                  {/* Rating */}
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ backgroundColor: '#fffbeb', border: '1px solid #fef08a', color: '#854d0e', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                      ⭐ {staff.rating}
                    </span>
                  </td>

                  {/* Status & Quick Toggle */}
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getStatusBadge(staff.status)}

                      <select
                        value={staff.status}
                        onChange={(e) => updateStaffShiftStatus(staff.id, e.target.value)}
                        style={{
                          padding: '3px 6px',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          fontSize: '11px',
                          backgroundColor: '#ffffff',
                          color: '#334155',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="On Duty">On Duty</option>
                        <option value="On Break">On Break</option>
                        <option value="Off Duty">Off Shift</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '12px', color: '#64748b' }}>
        <div>
          Showing <strong>{startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredRoster.length)}</strong> of <strong>{filteredRoster.length}</strong> team members
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safeCurrentPage === 1}
            style={{
              padding: '5px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: safeCurrentPage === 1 ? '#f1f5f9' : '#ffffff',
              color: safeCurrentPage === 1 ? '#94a3b8' : '#334155',
              cursor: safeCurrentPage === 1 ? 'not-allowed' : 'pointer',
              fontWeight: 600
            }}
          >
            ← Previous
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: safeCurrentPage === i + 1 ? '#0f766e' : '#cbd5e1',
                backgroundColor: safeCurrentPage === i + 1 ? '#0f766e' : '#ffffff',
                color: safeCurrentPage === i + 1 ? '#ffffff' : '#334155',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safeCurrentPage === totalPages}
            style={{
              padding: '5px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: safeCurrentPage === totalPages ? '#f1f5f9' : '#ffffff',
              color: safeCurrentPage === totalPages ? '#94a3b8' : '#334155',
              cursor: safeCurrentPage === totalPages ? 'not-allowed' : 'pointer',
              fontWeight: 600
            }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};
