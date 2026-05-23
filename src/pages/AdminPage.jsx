import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useServices } from '../context/ServiceContext';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

function AdminPage() {
  const {adminService} = useServices();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch {
      showToast('Error while loading users.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(id, currentRole) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';

    if (!window.confirm(
      `Change user role to "${newRole}"?`
    )) return;

    try {
      const updated = await adminService.updateRole(id, newRole);

      setUsers((prev) =>
        prev.map((u) => (u.id === id ? updated : u))
      );
      showToast('Role successfully changed to "${newRole}".');
    } catch {
      showToast('Error while changing user role.', 'error');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete user?')) return;

    try {
      await adminService.deleteUser(id);

      setUsers((prev) =>
        prev.filter((u) => u.id !== id)
      );
      showToast('User deleted successfully.');
    } catch {
      showToast('Error while deleting user.', 'error');
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <button onClick={() => navigate('/dashboard')}>
        ← Back
      </button>

      <h2>Admin panel — user management</h2>

      {error && (
        <p style={{ color: 'red' }}>{error}</p>
      )}

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  textAlign: 'left',
                  padding: '8px',
                  borderBottom: '1px solid #ccc'
                }}
              >
                Name
              </th>

              <th
                style={{
                  textAlign: 'left',
                  padding: '8px',
                  borderBottom: '1px solid #ccc'
                }}
              >
                Email
              </th>

              <th
                style={{
                  textAlign: 'left',
                  padding: '8px',
                  borderBottom: '1px solid #ccc'
                }}
              >
                Role
              </th>

              <th
                style={{
                  textAlign: 'left',
                  padding: '8px',
                  borderBottom: '1px solid #ccc'
                }}
              >
                Registered
              </th>

              <th
                style={{
                  textAlign: 'left',
                  padding: '8px',
                  borderBottom: '1px solid #ccc'
                }}
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ padding: '8px' }}>
                  {u.name}
                </td>

                <td style={{ padding: '8px' }}>
                  {u.email}
                </td>

                <td style={{ padding: '8px' }}>
                  {u.role}
                </td>

                <td style={{ padding: '8px' }}>
                  {u.createdAt?.slice(0, 10)}
                </td>

                <td
                  style={{
                    padding: '8px',
                    display: 'flex',
                    gap: '6px'
                  }}
                >
                  {/* Prevent admin from changing their own role */}
                  {u.id !== user?.id && (
                    <>
                      <button
                        onClick={() =>
                          handleRoleChange(u.id, u.role)
                        }
                      >
                        {u.role === 'admin'
                          ? 'Remove admin'
                          : 'Make admin'}
                      </button>

                      <button
                        onClick={() => handleDelete(u.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}

                  {u.id === user?.id && (
                    <span style={{ color: '#999' }}>
                      You
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminPage;