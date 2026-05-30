import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useServices } from '../context/ServiceContext';
import { useToast } from '../hooks/useToast';
import Navbar from '../components/common/Navbar';
import TripForm from '../components/trip/TripForm';
import Toast from '../components/common/Toast';
import { Button, Card, Badge, EmptyState, Modal, Spinner } from '../components/ui';

function getTripDuration(start, end) {
  if (!start || !end) return null;
  const diff = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
  return diff > 0 ? `${diff} day${diff !== 1 ? 's' : ''}` : null;
}

function getTripStatus(start, end) {
  const now = new Date();
  const s = new Date(start), e = new Date(end);
  if (now < s) return { label: 'Upcoming', variant: 'upcoming' };
  if (now > e) return { label: 'Past',     variant: 'past' };
  return         { label: 'Ongoing',  variant: 'ongoing' };
}

function DashboardPage() {
  const { tripService } = useServices();
  const { user }        = useAuth();
  const navigate        = useNavigate();
  const { toast, showToast } = useToast();

  const [trips, setTrips]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => { fetchTrips(); }, []);

  async function fetchTrips() {
    try {
      setLoading(true);
      const data = await tripService.getAll();
      setTrips(Array.isArray(data) ? data : data?.trips || []);
    } catch { showToast('Error loading trips.', 'error'); }
    finally { setLoading(false); }
  }

  async function handleCreate(formData) {
    try {
      setCreateLoading(true);
      await tripService.create(formData);
      setShowModal(false);
      await fetchTrips();
      showToast('Trip plan created!');
    } catch { showToast('Error creating trip.', 'error'); }
    finally { setCreateLoading(false); }
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!window.confirm('Delete this trip plan? This will also delete all destinations, activities, expenses and checklist items.')) return;
    try {
      await tripService.remove(id);
      setTrips((prev) => prev.filter((t) => t.id !== id));
      showToast('Trip deleted.');
    } catch { showToast('Error deleting trip.', 'error'); }
  }

  // Sort: ongoing first, then upcoming, then past
  const sortOrder = { ongoing: 0, upcoming: 1, past: 2 };
  const sortedTrips = [...trips].sort((a, b) => {
    const sa = getTripStatus(a.startDate, a.endDate).variant;
    const sb = getTripStatus(b.startDate, b.endDate).variant;
    return (sortOrder[sa] ?? 3) - (sortOrder[sb] ?? 3);
  });

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      <main style={{ maxWidth: '1120px', margin: '0 auto', padding: '48px 28px' }}>
        {/* Page header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '44px' }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: '52px', fontWeight: '300',
              lineHeight: 1.05, marginBottom: '8px', letterSpacing: '-0.01em',
            }}>
              My Travels
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              {loading ? 'Loading...' : trips.length === 0
                ? 'Start planning your next adventure'
                : `${trips.length} trip plan${trips.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + New Trip
          </Button>
        </div>

        {/* Trips grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '16px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: '210px', borderRadius: 'var(--radius-lg)' }} className="skeleton" />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <EmptyState
            icon="🗺"
            title="No trips yet"
            description="Create your first travel plan and start organizing your adventure."
            action={<Button variant="primary" onClick={() => setShowModal(true)}>+ Create First Trip</Button>}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '16px' }}>
            {sortedTrips.map((trip, idx) => {
              const status   = getTripStatus(trip.startDate, trip.endDate);
              const duration = getTripDuration(trip.startDate, trip.endDate);
              return (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  status={status}
                  duration={duration}
                  idx={idx}
                  onView={() => navigate(`/trips/${trip.id}`)}
                  onDelete={(e) => handleDelete(trip.id, e)}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Create Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Trip Plan">
        <TripForm
          onSubmit={handleCreate}
          onCancel={() => setShowModal(false)}
          loading={createLoading}
        />
      </Modal>

      <Toast toast={toast} />
    </div>
  );
}

function TripCard({ trip, status, duration, idx, onView, onDelete }) {
  return (
    <Card hover style={{ animation: `fadeIn 0.35s ease ${idx * 0.05}s both`, cursor: 'default' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', gap: '8px' }}>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '400',
          lineHeight: 1.2, flex: 1, paddingRight: '4px',
        }}>
          {trip.name}
        </h3>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      {/* Description */}
      {trip.description && (
        <p style={{
          fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px',
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.55,
        }}>
          {trip.description}
        </p>
      )}

      {/* Meta info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '18px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ opacity: 0.6 }}>📅</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>
            {trip.startDate?.slice(0, 10)} → {trip.endDate?.slice(0, 10)}
          </span>
          {duration && (
            <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>({duration})</span>
          )}
        </div>
        {trip.budget != null && (
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ opacity: 0.6 }}>💰</span>
            <span>Budget: </span>
            <span style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
              € {trip.budget.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
        <Button variant="accent" size="sm" onClick={onView}>View Details →</Button>
        <Button variant="ghost" size="sm" onClick={onDelete}>Delete</Button>
      </div>
    </Card>
  );
}

export default DashboardPage;
