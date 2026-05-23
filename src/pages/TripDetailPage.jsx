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
import { Button } from '../components/ui';

const TABS = [
  { id: 'Overview', icon: '◎' },
  { id: 'Activities', icon: '🗓' },
  { id: 'Checklist', icon: '✓' },
  { id: 'Expenses', icon: '💳' },
  { id: 'Share', icon: '🔗' },
];

function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tripService, activityService, checklistService, expenseService } = useServices();
  const { toast, showToast } = useToast();

  const [trip, setTrip] = useState(null);
  const [activities, setActivities] = useState([]);
  const [checklistItems, setChecklistItems] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [editMode, setEditMode] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);

  useEffect(() => { fetchAll(); }, [id]);

  async function fetchAll() {
    try {
      setLoading(true);
      const [tripData, activitiesData, checklistData, expensesData] = await Promise.all([
        tripService.getById(id),
        activityService.getAllByTrip(id),
        checklistService.getAllByTrip(id),
        expenseService.getAllByTrip(id),
      ]);
      setTrip(tripData);
      setActivities(activitiesData);
      setChecklistItems(checklistData);
      setExpenses(expensesData);
    } catch { showToast('Error loading trip.', 'error'); } finally { setLoading(false); }
  }

  async function handleEdit(formData) {
    try {
      setEditLoading(true);
      const updated = await tripService.update(id, formData);
      setTrip(updated); setEditMode(false);
      showToast('Trip updated.');
    } catch { showToast('Error updating trip.', 'error'); } finally { setEditLoading(false); }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this entire trip plan?')) return;
    try { await tripService.remove(id); navigate('/dashboard'); }
    catch { showToast('Error deleting trip.', 'error'); }
  }

  async function handleAddActivity(formData) {
    try {
      setActivityLoading(true);
      const created = await activityService.create(id, formData);
      setActivities((prev) => [...prev, created]);
      setShowActivityForm(false);
      showToast('Activity added!');
    } catch { showToast('Error adding activity.', 'error'); } finally { setActivityLoading(false); }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--accent-primary)', marginBottom: '8px' }}>Loading trip...</div>
        <div style={{ width: '200px', height: '3px', borderRadius: '2px', overflow: 'hidden', background: 'var(--bg-elevated)' }}>
          <div style={{ height: '100%', width: '60%', background: 'var(--accent-primary)', borderRadius: '2px', animation: 'shimmer 1.5s infinite' }} />
        </div>
      </div>
    </div>
  );

  if (!trip) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-muted)' }}>Trip not found.</p>
    </div>
  );

  const initialEditData = {
    name: trip.name || '',
    description: trip.description || '',
    startDate: trip.startDate?.slice(0, 10) || '',
    endDate: trip.endDate?.slice(0, 10) || '',
    budget: trip.budget?.toString() || '',
    notes: trip.notes || '',
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(17,17,24,0.8)',
        backdropFilter: 'blur(16px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '6px 12px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            ← Back
          </button>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '400', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trip.name}</h2>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {trip.startDate?.slice(0,10)} — {trip.endDate?.slice(0,10)}
          </span>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', position: 'sticky', top: '60px', zIndex: 90 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '0' }}>
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: '14px 20px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: '13px', fontFamily: 'var(--font-body)', fontWeight: '500',
              color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-muted)',
              borderBottom: `2px solid ${activeTab === tab.id ? 'var(--accent-primary)' : 'transparent'}`,
              transition: 'all var(--transition-fast)',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <span style={{ fontSize: '14px' }}>{tab.icon}</span>
              {tab.id}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>

        {/* OVERVIEW */}
        {activeTab === 'Overview' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {editMode ? (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-xl)', padding: '28px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--accent-primary)', marginBottom: '20px' }}>Edit Trip</h3>
                <TripForm initialData={initialEditData} onSubmit={handleEdit} onCancel={() => setEditMode(false)} loading={editLoading} />
              </div>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px', alignItems: 'start', marginBottom: '32px' }}>
                  <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: '300', marginBottom: '8px', lineHeight: 1.1 }}>{trip.name}</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                      {trip.startDate?.slice(0,10)} — {trip.endDate?.slice(0,10)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="secondary" size="sm" onClick={() => setEditMode(true)}>Edit</Button>
                    <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                  {[
                    { label: 'Start Date', value: trip.startDate?.slice(0,10), icon: '📅' },
                    { label: 'End Date', value: trip.endDate?.slice(0,10), icon: '📅' },
                    trip.budget != null && { label: 'Budget', value: `€ ${trip.budget.toLocaleString()}`, icon: '💰' },
                    { label: 'Activities', value: activities.length, icon: '🗓' },
                    { label: 'Checklist', value: `${checklistItems.filter(i=>i.isCompleted).length}/${checklistItems.length}`, icon: '✓' },
                    { label: 'Expenses', value: `€ ${expenses.reduce((s,e)=>s+(e.amount||0),0).toFixed(2)}`, icon: '💳' },
                  ].filter(Boolean).map((item) => (
                    <div key={item.label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '4px' }}>{item.icon} {item.label}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: '500' }}>{item.value ?? '—'}</div>
                    </div>
                  ))}
                </div>

                {trip.description && (
                  <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '8px' }}>Description</div>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{trip.description}</p>
                  </div>
                )}
                {trip.notes && (
                  <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '8px' }}>Notes</div>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{trip.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ACTIVITIES */}
        {activeTab === 'Activities' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '400' }}>Activities</h3>
              <Button variant="accent" onClick={() => setShowActivityForm(!showActivityForm)}>
                {showActivityForm ? '✕ Close' : '+ New Activity'}
              </Button>
            </div>
            {showActivityForm && (
              <ActivityForm onSubmit={handleAddActivity} onCancel={() => setShowActivityForm(false)} loading={activityLoading} />
            )}
            <div style={{ marginTop: showActivityForm ? '16px' : '0' }}>
              <ActivityList
                activities={activities} tripId={id}
                onDeleted={(deletedId) => setActivities((prev) => prev.filter((a) => a.id !== deletedId))}
                onUpdated={(updated) => { setActivities((prev) => prev.map((a) => a.id === updated.id ? updated : a)); showToast('Activity updated!'); }}
              />
            </div>
          </div>
        )}

        {/* CHECKLIST */}
        {activeTab === 'Checklist' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '400', marginBottom: '24px' }}>Packing List</h3>
            <ChecklistSection
              items={checklistItems} tripId={id}
              onAdded={(item) => setChecklistItems((prev) => [...prev, item])}
              onToggled={(updated) => setChecklistItems((prev) => prev.map((i) => i.id === updated.id ? updated : i))}
              onDeleted={(deletedId) => setChecklistItems((prev) => prev.filter((i) => i.id !== deletedId))}
            />
          </div>
        )}

        {/* EXPENSES */}
        {activeTab === 'Expenses' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '400', marginBottom: '24px' }}>Expenses</h3>
            <ExpenseSection
              expenses={expenses} tripId={id} budget={trip.budget}
              onAdded={(expense) => setExpenses((prev) => [...prev, expense])}
              onDeleted={(deletedId) => setExpenses((prev) => prev.filter((e) => e.id !== deletedId))}
            />
          </div>
        )}

        {/* SHARE */}
        {activeTab === 'Share' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '400', marginBottom: '24px' }}>Share Trip</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Generate a link to share this trip. Choose between view-only or full edit access.
            </p>
            <ShareSection tripId={id} />
          </div>
        )}
      </main>

      <Toast toast={toast} />
    </div>
  );
}

export default TripDetailPage;