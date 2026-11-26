import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../api/client';
import { useMockStore } from '../store/mockStore';

const THEME = {
  green: '#263d1c',
  cream: '#f8f4e8',
  gold: '#ead196',
  card: '#ffffff',
  border: '#dfd6be',
  muted: '#5a6b52',
};

const ROLES = ['ADMIN', 'MANAGER', 'CASHIER', 'CHEF', 'WAITER', 'CUSTOMER'];

export const AdminConsoleScreen = () => {
  const { currentUser, adminTab = 'users', setAdminTab, showToast } = useMockStore();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [rolePermIds, setRolePermIds] = useState([]);
  const [config, setConfig] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditAction, setAuditAction] = useState('All');

  const [newUser, setNewUser] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    roleName: 'WAITER',
  });

  const loadUsers = useCallback(async () => {
    try {
      const data = await adminApi.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(`Failed to load users: ${err.message}`);
    }
  }, [showToast]);

  const loadRbac = useCallback(async () => {
    try {
      const [rList, pList] = await Promise.all([adminApi.getRoles(), adminApi.getPermissions()]);
      setRoles(rList || []);
      setPermissions(pList || []);
      if (rList?.length > 0 && !selectedRoleId) {
        setSelectedRoleId(rList[0].id);
        setRolePermIds((rList[0].permissions || []).map((p) => p.id));
      }
    } catch (err) {
      showToast(`Failed to load RBAC: ${err.message}`);
    }
  }, [showToast, selectedRoleId]);

  const loadConfig = useCallback(async () => {
    try {
      const cfg = await adminApi.getConfig();
      setConfig(cfg);
    } catch (err) {
      showToast(`Failed to load config: ${err.message}`);
    }
  }, [showToast]);

  const loadAudits = useCallback(async () => {
    try {
      const logs = await adminApi.getAuditLogs({
        action: auditAction !== 'All' ? auditAction : undefined,
        search: auditSearch || undefined,
      });
      setAuditLogs(Array.isArray(logs) ? logs : []);
    } catch (err) {
      showToast(`Failed to load audit logs: ${err.message}`);
    }
  }, [auditAction, auditSearch, showToast]);

  useEffect(() => {
    if (adminTab === 'users') loadUsers();
    else if (adminTab === 'rbac') loadRbac();
    else if (adminTab === 'config') loadConfig();
    else if (adminTab === 'audit') loadAudits();
  }, [adminTab, loadUsers, loadRbac, loadConfig, loadAudits]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createUser(newUser);
      showToast(`User "${newUser.fullName}" created with role ${newUser.roleName}`);
      setNewUser({ fullName: '', phone: '', email: '', password: '', roleName: 'WAITER' });
      loadUsers();
    } catch (err) {
      showToast(`Create user failed: ${err.message}`);
    }
  };

  const handleToggleUser = async (u) => {
    try {
      await adminApi.toggleUserStatus(u.id, !u.isActive);
      showToast(`${u.fullName} is now ${!u.isActive ? 'Active' : 'Suspended'}`);
      loadUsers();
    } catch (err) {
      showToast(`Status update failed: ${err.message}`);
    }
  };

  const handleChangeRole = async (userId, roleName) => {
    try {
      await adminApi.updateUser(userId, { roleName });
      showToast(`Updated user role to ${roleName}`);
      loadUsers();
    } catch (err) {
      showToast(`Role update failed: ${err.message}`);
    }
  };

  const handleSelectRole = (role) => {
    setSelectedRoleId(role.id);
    setRolePermIds((role.permissions || []).map((p) => p.id));
  };

  const handleTogglePerm = (permId) => {
    setRolePermIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const handleSaveRolePerms = async () => {
    if (!selectedRoleId) return;
    try {
      await adminApi.updateRolePermissions(selectedRoleId, rolePermIds);
      showToast('Role permissions updated and logged to Audit Trail.');
      loadRbac();
    } catch (err) {
      showToast(`Failed to update permissions: ${err.message}`);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      const updated = await adminApi.updateConfig(config);
      setConfig(updated);
      showToast('System configuration saved & audited.');
    } catch (err) {
      showToast(`Config save failed: ${err.message}`);
    }
  };

  const navItems = [
    { id: 'users', label: 'User Accounts', icon: '👥' },
    { id: 'rbac', label: 'Roles & Permissions (RBAC)', icon: '🔐' },
    { id: 'config', label: 'System Configuration', icon: '⚙️' },
    { id: 'audit', label: 'Audit Logs', icon: '📜' },
  ];

  const validTab = navItems.some((n) => n.id === adminTab) ? adminTab : 'users';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 54px)', backgroundColor: THEME.cream }}>
      <header
        style={{
          backgroundColor: THEME.green,
          color: THEME.cream,
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `2px solid ${THEME.gold}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: THEME.gold }}>
            OPERLY SYSTEM ADMIN CONSOLE
          </span>
          <span style={{ fontSize: 12, opacity: 0.9 }}>
            Users • RBAC • System Config • Audit Trail
          </span>
        </div>
        <div style={{ fontSize: 12, color: THEME.gold, fontWeight: 700 }}>
          Admin: {currentUser?.fullName || 'System Administrator'}
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <aside
          style={{
            width: 240,
            backgroundColor: THEME.green,
            color: THEME.cream,
            padding: '16px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            flexShrink: 0,
            borderRight: '1px solid rgba(234,209,150,0.25)',
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 800, color: THEME.gold, padding: '0 8px 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            System Governance
          </div>
          {navItems.map((item) => {
            const active = validTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setAdminTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: active ? 800 : 600,
                  backgroundColor: active ? THEME.gold : 'transparent',
                  color: active ? THEME.green : THEME.cream,
                  textAlign: 'left',
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        <main style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
          {/* 1. User Accounts */}
          {validTab === 'users' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <form
                onSubmit={handleCreateUser}
                style={{
                  backgroundColor: THEME.card,
                  border: `1px solid ${THEME.border}`,
                  borderRadius: 12,
                  padding: 16,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: 10,
                  alignItems: 'end',
                }}
              >
                <input required placeholder="Full Name" value={newUser.fullName} onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })} style={{ padding: 8, borderRadius: 6, border: `1px solid ${THEME.border}` }} />
                <input required placeholder="Phone (09...)" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} style={{ padding: 8, borderRadius: 6, border: `1px solid ${THEME.border}` }} />
                <input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} style={{ padding: 8, borderRadius: 6, border: `1px solid ${THEME.border}` }} />
                <input required type="password" placeholder="Password (min 6)" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} style={{ padding: 8, borderRadius: 6, border: `1px solid ${THEME.border}` }} />
                <select value={newUser.roleName} onChange={(e) => setNewUser({ ...newUser, roleName: e.target.value })} style={{ padding: 8, borderRadius: 6, border: `1px solid ${THEME.border}` }}>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <button type="submit" style={{ backgroundColor: THEME.green, color: THEME.cream, padding: '9px 14px', borderRadius: 8, fontWeight: 800, fontSize: 13 }}>
                  + Create Account
                </button>
              </form>

              <div style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 16, overflowX: 'auto' }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: THEME.green, marginBottom: 12 }}>System User Accounts ({users.length})</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${THEME.border}`, textAlign: 'left', color: THEME.muted }}>
                      <th style={{ padding: 8 }}>Full Name</th>
                      <th style={{ padding: 8 }}>Email</th>
                      <th style={{ padding: 8 }}>Phone</th>
                      <th style={{ padding: 8 }}>Role</th>
                      <th style={{ padding: 8 }}>Status</th>
                      <th style={{ padding: 8 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} style={{ borderBottom: `1px solid ${THEME.cream}` }}>
                        <td style={{ padding: 8, fontWeight: 700, color: THEME.green }}>{u.fullName}</td>
                        <td style={{ padding: 8 }}>{u.email || '—'}</td>
                        <td style={{ padding: 8 }}>{u.phone}</td>
                        <td style={{ padding: 8 }}>
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeRole(u.id, e.target.value)}
                            style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${THEME.border}`, fontWeight: 700, color: THEME.green }}
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: 8 }}>
                          <span style={{ padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 700, backgroundColor: u.isActive ? '#dcfce7' : '#fee2e2', color: u.isActive ? '#166534' : '#991b1b' }}>
                            {u.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td style={{ padding: 8 }}>
                          <button
                            onClick={() => handleToggleUser(u)}
                            style={{
                              backgroundColor: u.isActive ? '#fee2e2' : THEME.green,
                              color: u.isActive ? '#991b1b' : THEME.cream,
                              padding: '5px 10px',
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            {u.isActive ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. Roles & Permissions */}
          {validTab === 'rbac' && (
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16 }}>
              <div style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 14 }}>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: THEME.green, marginBottom: 10 }}>Roles</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {roles.map((r) => {
                    const active = r.id === selectedRoleId;
                    return (
                      <button
                        key={r.id}
                        onClick={() => handleSelectRole(r)}
                        style={{
                          textAlign: 'left',
                          padding: '10px 12px',
                          borderRadius: 8,
                          backgroundColor: active ? THEME.green : THEME.cream,
                          color: active ? THEME.cream : THEME.green,
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        <div>{r.name}</div>
                        <div style={{ fontSize: 11, opacity: 0.8 }}>{r.userCount} users • {r.permissions?.length || 0} perms</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: THEME.green }}>
                    Permission Matrix ({rolePermIds.length} / {permissions.length} granted)
                  </h3>
                  <button
                    onClick={handleSaveRolePerms}
                    style={{ backgroundColor: THEME.green, color: THEME.cream, padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 800 }}
                  >
                    Save Permissions
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                  {permissions.map((p) => {
                    const checked = rolePermIds.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 10px',
                          borderRadius: 8,
                          border: `1px solid ${checked ? THEME.green : THEME.border}`,
                          backgroundColor: checked ? THEME.cream : '#fff',
                          cursor: 'pointer',
                          fontSize: 12,
                        }}
                      >
                        <input type="checkbox" checked={checked} onChange={() => handleTogglePerm(p.id)} />
                        <div>
                          <div style={{ fontWeight: 700, color: THEME.green }}>{p.code}</div>
                          <div style={{ fontSize: 11, color: THEME.muted }}>{p.name}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 3. System Configuration */}
          {validTab === 'config' && config && (
            <form onSubmit={handleSaveConfig} style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 20, maxWidth: 720 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: THEME.green, marginBottom: 16 }}>Global System Configuration</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: THEME.muted }}>Restaurant Name</label>
                  <input value={config.restaurantName} onChange={(e) => setConfig({ ...config, restaurantName: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: `1px solid ${THEME.border}`, marginTop: 4 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: THEME.muted }}>Branch Name</label>
                  <input value={config.branchName} onChange={(e) => setConfig({ ...config, branchName: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: `1px solid ${THEME.border}`, marginTop: 4 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: THEME.muted }}>VAT (%)</label>
                  <input type="number" value={config.vatPercent} onChange={(e) => setConfig({ ...config, vatPercent: Number(e.target.value) })} style={{ width: '100%', padding: 8, borderRadius: 6, border: `1px solid ${THEME.border}`, marginTop: 4 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: THEME.muted }}>Service Charge (%)</label>
                  <input type="number" value={config.serviceChargePercent} onChange={(e) => setConfig({ ...config, serviceChargePercent: Number(e.target.value) })} style={{ width: '100%', padding: 8, borderRadius: 6, border: `1px solid ${THEME.border}`, marginTop: 4 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: THEME.muted }}>Session Timeout (mins)</label>
                  <input type="number" value={config.sessionTimeoutMinutes} onChange={(e) => setConfig({ ...config, sessionTimeoutMinutes: Number(e.target.value) })} style={{ width: '100%', padding: 8, borderRadius: 6, border: `1px solid ${THEME.border}`, marginTop: 4 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: THEME.muted }}>Audit Retention (days)</label>
                  <input type="number" value={config.auditRetentionDays} onChange={(e) => setConfig({ ...config, auditRetentionDays: Number(e.target.value) })} style={{ width: '100%', padding: 8, borderRadius: 6, border: `1px solid ${THEME.border}`, marginTop: 4 }} />
                </div>
              </div>
              <button type="submit" style={{ marginTop: 18, backgroundColor: THEME.green, color: THEME.cream, padding: '10px 18px', borderRadius: 8, fontWeight: 800, fontSize: 13 }}>
                Save System Configuration
              </button>
            </form>
          )}

          {/* 4. Audit Logs */}
          {validTab === 'audit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  placeholder="Search action, entity, ID..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: `1px solid ${THEME.border}` }}
                />
                <select value={auditAction} onChange={(e) => setAuditAction(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${THEME.border}` }}>
                  <option value="All">All Actions</option>
                  <option value="USER_CREATED">USER_CREATED</option>
                  <option value="USER_UPDATED">USER_UPDATED</option>
                  <option value="USER_SUSPENDED">USER_SUSPENDED</option>
                  <option value="USER_ACTIVATED">USER_ACTIVATED</option>
                  <option value="ROLE_PERMISSIONS_UPDATED">ROLE_PERMISSIONS_UPDATED</option>
                  <option value="SYSTEM_CONFIG_UPDATED">SYSTEM_CONFIG_UPDATED</option>
                </select>
                <button onClick={loadAudits} style={{ backgroundColor: THEME.green, color: THEME.cream, padding: '8px 14px', borderRadius: 8, fontWeight: 700, fontSize: 12 }}>
                  Refresh
                </button>
              </div>

              <div style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 16, overflowX: 'auto' }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: THEME.green, marginBottom: 10 }}>Immutable System Audit Trail ({auditLogs.length})</h3>
                {auditLogs.length === 0 ? (
                  <div style={{ fontSize: 13, color: THEME.muted }}>No audit events recorded yet. Admin actions (user updates, RBAC changes, config updates) will appear here automatically.</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${THEME.border}`, textAlign: 'left', color: THEME.muted }}>
                        <th style={{ padding: 8 }}>Timestamp</th>
                        <th style={{ padding: 8 }}>Actor</th>
                        <th style={{ padding: 8 }}>Action</th>
                        <th style={{ padding: 8 }}>Entity</th>
                        <th style={{ padding: 8 }}>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log.id} style={{ borderBottom: `1px solid ${THEME.cream}` }}>
                          <td style={{ padding: 8, fontSize: 12 }}>{new Date(log.createdAt).toLocaleString()}</td>
                          <td style={{ padding: 8, fontWeight: 700, color: THEME.green }}>{log.user?.fullName || 'System'}</td>
                          <td style={{ padding: 8 }}><span style={{ backgroundColor: THEME.gold, color: THEME.green, padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 800 }}>{log.action}</span></td>
                          <td style={{ padding: 8 }}>{log.entityName}</td>
                          <td style={{ padding: 8, fontSize: 12, color: THEME.muted }}>{JSON.stringify(log.newValues || {})}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
