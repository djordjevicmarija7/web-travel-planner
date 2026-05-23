import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TripForm from '../components/TripForm';
import { useServices } from '../context/ServiceContext';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';
import { Button, Card, EmptyState } from '../components/ui';

function DashboardPage() {
  const { tripService } = useServices();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => { fetchTrips(); }, []);

  async function fetchTrips() {
    try {
      setLoading(true);
      const data = await tripService.getAll();
      setTrips(Array.isArray(data) ? data : data?.trips || []);
    } catch { showToast('Error loading trips.', 'error'); } finally { setLoading(false); }
  }

  async function handleCreate(formData) {
    try {
      setCreateLoading(true);
      await tripService.create(formData);
      setShowCreateForm(false);
      await fetchTrips();
      showToast('Trip plan created!');
    } catch { showToast('Error creating trip.', 'error'); } finally { setCreateLoading(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this trip plan?')) return;
    try {
      await tripService.remove(id);
      setTrips((prev) => prev.filter((t) => t.id !== id));
      showToast('Trip deleted.');
    } catch { showToast('Error deleting trip.', 'error'); }
  }

  function handleLogout() { logout(); navigate('/login'); }

  function getTripDuration(start, end) {
    if (!start || !end) return null;
    const diff = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
    return diff > 0 ? `${diff} day${diff !== 1 ? 's' : ''}` : null;
  }

  function getTripStatus(start, end) {
    const now = new Date();
    const s = new Date(start), e = new Date(end);
    if (now < s) return { label: 'Upcoming', color: 'var(--status-planned)' };
    if (now > e) return { label: 'Past', color: 'var(--text-muted)' };
    return { label: 'Ongoing', color: 'var(--status-completed)' };
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(17,17,24,0.8)',
        backdropFilter: 'blur(16px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>✈</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--accent-primary)', letterSpacing: '0.04em' }}>Wanderlust</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{user?.name}</span>
            {user?.role === 'admin' && (
              <Button size="sm" variant="accent" onClick={() => navigate('/admin')}>Admin Panel</Button>
            )}
            <Button size="sm" variant="ghost" onClick={handleLogout}>Sign Out</Button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Page header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '42px', fontWeight: '300', lineHeight: 1.1, marginBottom: '8px' }}>
              My Travels
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              {trips.length === 0 ? 'Start planning your next adventure' : `${trips.length} trip plan${trips.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? '✕ Close' : '+ New Trip'}
          </Button>
        </div>

        {/* Create form */}
        {showCreateForm && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-xl)', padding: '28px', marginBottom: '32px', animation: 'fadeIn 0.3s ease' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', marginBottom: '20px', color: 'var(--accent-primary)' }}>New Trip Plan</h3>
            <TripForm onSubmit={handleCreate} onCancel={() => setShowCreateForm(false)} loading={createLoading} />
          </div>
        )}

        {/* Trip grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: '180px', borderRadius: 'var(--radius-lg)' }} className="skeleton" />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <EmptyState icon="🗺" title="No trips yet" description="Create your first travel plan and start organizing your adventure." action={<Button variant="primary" onClick={() => setShowCreateForm(true)}>+ Create First Trip</Button>} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {trips.map((trip, idx) => {
              const status = getTripStatus(trip.startDate, trip.endDate);
              const duration = getTripDuration(trip.startDate, trip.endDate);
              return (
                <Card key={trip.id} hover style={{ cursor: 'default', animation: `fadeIn 0.35s ease ${idx * 0.05}s both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '400', flex: 1, paddingRight: '8px' }}>{trip.name}</h3>
                    <span style={{ fontSize: '11px', fontWeight: '500', color: status.color, background: `${status.color}18`, padding: '2px 8px', borderRadius: '10px', whiteSpace: 'nowrap' }}>
                      {status.label}
                    </span>
                  </div>

                  {trip.description && (
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {trip.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span>📅 {trip.startDate?.slice(0, 10)} → {trip.endDate?.slice(0, 10)}</span>
                    {duration && <span>⏱ {duration}</span>}
                  </div>

                  {trip.budget && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                      💰 Budget: <span style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>€ {trip.budget.toLocaleString()}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                    <Button variant="accent" size="sm" onClick={() => navigate(`/trips/${trip.id}`)}>View Details →</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(trip.id)}>Delete</Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Toast toast={toast} />
    </div>
  );
}

export default DashboardPage;