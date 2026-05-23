import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TripForm from '../components/TripForm';
import ActivityForm from '../components/ActivityForm';
import ActivityList from '../components/ActivityList';
import ChecklistSection from '../components/ChecklistSection';
import ExpenseSection from '../components/ExpenseSection';
import ShareSection from '../components/ShareSection';
import { useServices } from '../context/ServiceContext';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

const TABS = ['Overview', 'Activities', 'Checklist', 'Expenses', 'Share'];

function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tripService, activityService, checklistService, expenseService } =
    useServices();
  const { toast, showToast } = useToast();

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
      const activitiesData = await activityService.getAllByTrip(id);
      const checklistData = await checklistService.getAllByTrip(id);
      const expensesData = await expenseService.getAllByTrip(id);
      setTrip(tripData);
      setActivities(activitiesData);
      setChecklistItems(checklistData);
      setExpenses(expensesData);

    } catch (err) {
      showToast('Error loading the trip plan.', 'error');
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
      showToast('Trip plan updated successfully.');
    } catch {
      showToast('Error while updating the trip plan.', 'error');
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
      showToast('Error while deleting the trip plan.', 'error');
    }
  }

  async function handleAddActivity(formData) {
    try {
      setActivityLoading(true);
      const created = await activityService.create(id, formData);
      setActivities((prev) => [...prev, created]);
      setShowActivityForm(false);
      showToast('Activity added successfully!');
    } catch {
      showToast('Error while adding new activity to trip plan.', 'error');
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
            onUpdated={(updated) => {
              setActivities((prev) =>
                prev.map((a) => (a.id === updated.id ? updated : a))
              );
              showToast('Activity updated successfully!');
            }}
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
      {activeTab === 'Share' && (
        <div>
          <ShareSection tripId={id} />
        </div>
      )}
    </div>
  );
}

export default TripDetailPage;