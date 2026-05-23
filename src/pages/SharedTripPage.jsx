import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import shareService from '../services/shareService';

function SharedTripPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSharedTrip();
  }, [token]);

  
  async function fetchSharedTrip() {
    try {
      setLoading(true);
      const result = await shareService.getSharedTrip(token);
      setData(result);
    } catch {
      setError('This link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p>Loading...</p>;

  if (error) {
    return (
      <div>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => navigate('/login')}>
          Go to login
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { trip, accessType } = data;

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <h2>{trip.name}</h2>
        <span style={{
          background: accessType === 'edit' ? '#FFF3CD' : '#D1ECF1',
          padding: '3px 10px',
          borderRadius: '4px',
          fontSize: '13px',
          fontWeight: 'bold'
        }}>
          {accessType === 'edit' ? 'EDIT access' : 'VIEW access'}
        </span>
      </div>

      {/* Specification: VIEW = read-only, EDIT = can modify */}
      {accessType === 'view' && (
        <p style={{
          background: '#f8f9fa',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '13px',
          color: '#666'
        }}>
          You are viewing someone else's trip plan — read only.
        </p>
      )}

      {accessType === 'edit' && (
        <p style={{
          background: '#FFF3CD',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '13px'
        }}>
          You have editing access for this trip plan.
        </p>
      )}

      <p>
        <strong>Period:</strong> {trip.startDate?.slice(0, 10)} —{' '}
        {trip.endDate?.slice(0, 10)}
      </p>

      {trip.description && (
        <p><strong>Description:</strong> {trip.description}</p>
      )}

      {trip.budget != null && (
        <p><strong>Budget:</strong> {trip.budget} €</p>
      )}

      {trip.notes && (
        <p><strong>Notes:</strong> {trip.notes}</p>
      )}

      {/* Destinations */}
      {trip.destinations?.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <h3>Destinations</h3>
          {trip.destinations.map((dest) => (
            <div
              key={dest.id}
              style={{
                border: '1px solid #ddd',
                padding: '10px',
                marginBottom: '8px',
                borderRadius: '6px'
              }}
            >
              <strong>{dest.name}</strong>
              {dest.location && <p>📍 {dest.location}</p>}
              <p>
                {dest.arrivalDate?.slice(0, 10)} —{' '}
                {dest.departureDate?.slice(0, 10)}
              </p>
              {dest.description && <p>{dest.description}</p>}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <button onClick={() => navigate('/login')}>
          Sign in to create your own trip plans
        </button>
      </div>
    </div>
  );
}

export default SharedTripPage;