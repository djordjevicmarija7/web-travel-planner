import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import tripService from '../services/tripService';
import TripForm from '../components/TripForm';

function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchTrip();
  }, [id]);

  async function fetchTrip() {
    try {
      setLoading(true);
      const data = await tripService.getById(id);
      setTrip(data);
    } catch (err) {
      setError('Error while loading trip.');
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(formData) {
    try {
      setEditLoading(true);
      const updated = await tripService.update(id, formData);
      setTrip(updated);
      setEditMode(false);
    } catch (err) {
      setError('Error while updating trip.');
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this trip?'))
      return;

    try {
      await tripService.remove(id);
      navigate('/dashboard');
    } catch (err) {
      setError('Error while deleting trip.');
    }
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!trip) return <p>Trip not found.</p>;

  const initialEditData = {
    name: trip.name || '',
    description: trip.description || '',
    startDate: trip.startDate?.slice(0, 10) || '',
    endDate: trip.endDate?.slice(0, 10) || '',
    budget: trip.budget?.toString() || '',
    notes: trip.notes || '',
  };

  return (
    <div>
      <button onClick={() => navigate('/dashboard')}>← Back</button>

      {editMode ? (
        <div>
          <h2>Edit trip</h2>
          <TripForm
            initialData={initialEditData}
            onSubmit={handleEdit}
            onCancel={() => setEditMode(false)}
            loading={editLoading}
          />
        </div>
      ) : (
        <div>
          <h2>{trip.name}</h2>
          {trip.description && <p>{trip.description}</p>}
          <p>
            <strong>Start date:</strong> {trip.startDate?.slice(0, 10)}
          </p>
          <p>
            <strong>End date:</strong> {trip.endDate?.slice(0, 10)}
          </p>
          {trip.budget && (
            <p>
              <strong>Budget:</strong> {trip.budget} €
            </p>
          )}
          {trip.notes && (
            <p>
              <strong>Notes:</strong> {trip.notes}
            </p>
          )}

          <button onClick={() => setEditMode(true)}>Edit</button>
          <button onClick={handleDelete}>Delete</button>
        </div>
      )}
    </div>
  );
}

export default TripDetailPage;