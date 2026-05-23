import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useServices } from '../context/ServiceContext';
import { Badge } from '../components/ui';

function SharedTripPage() {
  const { shareService } = useServices();
  const { token } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchSharedTrip(); }, [token]);

  async function fetchSharedTrip() {
    try {
      setLoading(true);
      const result = await shareService.getSharedTrip(token);
      setData(result);
    } catch { setError('This link is invalid or has expired.'); } finally { setLoading(false); }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--accent-primary)' }}>Loading...</div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '48px' }}>🔒</div>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--text-secondary)' }}>{error}</p>
      <button onClick={() => navigate('/login')} style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-md)', padding: '10px 20px', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '13px' }}>
        Go to Login
      </button>
    </div>
  );

  if (!data) return null;
  const { trip, accessType } = data;

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(17,17,24,0.8)', backdropFilter: 'blur(16px)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--accent-primary)' }}>✈ Wanderlust</span>
          <div style={{ flex: 1 }} />
          <Badge variant={accessType}>{accessType.toUpperCase()} Access</Badge>
        </div>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Access notice */}
        <div style={{
          padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '32px', fontSize: '13px',
          background: accessType === 'edit' ? 'rgba(245,158,11,0.08)' : 'rgba(74,158,255,0.08)',
          border: `1px solid ${accessType === 'edit' ? 'rgba(245,158,11,0.2)' : 'rgba(74,158,255,0.2)'}`,
          color: accessType === 'edit' ? 'var(--status-reserved)' : 'var(--status-planned)',
        }}>
          {accessType === 'view'
            ? '👁 You are viewing this trip plan in read-only mode.'
            : '✏ You have edit access to this trip plan.'}
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '42px', fontWeight: '300', marginBottom: '8px' }}>{trip.name}</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '14px' }}>
          {trip.startDate?.slice(0,10)} — {trip.endDate?.slice(0,10)}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {trip.description && (
            <InfoBlock label="Description">{trip.description}</InfoBlock>
          )}
          {trip.budget != null && (
            <InfoBlock label="Planned Budget">€ {trip.budget.toLocaleString()}</InfoBlock>
          )}
          {trip.notes && (
            <InfoBlock label="Notes">{trip.notes}</InfoBlock>
          )}

          {trip.destinations?.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '12px' }}>Destinations</div>
              {trip.destinations.map((dest) => (
                <div key={dest.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: '8px' }}>
                  <div style={{ fontWeight: '500', marginBottom: '4px' }}>{dest.name}</div>
                  {dest.location && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📍 {dest.location}</div>}
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {dest.arrivalDate?.slice(0,10)} — {dest.departureDate?.slice(0,10)}
                  </div>
                  {dest.description && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>{dest.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>Plan your own trips with Wanderlust</p>
          <button onClick={() => navigate('/login')} style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-glow))', border: 'none', borderRadius: 'var(--radius-md)', padding: '10px 24px', color: '#0a0a0f', fontWeight: '600', fontSize: '13px', cursor: 'pointer', letterSpacing: '0.04em' }}>
            Get Started
          </button>
        </div>
      </main>
    </div>
  );
}

function InfoBlock({ label, children }) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '6px' }}>{label}</div>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{children}</p>
    </div>
  );
}

export default SharedTripPage;