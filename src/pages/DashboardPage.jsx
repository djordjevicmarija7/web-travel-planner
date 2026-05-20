import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import tripService from '../services/tripService';
import TripForm from '../components/TripForm';
import { Trip } from '../models/Trip';

function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const data = await tripService.getAll();

      console.log('TRIPS RESPONSE:', data);

      setTrips(Array.isArray(data) ? data : data?.trips || []);
    } catch (err) {
      console.log(err);
      setError('Error loading trips.');
    } finally {
      setLoading(false);
    }
  };
  async function handleCreate(formData) {
    try {
      setCreateLoading(true);
      await tripService.create(formData);
      setShowCreateForm(false);
      await fetchTrips(); // refresh list
    } catch (err) {
      setError('Error creating trip.');
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this trip?'))
      return;

    try {
      await tripService.remove(id);
      setTrips((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError('Error deleting trip.');
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div>
      <div>
        <h1>Hello, {user?.name}!</h1>
        {user?.role === 'admin' && (
          <button onClick={() => navigate('/admin')}>
            Admin panel
          </button>
        )}
        <button onClick={handleLogout}>Log out</button>
      </div>

      <h2>My travel plans</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button onClick={() => setShowCreateForm(true)}>
        + New plan
      </button>

      {showCreateForm && (
        <div>
          <h3>New travel plan</h3>
          <TripForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreateForm(false)}
            loading={createLoading}
          />
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : trips.length === 0 ? (
        <p>You don't have any travel plans yet. Create your first one!</p>
      ) : (
        <div>
          {trips.map((trip) => (
            <div key={trip.id} style={{ border: '1px solid #ccc', padding: '12px', marginBottom: '8px' }}>
              <h3>{trip.name}</h3>
              <p>{trip.description}</p>
              <p>
                {trip.startDate?.slice(0, 10)} — {trip.endDate?.slice(0, 10)}
              </p>
              {trip.budget && <p>Budget: {trip.budget} €</p>}

              <button onClick={() => navigate(`/trips/${trip.id}`)}>
                Details
              </button>
              <button onClick={() => handleDelete(trip.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DashboardPage;