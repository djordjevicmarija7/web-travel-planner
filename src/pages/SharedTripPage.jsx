import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useServices } from '../context/ServiceContext';
import { Badge } from '../components/ui';

function SharedTripPage() {
  const { shareService }  = useServices();
  const { token }         = useParams();
  const navigate          = useNavigate();
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchSharedTrip(); }, [token]);

  async function fetchSharedTrip() {
    try {
      setLoading(true);
      const result = await shareService.getSharedTrip(token);
      setData(result);
    } catch { setError('This link is invalid or has expired.'); }
    finally { setLoading(false); }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '300', color: 'var(--accent-primary)' }}>
          Loading...
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '20px', padding: '24px',
    }}>
      <div style={{ fontSize: '52px' }}>🔒</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '300', color: 'var(--text-secondary)', textAlign: 'center' }}>
        {error}
      </h2>
      <button onClick={() => navigate('/login')} style={{
        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-glow))',
        border: 'none', borderRadius: 'var(--radius-md)', padding: '11px 24px',
        color: '#0c0c12', fontWeight: '600', fontSize: '13px', cursor: 'pointer',
        letterSpacing: '0.05em', textTransform: 'uppercase',
      }}>
        Go to Login
      </button>
    </div>
  );

  if (!data) return null;
  const { trip, accessType } = data;

  const isEdit = accessType === 'edit';

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(12,12,18,0.85)', backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{
          maxWidth: '860px', margin: '0 auto', padding: '0 28px',
          height: '62px', display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div style={{
              width: '26px', height: '26px', borderRadius: '6px',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-glow))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', color: '#0c0c12',
            }}>✈</div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--accent-primary)', letterSpacing: '0.04em' }}>
              Wanderlust
            </span>
          </div>
          <div style={{ flex: 1 }} />
          <Badge variant={accessType}>{accessType.toUpperCase()} Access</Badge>
        </div>
      </header>

      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '44px 28px' }}>
        {/* Access notice banner */}
        <div style={{
          padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '36px',
          fontSize: '13px', lineHeight: 1.5,
          background: isEdit ? 'rgba(240,164,74,0.07)' : 'rgba(91,156,246,0.07)',
          border: `1px solid ${isEdit ? 'rgba(240,164,74,0.2)' : 'rgba(91,156,246,0.2)'}`,
          color: isEdit ? 'var(--status-reserved)' : 'var(--status-planned)',
        }}>
          {isEdit
            ? '✏ You have edit access to this trip plan.'
            : '👁 You are viewing this trip plan in read-only mode.'}
        </div>

        {/* Trip title */}
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: '300',
          marginBottom: '8px', lineHeight: 1.05,
        }}>
          {trip.name}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'var(--font-mono)', marginBottom: '40px' }}>
          {trip.startDate?.slice(0,10)} – {trip.endDate?.slice(0,10)}
        </p>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {trip.description && (
            <SharedInfoBlock label="Description">{trip.description}</SharedInfoBlock>
          )}
          {trip.budget != null && (
            <SharedInfoBlock label="Planned Budget">
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontSize: '20px' }}>
                € {trip.budget.toLocaleString()}
              </span>
            </SharedInfoBlock>
          )}
          {trip.notes && (
            <SharedInfoBlock label="Notes">
              <pre style={{ fontFamily: 'var(--font-body)', whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.65, color: 'var(--text-secondary)', fontSize: '14px' }}>
                {trip.notes}
              </pre>
            </SharedInfoBlock>
          )}

          {/* Destinations */}
          {trip.destinations?.length > 0 && (
            <div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Destinations ({trip.destinations.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {trip.destinations.map((dest) => (
                  <div key={dest.id} style={{
                    background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                    borderLeft: '3px solid var(--accent-primary)',
                    borderRadius: 'var(--radius-md)', padding: '14px 18px',
                  }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '400', marginBottom: '5px' }}>
                      {dest.name}
                    </div>
                    {dest.location && (
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '3px' }}>📍 {dest.location}</div>
                    )}
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: dest.description ? '8px' : 0 }}>
                      {dest.arrivalDate?.slice(0,10)} → {dest.departureDate?.slice(0,10)}
                    </div>
                    {dest.description && (
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{dest.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activities */}
          {trip.activities?.length > 0 && (
            <div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Activities ({trip.activities.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {trip.activities.map((act) => (
                  <div key={act.id} style={{
                    background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)', padding: '12px 16px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  }}>
                    <div>
                      <div style={{ fontWeight: '500', fontSize: '14px', marginBottom: '3px' }}>{act.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {act.date?.slice(0,10)} {act.time ? `· ${act.time.slice(0,5)}` : ''}
                        {act.location ? ` · ${act.location}` : ''}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em',
                      padding: '3px 9px', borderRadius: '10px', fontWeight: '500',
                      background: STATUS_BG[act.status], color: STATUS_COLOR[act.status],
                    }}>
                      {act.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div style={{
          marginTop: '56px', paddingTop: '36px', borderTop: '1px solid var(--border-subtle)',
          textAlign: 'center',
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '18px' }}>
            Plan your own travels with Wanderlust
          </p>
          <button onClick={() => navigate('/login')} style={{
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-glow))',
            border: 'none', borderRadius: 'var(--radius-md)', padding: '11px 28px',
            color: '#0c0c12', fontWeight: '600', fontSize: '13px', cursor: 'pointer',
            letterSpacing: '0.05em', textTransform: 'uppercase',
            boxShadow: 'var(--shadow-accent)',
          }}>
            Get Started →
          </button>
        </div>
      </main>
    </div>
  );
}

const STATUS_BG = {
  planned:   'rgba(91,156,246,0.12)',
  reserved:  'rgba(240,164,74,0.12)',
  completed: 'rgba(78,201,148,0.12)',
  cancelled: 'rgba(240,112,112,0.12)',
};
const STATUS_COLOR = {
  planned:   'var(--status-planned)',
  reserved:  'var(--status-reserved)',
  completed: 'var(--status-completed)',
  cancelled: 'var(--status-cancelled)',
};

function SharedInfoBlock({ label, children }) {
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)', padding: '18px',
    }}>
      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-muted)', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
        {children}
      </div>
    </div>
  );
}

export default SharedTripPage;
