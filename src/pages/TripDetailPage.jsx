import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useServices } from '../context/ServiceContext';
import { useToast } from '../hooks/useToast';
import Navbar from '../components/common/Navbar';
import TripForm from '../components/trip/TripForm';
import ActivityForm from '../components/activity/ActivityForm';
import ActivityList from '../components/activity/ActivityList';
import DestinationSection from '../components/destination/DestinationSection';
import ChecklistSection from '../components/checklist/ChecklistSection';
import ExpenseSection from '../components/expense/ExpenseSection';
import ShareSection from '../components/share/ShareSection';
import Toast from '../components/common/Toast';
import { Button, Modal, StatCard, Spinner } from '../components/ui';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useSignalR } from '../hooks/useSignalR';

const TABS = [
  { id: 'Overview',     icon: '◎',  label: 'Overview' },
  { id: 'Destinations', icon: '🗺',  label: 'Destinations' },
  { id: 'Activities',   icon: '🗓',  label: 'Activities' },
  { id: 'Checklist',    icon: '✓',   label: 'Checklist' },
  { id: 'Expenses',     icon: '💳',  label: 'Expenses' },
  { id: 'Share',        icon: '🔗',  label: 'Share' },
];

function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tripService, activityService, checklistService, expenseService, destinationService } = useServices();
  const { toast, showToast } = useToast();

  const [trip, setTrip]                   = useState(null);
  const [activities, setActivities]       = useState([]);
  const [checklistItems, setChecklist]    = useState([]);
  const [expenses, setExpenses]           = useState([]);
  const [destinations, setDestinations]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [activeTab, setActiveTab]         = useState('Overview');
  const [editModal, setEditModal]         = useState(false);
  const [editLoading, setEditLoading]     = useState(false);
  const [activityModal, setActivityModal] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });

  useEffect(() => { fetchAll(); }, [id]);

useSignalR('http://localhost:5002/hubs/trips', {
  TripUpdated: (updated) => { if (updated.id === Number(id)) setTrip(updated); },
  TripDeleted: (deletedId) => { if (deletedId === Number(id)) navigate('/dashboard'); },
}, [id]);


useSignalR('http://localhost:5002/hubs/destinations', {
  DestinationCreated: (d) => { if (d.tripId === Number(id)) setDestinations(prev => prev.find(x => x.id === d.id) ? prev : [...prev, d]); },
  DestinationUpdated: (d) => { if (d.tripId === Number(id)) setDestinations(prev => prev.map(x => x.id === d.id ? d : x)); },
  DestinationDeleted: (did) => setDestinations(prev => prev.filter(x => x.id !== did)),
}, [id]);


useSignalR('http://localhost:5003/hubs/activities', {
  ActivityCreated: (a) => { if (a.tripId === Number(id)) setActivities(prev => prev.find(x => x.id === a.id) ? prev : [...prev, a]); },
  ActivityUpdated: (a) => { if (a.tripId === Number(id)) setActivities(prev => prev.map(x => x.id === a.id ? a : x)); },
  ActivityDeleted: (aid) => setActivities(prev => prev.filter(x => x.id !== aid)),
}, [id]);

