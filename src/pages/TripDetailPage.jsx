import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useServices } from '../context/ServiceContext';
import { useToast } from '../hooks/useToast';
import Navbar from '../components/common/Navbar';
import SectionTitle from '../components/common/SectionTitle';
import InfoBlock from '../components/common/InfoBlock';
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
import OverviewSection from '../components/common/OverviewSection'
import { useSignalR } from '../hooks/useSignalR';

const TABS = [
  { id: 'Overview', icon: '◎', label: 'Overview' },
  { id: 'Destinations', icon: '🗺', label: 'Destinations' },
  { id: 'Activities', icon: '🗓', label: 'Activities' },
  { id: 'Checklist', icon: '✔', label: 'Checklist' },
  { id: 'Expenses', icon: '💳', label: 'Expenses' },
  { id: 'Share', icon: '🔗', label: 'Share' },
];

// Dropdown za brzo prebacivanje između putovanja
function TripSwitcher({ currentTripId, currentTripName }) {
  const { tripService } = useServices();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [trips, setTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function toggleOpen() {
    if (!open && trips.length === 0) {
      try {
        setLoadingTrips(true);
        const data = await tripService.getAll();
        setTrips(Array.isArray(data) ? data : data?.trips || []);
      } catch { /* ignore */ }
      finally { setLoadingTrips(false); }
    }
    setOpen(o => !o);
  }

  function handleSelect(tripId) {
    setOpen(false);
    if (tripId !== Number(currentTripId)) navigate(`/trips/${tripId}`);
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={toggleOpen}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'none', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)', padding: '6px 12px',
          color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer',
          fontFamily: 'var(--font-body)', transition: 'all var(--transition-fast)',
          maxWidth: '260px',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentTripName}</span>
        <span style={{ fontSize: '10px', opacity: 0.7, flexShrink: 0 }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0,
          minWidth: '240px', maxHeight: '320px', overflowY: 'auto',
          background: 'rgba(20,20,28,0.98)', backdropFilter: 'blur(16px)',
          border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 200, padding: '6px',
        }}>
          {loadingTrips ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
              <Spinner size={18} />
            </div>
          ) : trips.length === 0 ? (
            <div style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--text-muted)' }}>No trips found.</div>
          ) : (
            trips.map(t => {
              const isActive = t.id === Number(currentTripId);
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelect(t.id)}
                  style={{
                    padding: '8px 10px', borderRadius: '6px', cursor: 'pointer',
                    fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '2px',
                    background: isActive ? 'var(--accent-subtle)' : 'transparent',
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-overlay)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {t.startDate?.slice(0, 10)} → {t.endDate?.slice(0, 10)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tripService, activityService, checklistService, expenseService, destinationService } = useServices();
  const { toast, showToast } = useToast();

  const [trip, setTrip] = useState(null);
  const [activities, setActivities] = useState([]);
  const [checklistItems, setChecklist] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [editModal, setEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
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
      setEditModal(false);
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
      await activityService.create(id, formData);
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

  const totalSpent = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const totalEstimated = activities
    .filter(a => a.status === 'planned' || a.status === 'reserved')
    .reduce((s, a) => s + (Number(a.estimatedCost) || 0), 0);
  const totalProjected = totalSpent + totalEstimated;
  const completedChecklist = checklistItems.filter(i => i.isCompleted).length;
  const tripStartDate = trip.startDate?.slice(0, 10) || '';
  const tripEndDate = trip.endDate?.slice(0, 10) || '';

  const hasBudget = trip.budget != null;
  const remaining = hasBudget ? trip.budget - totalProjected : null;
  const usageRatio = hasBudget && trip.budget > 0 ? totalProjected / trip.budget : 0;
  const usageColor = usageRatio > 0.9 ? 'var(--status-cancelled)' : usageRatio > 0.7 ? 'var(--status-reserved)' : 'var(--status-completed)';

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
            if (tab.id === 'Activities') count = activities.length || null;
            if (tab.id === 'Expenses') count = expenses.length || null;
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

      {hasBudget && (
        <div style={{
          background: 'rgba(17,17,24,0.92)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-subtle)',
          position: 'sticky',
          top: '110px',
          zIndex: 140,
        }}>
          <div style={{
            maxWidth: '1120px', margin: '0 auto',
            padding: '8px 28px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <span style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', flexShrink: 0 }}>
              Budget
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', flexShrink: 0 }}>
              € {trip.budget.toLocaleString()}
            </span>

            <div style={{ flex: 1, height: '4px', background: 'var(--bg-overlay)', borderRadius: '2px', overflow: 'hidden', margin: '0 8px' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(usageRatio * 100, 100)}%`,
                background: usageColor,
                borderRadius: '2px',
                transition: 'width 0.5s ease',
              }} />
            </div>

            <span style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', flexShrink: 0 }}>
              Remaining
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: '500', flexShrink: 0,
              color: remaining < 0 ? 'var(--status-cancelled)' : 'var(--status-completed)',
            }}>
              {remaining < 0 ? '−' : ''}€ {Math.abs(remaining).toFixed(2)}
            </span>

            <button
              onClick={() => setActiveTab('Expenses')}
              style={{
                background: 'none', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)', padding: '4px 10px',
                color: 'var(--text-muted)', fontSize: '11px', cursor: 'pointer',
                letterSpacing: '0.04em', transition: 'all var(--transition-fast)',
                flexShrink: 0, marginLeft: '4px',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              Expenses →
            </button>
          </div>
        </div>
      )}

      <main style={{ maxWidth: '1120px', margin: '0 auto', padding: '36px 28px 60px' }}>

        {/* OVERVIEW */}
        {activeTab === 'Overview' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '44px', fontWeight: '300', lineHeight: 1.05, marginBottom: '6px' }}>{trip.name}</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>{tripStartDate} — {tripEndDate}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <Button variant="secondary" size="sm" onClick={() => setEditModal(true)}>Edit Trip</Button>
                <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
              </div>
            </div>

            {/* General stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(168px, 1fr))', gap: '10px', marginBottom: '20px' }}>
              <StatCard label="Start Date" value={tripStartDate} icon="📅" />
              <StatCard label="End Date" value={tripEndDate} icon="📅" />
              <StatCard label="Destinations" value={destinations.length} icon="🗺" />
              <StatCard label="Activities" value={activities.length} icon="🗓" />
              <StatCard label="Checklist" value={`${completedChecklist}/${checklistItems.length}`} icon="✔" />
            </div>

            {/* Financial Overview — jedna konsolidovana kartica */}
            <div style={{
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md, 12px)',
              padding: '20px 24px',
              marginBottom: '28px',
              background: 'var(--bg-surface, rgba(255,255,255,0.02))',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '400', margin: 0 }}>
                   Financial Overview
                </h3>
                <button
                  onClick={() => setActiveTab('Expenses')}
                  style={{
                    background: 'none', border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)', padding: '4px 10px',
                    color: 'var(--text-muted)', fontSize: '11px', cursor: 'pointer',
                    letterSpacing: '0.04em', transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  View Expenses →
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Recorded</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: '500', color: 'var(--status-cancelled)' }}>€ {totalSpent.toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Estimated</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: '500', color: 'var(--status-reserved)' }}>€ {totalEstimated.toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Projected</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: '500', color: 'var(--text-primary)' }}>€ {totalProjected.toFixed(2)}</div>
                </div>
                {hasBudget && (
                  <div>
                    <div style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Budget</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: '500', color: 'var(--accent-primary)' }}>€ {trip.budget.toLocaleString()}</div>
                  </div>
                )}
                {hasBudget && (
                  <div>
                    <div style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Remaining</div>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: '500',
                      color: remaining < 0 ? 'var(--status-cancelled)' : 'var(--status-completed)',
                    }}>
                      {remaining < 0 ? '−' : ''}€ {Math.abs(remaining).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>

              {hasBudget && (
                <div>
                  <div style={{ height: '6px', background: 'var(--bg-overlay)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(usageRatio * 100, 100)}%`,
                      background: usageColor,
                      borderRadius: '3px',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                    {Math.min(usageRatio * 100, 999).toFixed(0)}% of budget used
                  </div>
                </div>
              )}
            </div>

            {/* Overview sections grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

              {/* Destinations */}
              <OverviewSection title="Destinations" icon="🗺" onViewAll={() => setActiveTab('Destinations')}>
                {destinations.length === 0
                  ? <p style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '4px 0' }}>No destinations yet.</p>
                  : [...destinations]
                    .sort((a, b) => new Date(a.arrivalDate) - new Date(b.arrivalDate))
                    .slice(0, 4)
                    .map(dest => {
                      const nights = Math.ceil((new Date(dest.departureDate) - new Date(dest.arrivalDate)) / 86400000);
                      return (
                        <div key={dest.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                          <div style={{ width: '3px', height: '36px', background: 'var(--accent-primary)', borderRadius: '2px', flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '500' }}>{dest.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                              {dest.arrivalDate?.slice(0, 10)} → {dest.departureDate?.slice(0, 10)}
                            </div>
                            {nights > 0 && <div style={{ fontSize: '10px', color: 'var(--accent-primary)', marginTop: '2px' }}>{nights} night{nights !== 1 ? 's' : ''}</div>}
                          </div>
                        </div>
                      );
                    })
                }
              </OverviewSection>

              {/* Checklist */}
              <OverviewSection title="Packing List" icon="✔" onViewAll={() => setActiveTab('Checklist')}>
                {checklistItems.length === 0
                  ? <p style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '4px 0' }}>Checklist is empty.</p>
                  : [...checklistItems].slice(0, 5).map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0, border: `1.5px solid ${item.isCompleted ? 'var(--status-completed)' : 'var(--border-strong)'}`, background: item.isCompleted ? 'var(--status-completed)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.isCompleted && <span style={{ fontSize: '9px', color: '#0c0c12', fontWeight: '700' }}>✔</span>}
                      </div>
                      <span style={{ fontSize: '13px', textDecoration: item.isCompleted ? 'line-through' : 'none', color: item.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                        {item.title}
                      </span>
                    </div>
                  ))
                }
              </OverviewSection>

              {/* Activities – full width */}
              <div style={{ gridColumn: '1 / -1' }}>
                <OverviewSection title="Activities" icon="🗓" onViewAll={() => setActiveTab('Activities')}>
                  {activities.length === 0
                    ? <p style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '4px 0' }}>No activities yet.</p>
                    : [...activities]
                      .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
                      .slice(0, 5)
                      .map(act => {
                        const STATUS_COLORS = { planned: 'var(--status-planned)', reserved: 'var(--status-reserved)', completed: 'var(--status-completed)', cancelled: 'var(--status-cancelled)' };
                        const STATUS_BG = { planned: 'rgba(91,156,246,0.12)', reserved: 'rgba(240,164,74,0.12)', completed: 'rgba(78,201,148,0.12)', cancelled: 'rgba(240,112,112,0.12)' };
                        return (
                          <div key={act.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '72px', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{act.date?.slice(0, 10)}</span>
                            {act.time && <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{act.time.slice(0, 5)}</span>}
                            <span style={{ fontSize: '13px', flex: 1 }}>{act.name}</span>
                            {act.location && <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>📍 {act.location}</span>}
                            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: STATUS_BG[act.status], color: STATUS_COLORS[act.status], flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              {act.status}
                            </span>
                          </div>
                        );
                      })
                  }
                </OverviewSection>
              </div>

              {/* Expenses – full width */}
              <div style={{ gridColumn: '1 / -1' }}>
                <OverviewSection title="Recent Expenses" icon="💳" onViewAll={() => setActiveTab('Expenses')}>
                  {expenses.length === 0
                    ? <p style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '4px 0' }}>No expenses recorded.</p>
                    : [...expenses]
                      .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
                      .slice(0, 4)
                      .map(exp => {
                        const CAT_ICONS = { transport: '✈', accommodation: '🏨', food: '🍽', tickets: '🎟', shopping: '🛍', other: '📌' };
                        return (
                          <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '15px' }}>{CAT_ICONS[exp.category] || '📌'}</span>
                              <div>
                                <div style={{ fontSize: '13px' }}>{exp.name}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{exp.date?.slice(0, 10)}</div>
                              </div>
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: '500', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>€ {exp.amount?.toFixed(2)}</span>
                          </div>
                        );
                      })
                  }
                </OverviewSection>
              </div>

              {/* Description & Notes – full width */}
              {(trip.description || trip.notes) && (
                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {trip.description && <InfoBlock label="Description">{trip.description}</InfoBlock>}
                  {trip.notes && (
                    <InfoBlock label="Notes">
                      <pre style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.65, whiteSpace: 'pre-wrap', margin: 0 }}>{trip.notes}</pre>
                    </InfoBlock>
                  )}
                </div>
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
              onAdded={() => showToast('Destination added!')}
              onUpdated={() => showToast('Destination updated!')}
              onDeleted={() => showToast('Destination removed.')}
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
              onAdded={() => showToast('Item added!')}
              onToggled={() => { }}
              onDeleted={() => showToast('Item removed.')}
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
              estimatedActivitiesCost={totalEstimated}
              onAdded={() => showToast('Expense added!')}
              onDeleted={() => showToast('Expense deleted.')}
            />
          </div>
        )}

        {/* SHARE */}
        {activeTab === 'Share' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <SectionTitle title="Share Trip" subtitle="Generate a link or QR code to share this trip plan." />
            <ShareSection
              tripId={id}
              trip={trip}
              activities={activities}
              checklistItems={checklistItems}
              expenses={expenses}
              destinations={destinations}
            />
          </div>
        )}
      </main>

      <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit Trip">
        <TripForm initialData={initialEditData} onSubmit={handleEdit} onCancel={() => setEditModal(false)} loading={editLoading} />
      </Modal>

      <Modal open={activityModal} onClose={() => setActivityModal(false)} title="New Activity">
        <ActivityForm
          onSubmit={handleAddActivity}
          onCancel={() => setActivityModal(false)}
          loading={activityLoading}
          tripStartDate={tripStartDate}
          tripEndDate={tripEndDate}
        />
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

export default TripDetailPage;