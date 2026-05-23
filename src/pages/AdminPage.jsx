import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useServices } from '../context/ServiceContext';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';
import { Button, Badge } from '../components/ui';

function AdminPage() {
  const { adminService } = useServices();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/dashboard'); return; }
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch { showToast('Error loading users.', 'error'); } finally { setLoading(false); }
  }

  async function handleRoleChange(id, currentRole) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change role to "${newRole}"?`)) return;
    try {
      const updated = await adminService.updateRole(id, newRole);
      setUsers((prev) => prev.map((u) => u.id === id ? updated : u));
      showToast(`Role changed to ${newRole}.`);
    } catch { showToast('Error changing role.', 'error'); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this user?')) return;
    try {
      await adminService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showToast('User deleted.');
    } catch { showToast('Error deleting user.', 'error'); }
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(17,17,24,0.8)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '6px 12px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px' }}>← Dashboard</button>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '400' }}>Admin Panel</span>
          <Badge variant="admin" style={{ marginLeft: 'auto' }}>Admin</Badge>
        </div>
      </header>

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '38px', fontWeight: '300', marginBottom: '8px' }}>User Management</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '32px' }}>Manage registered users and their roles.</p>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[1,2,3].map(i => <div key={i} style={{ height: '60px', borderRadius: 'var(--radius-md)' }} className="skeleton" />)}
          </div>
        ) : users.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No users found.</p>
        ) : (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr auto', gap: '0', padding: '12px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
              {['Name', 'Email', 'Role', 'Joined', 'Actions'].map((h) => (
                <div key={h} style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{h}</div>
              ))}
            </div>

            {/* Table rows */}
            {users.map((u, idx) => (
              <div key={u.id} style={{
                display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr auto', gap: '0',
                padding: '14px 20px', alignItems: 'center',
                borderBottom: idx < users.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                transition: 'background var(--transition-fast)',
              }}
                onMouseEnter={e => e.currentTarget.style.background='var(--bg-elevated)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '500', color: 'var(--accent-primary)', flexShrink: 0 }}>
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{u.name}</span>
                  {u.id === user?.id && <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>(you)</span>}
                </div>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{u.email}</span>
                <Badge variant={u.role}>{u.role}</Badge>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{u.createdAt?.slice(0,10)}</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {u.id !== user?.id ? (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => handleRoleChange(u.id, u.role)}>
                        {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(u.id)}>Delete</Button>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Toast toast={toast} />
    </div>
  );
}

export default AdminPage;