useSignalR('http://localhost:5004/hubs/planning', {
  ChecklistItemCreated: (item) => { if (item.tripId === Number(id)) setChecklist(prev => prev.find(x => x.id === item.id) ? prev : [...prev, item]); },
  ChecklistItemToggled: (item) => { if (item.tripId === Number(id)) setChecklist(prev => prev.map(x => x.id === item.id ? item : x)); },
  ChecklistItemDeleted: (iid) => setChecklist(prev => prev.filter(x => x.id !== iid)),
  ExpenseCreated: (e) => { if (e.tripId === Number(id)) setExpenses(prev => prev.find(x => x.id === e.id) ? prev : [...prev, e]); },
  ExpenseDeleted: (eid) => setExpenses(prev => prev.filter(x => x.id !== eid)),
}, [id]);
  async function fetchAll() {
    try {
      setLoading(true);
      const [tripData, activitiesData, checklistData, expensesData, destinationsData] = await Promise.all([
        tripService.getById(id),
        activityService.getAllByTrip(id),
        checklistService.getAllByTrip(id),
        expenseService.getAllByTrip(id),
        destinationService.getAllByTrip(id),
      ]);
      setTrip(tripData);
      setActivities(activitiesData);
      setChecklist(checklistData);
      setExpenses(expensesData);
      setDestinations(destinationsData);
    } catch { showToast('Error loading trip.', 'error'); }
    finally { setLoading(false); }
  }

  async function handleEdit(formData) {
    try {
      setEditLoading(true);
      const updated = await tripService.update(id, formData);
      setTrip(updated); setEditModal(false);
      showToast('Trip updated.');
    } catch { showToast('Error updating trip.', 'error'); }
    finally { setEditLoading(false); }
  }

  function handleDelete() {
    setConfirmDialog({ isOpen: true });
  }
 
  async function handleDeleteConfirmed() {
    setConfirmDialog({ isOpen: false });
    try { await tripService.remove(id); navigate('/dashboard'); }
    catch { showToast('Error deleting trip.', 'error'); }
  }

  async function handleAddActivity(formData) {
    try {
      setActivityLoading(true);
      const created = await activityService.create(id, formData);
      setActivities((prev) => [...prev, created]);
      setActivityModal(false);
      showToast('Activity added!');
    } catch { showToast('Error adding activity.', 'error'); }
    finally { setActivityLoading(false); }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <Spinner size={32} />
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--accent-primary)', fontWeight: '300' }}>Loading trip...</div>
    </div>
  );

  if (!trip) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-muted)' }}>Trip not found.</p>
    </div>
  );

  const totalSpent         = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const completedChecklist = checklistItems.filter(i => i.isCompleted).length;
  const tripStartDate      = trip.startDate?.slice(0, 10) || '';
  const tripEndDate        = trip.endDate?.slice(0, 10)   || '';

  const initialEditData = {
    name: trip.name || '', description: trip.description || '',
    startDate: tripStartDate, endDate: tripEndDate,
    budget: trip.budget?.toString() || '', notes: trip.notes || '',
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar backTo="/dashboard" backLabel="My Travels" title={trip.name} subtitle={tripStartDate + ' – ' + tripEndDate} />

      {/* Tab bar */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(17,17,24,0.92)', backdropFilter: 'blur(16px)', position: 'sticky', top: '62px', zIndex: 150 }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 28px', display: 'flex', overflowX: 'auto' }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            let count = null;
            if (tab.id === 'Destinations') count = destinations.length || null;
            if (tab.id === 'Activities')   count = activities.length   || null;
            if (tab.id === 'Expenses')     count = expenses.length     || null;
            if (tab.id === 'Checklist' && checklistItems.length > 0)
              count = completedChecklist + '/' + checklistItems.length;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                padding: '16px 18px', border: 'none', background: 'none', cursor: 'pointer',
                fontSize: '12px', fontFamily: 'var(--font-body)', fontWeight: '500',
                letterSpacing: '0.05em', textTransform: 'uppercase',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                borderBottom: '2px solid ' + (isActive ? 'var(--accent-primary)' : 'transparent'),
                transition: 'all var(--transition-fast)',
                display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
              }}>
                <span style={{ fontSize: '13px' }}>{tab.icon}</span>
                {tab.label}
                {count !== null && (
                  <span style={{
                    background: isActive ? 'var(--accent-subtle)' : 'var(--bg-overlay)',
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                    border: '1px solid ' + (isActive ? 'var(--accent-border)' : 'var(--border-subtle)'),
                    borderRadius: '10px', fontSize: '10px', padding: '1px 6px',
                    fontFamily: 'var(--font-mono)',
                  }}>{count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <main style={{ maxWidth: '1120px', margin: '0 auto', padding: '36px 28px 60px' }}>

        {/* OVERVIEW */}
        {activeTab === 'Overview' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '44px', fontWeight: '300', lineHeight: 1.05, marginBottom: '6px' }}>{trip.name}</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>{tripStartDate} – {tripEndDate}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <Button variant="secondary" size="sm" onClick={() => setEditModal(true)}>Edit Trip</Button>
                <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(168px, 1fr))', gap: '10px', marginBottom: '28px' }}>
              <StatCard label="Start Date"   value={tripStartDate}  icon="📅" />
              <StatCard label="End Date"     value={tripEndDate}    icon="📅" />
              <StatCard label="Destinations" value={destinations.length} icon="🗺" />
              <StatCard label="Activities"   value={activities.length}   icon="🗓" />
              <StatCard label="Checklist"    value={completedChecklist + '/' + checklistItems.length} icon="✓" />
              <StatCard label="Total Spent"  value={'€ ' + totalSpent.toFixed(2)} icon="💳" />
              {trip.budget != null && <StatCard label="Budget"    value={'€ ' + trip.budget.toLocaleString()} icon="💰" accent />}
              {trip.budget != null && (
                <StatCard label="Remaining" value={'€ ' + (trip.budget - totalSpent).toFixed(2)} icon="💵" accent={(trip.budget - totalSpent) >= 0} />
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {trip.description && <InfoBlock label="Description">{trip.description}</InfoBlock>}
              {trip.notes && (
                <InfoBlock label="Notes">
                  <pre style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.65, whiteSpace: 'pre-wrap', margin: 0 }}>{trip.notes}</pre>
                </InfoBlock>
              )}
            </div>
          </div>
        )}

        {/* DESTINATIONS */}
        {activeTab === 'Destinations' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <SectionTitle title="Destinations" subtitle="Dates must stay within the trip range." />
            <DestinationSection
              destinations={destinations}
              tripId={id}
              tripStartDate={tripStartDate}
              tripEndDate={tripEndDate}
              onAdded={(d)   => { setDestinations((prev) => [...prev, d]); showToast('Destination added!'); }}
              onUpdated={(d) => { setDestinations((prev) => prev.map(x => x.id === d.id ? d : x)); showToast('Destination updated!'); }}
              onDeleted={(did) => { setDestinations((prev) => prev.filter(x => x.id !== did)); showToast('Destination removed.'); }}
            />
          </div>
        )}

        {/* ACTIVITIES */}
        {activeTab === 'Activities' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '300', marginBottom: '4px' }}>Activities</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Calendar shows trip range and active destinations per day.</p>
              </div>
              <Button variant="accent" onClick={() => setActivityModal(true)}>+ New Activity</Button>
            </div>
            <ActivityList
              activities={activities}
              tripId={id}
              tripStartDate={tripStartDate}
              tripEndDate={tripEndDate}
              destinations={destinations}
              onDeleted={(did) => setActivities((prev) => prev.filter(a => a.id !== did))}
              onUpdated={(upd) => { setActivities((prev) => prev.map(a => a.id === upd.id ? upd : a)); showToast('Activity updated!'); }}
            />
          </div>
        )}

        {/* CHECKLIST */}
        {activeTab === 'Checklist' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <SectionTitle title="Packing List" subtitle="Track items and tasks to complete before your trip." />
            <ChecklistSection
              items={checklistItems}
              tripId={id}
              onAdded={(item)  => setChecklist((prev) => [...prev, item])}
              onToggled={(upd) => setChecklist((prev) => prev.map(i => i.id === upd.id ? upd : i))}
              onDeleted={(did) => setChecklist((prev) => prev.filter(i => i.id !== did))}
            />
          </div>
        )}

        {/* EXPENSES */}
        {activeTab === 'Expenses' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <SectionTitle title="Expenses" subtitle="Track your spending and manage your budget." />
            <ExpenseSection
              expenses={expenses}
              tripId={id}
              budget={trip.budget}
              onAdded={(e)   => { setExpenses((prev) => [...prev, e]); showToast('Expense added!'); }}
              onDeleted={(did) => { setExpenses((prev) => prev.filter(e => e.id !== did)); showToast('Expense deleted.'); }}
            />
          </div>
        )}

        {/* SHARE */}
        {activeTab === 'Share' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <SectionTitle title="Share Trip" subtitle="Generate a link or QR code to share this trip plan." />
            <ShareSection tripId={id}  trip={trip}/>
          </div>
        )}
      </main>

      <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit Trip">
        <TripForm initialData={initialEditData} onSubmit={handleEdit} onCancel={() => setEditModal(false)} loading={editLoading} />
      </Modal>

      <Modal open={activityModal} onClose={() => setActivityModal(false)} title="New Activity">
        <ActivityForm onSubmit={handleAddActivity} onCancel={() => setActivityModal(false)} loading={activityLoading}   tripStartDate={tripStartDate}
  tripEndDate={tripEndDate} />
      </Modal>

      <Toast toast={toast} />
            <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Trip"
        message="Are you sure you want to delete this entire trip plan? All data will be permanently removed."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDialog({ isOpen: false })}
      />
    </div>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '300', marginBottom: '4px' }}>{title}</h3>
      {subtitle && <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{subtitle}</p>}
    </div>
  );
}

function InfoBlock({ label, children }) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '18px' }}>
      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-muted)', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

export default TripDetailPage;
