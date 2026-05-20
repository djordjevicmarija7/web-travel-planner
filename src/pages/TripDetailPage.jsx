import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import tripService from '../services/tripService';
import activityService from '../services/activityService';
import checklistService from '../services/checklistService';
import expenseService from '../services/expenseService';
import TripForm from '../components/TripForm';
import ActivityForm from '../components/ActivityForm';
import ActivityList from '../components/ActivityList';
import ChecklistSection from '../components/ChecklistSection';
import ExpenseSection from '../components/ExpenseSection';

const TABS = ['Overview', 'Activities', 'Checklist', 'Expenses'];

function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [activities, setActivities] = useState([]);
  const [checklistItems, setChecklistItems] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');
  const [editMode, setEditMode] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [id]);

async function fetchAll() {
  try {
    setLoading(true);

    const tripData = await tripService.getById(id);
    console.log('TRIP OK', tripData);

    const activitiesData = await activityService.getAllByTrip(id);
    console.log('ACTIVITIES OK', activitiesData);

    const checklistData = await checklistService.getAllByTrip(id);
    console.log('CHECKLIST OK', checklistData);

    const expensesData = await expenseService.getAllByTrip(id);
    console.log('EXPENSES OK', expensesData);

    setTrip(tripData);
    setActivities(activitiesData);
    setChecklistItems(checklistData);
    setExpenses(expensesData);

  } catch (err) {
    console.log(err);
    console.log(err.response);

    setError('Error loading the trip plan.');
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
    } catch {
      setError('Error updating the trip plan.');
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete the entire trip plan?')) return;
    try {
      await tripService.remove(id);
      navigate('/dashboard');
    } catch {
      setError('Error deleting the trip plan.');
    }
  }

  async function handleAddActivity(formData) {
    try {
      setActivityLoading(true);
      const created = await activityService.create(id, formData);
      setActivities((prev) => [...prev, created]);
      setShowActivityForm(false);
    } catch {
      alert('Error adding activity.');
    } finally {
      setActivityLoading(false);
    }
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!trip) return <p>Trip plan not found.</p>;

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

      <h2>{trip.name}</h2>
      <p>
        {trip.startDate?.slice(0, 10)} — {trip.endDate?.slice(0, 10)}
      </p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #ccc', paddingBottom: '8px' }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              borderBottom: activeTab === tab ? '2px solid black' : 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <div>
          {editMode ? (
            <>
              <h3>Edit trip</h3>
              <TripForm
                initialData={initialEditData}
                onSubmit={handleEdit}
                onCancel={() => setEditMode(false)}
                loading={editLoading}
              />
            </>
          ) : (
            <>
              {trip.description && <p>{trip.description}</p>}
              {trip.budget != null && <p>Budget: {trip.budget} €</p>}
              {trip.notes && <p>Notes: {trip.notes}</p>}
              <button onClick={() => setEditMode(true)}>Edit</button>
              <button onClick={handleDelete}>Delete trip</button>
            </>
          )}
        </div>
      )}

      {activeTab === 'Activities' && (
        <div>
          <h3>Activities by day</h3>
          <button onClick={() => setShowActivityForm(!showActivityForm)}>
            {showActivityForm ? 'Close' : '+ New activity'}
          </button>

          {showActivityForm && (
            <ActivityForm
              onSubmit={handleAddActivity}
              onCancel={() => setShowActivityForm(false)}
              loading={activityLoading}
            />
          )}

          <ActivityList
            activities={activities}
            tripId={id}
            onDeleted={(deletedId) =>
              setActivities((prev) => prev.filter((a) => a.id !== deletedId))
            }
          />
        </div>
      )}

      {activeTab === 'Checklist' && (
        <div>
          <h3>Packing list</h3>
          <ChecklistSection
            items={checklistItems}
            tripId={id}
            onAdded={(item) => setChecklistItems((prev) => [...prev, item])}
            onToggled={(updated) =>
              setChecklistItems((prev) =>
                prev.map((i) => (i.id === updated.id ? updated : i))
              )
            }
            onDeleted={(deletedId) =>
              setChecklistItems((prev) => prev.filter((i) => i.id !== deletedId))
            }
          />
        </div>
      )}

      {activeTab === 'Expenses' && (
        <div>
          <h3>Expense records</h3>
          <ExpenseSection
            expenses={expenses}
            tripId={id}
            budget={trip.budget}
            onAdded={(expense) => setExpenses((prev) => [...prev, expense])}
            onDeleted={(deletedId) =>
              setExpenses((prev) => prev.filter((e) => e.id !== deletedId))
            }
          />
        </div>
      )}
    </div>
  );
}

export default TripDetailPage;