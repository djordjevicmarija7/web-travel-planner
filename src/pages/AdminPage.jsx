import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useServices } from '../context/ServiceContext';
import { useToast } from '../hooks/useToast';
import Navbar from '../components/common/Navbar';
import Toast from '../components/common/Toast';
import { Button, Badge, Spinner } from '../components/ui';
import { UserRole } from '../enums/user/UserRole';
import ConfirmDialog from '../components/common/ConfirmDialog';
function AdminPage() {
  const { adminService } = useServices();
  const { user }         = useAuth();
  const navigate         = useNavigate();
  const { toast, showToast } = useToast();

  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null, type: null, newRole: null });

  useEffect(() => {
    if (user?.role !== UserRole.admin) { navigate('/dashboard'); return; }
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch { showToast('Error loading users.', 'error'); }
    finally { setLoading(false); }
  }

  async function handleRoleChangeConfirmed() {
    const { id, newRole } = confirmDialog;
    setConfirmDialog({ isOpen: false, id: null, type: null, newRole: null });
    try {
      const updated = await adminService.updateRole(id, newRole);
      setUsers((prev) => prev.map(u => u.id === id ? updated : u));
      showToast(`Role changed to ${newRole}.`);
    } catch { showToast('Error changing role.', 'error'); }
  }
 
  function handleDelete(id) {
    setConfirmDialog({ isOpen: true, id, type: 'delete', newRole: null });
  }
 
  async function handleDeleteConfirmed() {
    const { id } = confirmDialog;
    setConfirmDialog({ isOpen: false, id: null, type: null, newRole: null });
    try {
      await adminService.deleteUser(id);
      setUsers((prev) => prev.filter(u => u.id !== id));
      showToast('User deleted.');
    } catch { showToast('Error deleting user.', 'error'); }
  }
 function handleRoleChange(id, currentRole) {
  const newRole = currentRole === UserRole.admin ? UserRole.user : UserRole.admin;

  setConfirmDialog({
    isOpen: true,
    id,
    type: 'role',
    newRole,
  });
}
  const isDeleteDialog = confirmDialog.type === 'delete';
  const isRoleDialog   = confirmDialog.type === 'role';

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar backTo="/dashboard" backLabel="Dashboard" title="Admin Panel" />

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 28px' }}>
        {/* Page header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '44px', fontWeight: '300' }}>
              User Management
            </h1>
            <Badge variant="admin">Admin</Badge>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Manage registered users, view accounts, and control access roles.
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Users', value: users.length },
            { label: 'Admins', value: users.filter(u => u.role === UserRole.admin).length },
            { label: 'Regular Users', value: users.filter(u => u.role !== UserRole.admin).length },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)', padding: '14px 20px', minWidth: '140px',
            }}>
              <div style={{ fontSize: '10px', letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>{stat.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '300' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <Spinner size={28} />
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading users...</span>
          </div>
        ) : users.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '48px' }}>No users found.</p>
        ) : (
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)', overflow: 'hidden',
          }}>
            {/* Table header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr auto',
              padding: '12px 20px', borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--bg-elevated)',
            }}>
              {['Name', 'Email', 'Role', 'Joined', 'Actions'].map((h) => (
                <div key={h} style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  {h}
                </div>
              ))}
            </div>

            {/* Rows */}
            {users.map((u, idx) => (
              <div key={u.id}
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr auto',
                  padding: '14px 20px', alignItems: 'center',
                  borderBottom: idx < users.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  transition: 'background var(--transition-fast)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Name + avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                    background: u.id === user?.id ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-glow))' : 'var(--bg-overlay)',
                    border: `1px solid ${u.id === user?.id ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: '500',
                    color: u.id === user?.id ? '#0c0c12' : 'var(--text-secondary)',
                  }}>
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>{u.name}</div>
                    {u.id === user?.id && <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>You</div>}
                  </div>
                </div>

                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{u.email}</span>
                <Badge variant={u.role}>{u.role}</Badge>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {u.createdAt?.slice(0, 10)}
                </span>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  {u.id !== user?.id ? (
                    <>
                      <Button size="xs" variant="ghost" onClick={() => handleRoleChange(u.id, u.role)}>
                        {u.role === UserRole.admin ? 'Remove Admin' : 'Make Admin'}
                      </Button>
                      <Button size="xs" variant="danger" onClick={() => handleDelete(u.id)}>Delete</Button>
                    </>
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--text-faint)', fontStyle: 'italic' }}>—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Toast toast={toast} />
       <ConfirmDialog
        isOpen={confirmDialog.isOpen && isDeleteDialog}
        title="Delete User"
        message="Are you sure you want to permanently delete this user and all their data? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDialog({ isOpen: false, id: null, type: null, newRole: null })}
      />
 
      <ConfirmDialog
        isOpen={confirmDialog.isOpen && isRoleDialog}
        title={confirmDialog.newRole === 'admin' ? 'Make Admin' : 'Remove Admin'}
        message={
          confirmDialog.newRole === 'admin'
            ? 'Are you sure you want to grant admin privileges to this user?'
            : 'Are you sure you want to remove admin privileges from this user?'
        }
        confirmText={confirmDialog.newRole === 'admin' ? 'Make Admin' : 'Remove Admin'}
        cancelText="Cancel"
        variant="warning"
        onConfirm={handleRoleChangeConfirmed}
        onCancel={() => setConfirmDialog({ isOpen: false, id: null, type: null, newRole: null })}
      />
    </div>
  );
}

export default AdminPage;
