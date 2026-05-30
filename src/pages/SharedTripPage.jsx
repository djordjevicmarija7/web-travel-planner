import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useServices } from '../context/ServiceContext';
import sharedEditService from '../services/sharedEditService';
import { Badge, Button, Input, EmptyState, Modal, ProgressBar } from '../components/ui';
import ActivityForm from '../components/activity/ActivityForm';
import { ExpenseCategory } from '../enums/expense/ExpenseCategory';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { generateTripPdf } from '../utils/generateTripPdf';

const STATUS_LABELS = { planned: 'Planned', reserved: 'Reserved', completed: 'Completed', cancelled: 'Cancelled' };
const STATUS_COLORS = {
  planned: 'var(--status-planned)', reserved: 'var(--status-reserved)',
  completed: 'var(--status-completed)', cancelled: 'var(--status-cancelled)',
};
const STATUS_BG = {
  planned: 'rgba(91,156,246,0.12)', reserved: 'rgba(240,164,74,0.12)',
  completed: 'rgba(78,201,148,0.12)', cancelled: 'rgba(240,112,112,0.12)',
};
const CATEGORY_ICONS = {
  transport: '✈', accommodation: '🏨', food: '🍽',
  tickets: '🎟', shopping: '🛍', other: '📌',
};

function SharedTripPage() {
  const { shareService } = useServices();
  const { token } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');

  const [activities, setActivities] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [activityModal, setActivityModal] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [newCheckItem, setNewCheckItem] = useState('');
  const [checkLoading, setCheckLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null });

  useEffect(() => { fetchSharedTrip(); }, [token]);

  async function fetchSharedTrip() {
    try {
      setLoading(true);
      const result = await shareService.getSharedTrip(token);
      setData(result);
      setActivities(result.trip?.activities || []);
      setChecklist(result.trip?.checklistItems || []);
    } catch { setError('This link is invalid or has expired.'); }
    finally { setLoading(false); }
  }

  async function handleAddActivity(formData) {
    try {
      setActivityLoading(true);
      const created = await sharedEditService.createActivity(token, formData);
      setActivities(prev => [...prev, created]);
      setActivityModal(false);
    } catch { alert('Error adding activity.'); }
    finally { setActivityLoading(false); }
  }

  async function handleUpdateActivity(formData) {
    try {
      setActivityLoading(true);
      const updated = await sharedEditService.updateActivity(token, editTarget.id, formData);
      setActivities(prev => prev.map(a => a.id === updated.id ? updated : a));
      setEditTarget(null);
    } catch { alert('Error updating activity.'); }
    finally { setActivityLoading(false); }
  }

  function handleDeleteActivity(id) {
    setConfirmDialog({ isOpen: true, id });
  }

  async function handleDeleteActivityConfirmed() {
    const id = confirmDialog.id;
    setConfirmDialog({ isOpen: false, id: null });
    try { await sharedEditService.deleteActivity(token, id); setActivities(prev => prev.filter(a => a.id !== id)); }
    catch { alert('Error deleting activity.'); }
  }

  async function handleAddCheckItem(e) {
    e.preventDefault();
    if (!newCheckItem.trim()) return;
    try {
      setCheckLoading(true);
      const created = await sharedEditService.createChecklistItem(token, newCheckItem.trim());
      setChecklist(prev => [...prev, created]);
      setNewCheckItem('');
    } catch { alert('Error adding item.'); }
    finally { setCheckLoading(false); }
  }

  async function handleToggleCheckItem(item) {
    try {
      const updated = await sharedEditService.toggleChecklistItem(token, item.id, !item.isCompleted);
      setChecklist(prev => prev.map(i => i.id === updated.id ? updated : i));
    } catch { alert('Error updating item.'); }
  }

  async function handleDeleteCheckItem(id) {
    try {
      await sharedEditService.deleteChecklistItem(token, id);
      setChecklist(prev => prev.filter(i => i.id !== id));
    } catch { alert('Error deleting item.'); }
  }

  function handleDownloadPdf() {
    if (!data?.trip) return;
    setPdfLoading(true);
    try {
      generateTripPdf({
        ...data.trip,
        activities,
        checklist,
      });
    } finally {
      setPdfLoading(false);
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '300', color: 'var(--accent-primary)' }}>Loading...</div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px', padding: '24px' }}>
      <div style={{ fontSize: '52px' }}>🔒</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '300', color: 'var(--text-secondary)', textAlign: 'center' }}>{error}</h2>
      <button onClick={() => navigate('/login')} style={ctaBtn}>Go to Login</button>
    </div>
  );

  if (!data) return null;
  const { trip, accessType } = data;
  const isEdit = accessType === 'edit';

  const totalSpent = (trip.expenses || []).reduce((s, e) => s + (e.amount || 0), 0);
  const completedCheck = checklist.filter(i => i.isCompleted).length;
  const grouped = activities.reduce((acc, a) => {
    const d = a.date?.slice(0, 10);
    if (!acc[d]) acc[d] = [];
    acc[d].push(a);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort();
  const TABS = ['Overview', 'Activities', 'Checklist'];

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(12,12,18,0.88)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 200 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 28px', height: '62px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-glow))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: '#0c0c12' }}>✈</div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--accent-primary)', letterSpacing: '0.04em' }}>Wanderlust</span>
          </div>
          <div style={{ flex: 1 }} />
          <Badge variant={accessType}>{accessType.toUpperCase()} Access</Badge>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(17,17,24,0.92)', backdropFilter: 'blur(16px)', position: 'sticky', top: '62px', zIndex: 150 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 28px', display: 'flex' }}>
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '15px 18px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: '12px', fontFamily: 'var(--font-body)', fontWeight: '500',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              color: activeTab === tab ? 'var(--accent-primary)' : 'var(--text-muted)',
              borderBottom: `2px solid ${activeTab === tab ? 'var(--accent-primary)' : 'transparent'}`,
              transition: 'all var(--transition-fast)',
            }}>{tab}</button>
          ))}
        </div>
      </div>

      {/* Access banner */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 28px 0' }}>
        <div style={{
          padding: '11px 16px', borderRadius: 'var(--radius-md)', fontSize: '13px',
          background: isEdit ? 'rgba(240,164,74,0.07)' : 'rgba(91,156,246,0.07)',
          border: `1px solid ${isEdit ? 'rgba(240,164,74,0.2)' : 'rgba(91,156,246,0.2)'}`,
          color: isEdit ? 'var(--status-reserved)' : 'var(--status-planned)',
        }}>
          {isEdit
            ? '✏ You have edit access — you can add and modify activities and checklist items.'
            : '👁 You are viewing this trip plan in read-only mode.'}
        </div>
      </div>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '28px 28px 60px' }}>

        {/* ── OVERVIEW ── */}
        {activeTab === 'Overview' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {/* Title row + PDF button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: '300', lineHeight: 1.05, marginBottom: '6px' }}>{trip.name}</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                  {trip.startDate?.slice(0,10)} – {trip.endDate?.slice(0,10)}
                </p>
              </div>
              <button
                onClick={handleDownloadPdf}
                disabled={pdfLoading}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '9px 16px', marginTop: '8px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--accent-primary)',
                  fontSize: '12px', fontWeight: '500',
                  cursor: pdfLoading ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.03em',
                  opacity: pdfLoading ? 0.6 : 1,
                  transition: 'border-color 0.15s',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
                onMouseEnter={e => { if (!pdfLoading) e.currentTarget.style.borderColor = 'var(--accent-border)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
              >
                {pdfLoading ? '⏳' : '⬇'} {pdfLoading ? 'Generating...' : 'Download PDF'}
              </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '10px', marginBottom: '28px', marginTop: '28px' }}>
              {[
                { label: 'Duration',     value: getDuration(trip.startDate, trip.endDate) },
                { label: 'Destinations', value: (trip.destinations || []).length },
                { label: 'Activities',   value: activities.length },
                { label: 'Checklist',    value: `${completedCheck}/${checklist.length}` },
                trip.budget != null && { label: 'Budget', value: `€ ${trip.budget.toLocaleString()}`, accent: true },
                (trip.expenses || []).length > 0 && { label: 'Spent', value: `€ ${totalSpent.toFixed(2)}` },
              ].filter(Boolean).map((s) => (
                <div key={s.label} style={{
                  background: s.accent ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                  border: `1px solid ${s.accent ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)', padding: '14px 16px',
                }}>
                  <div style={{ fontSize: '10px', letterSpacing: '0.09em', textTransform: 'uppercase', color: s.accent ? 'var(--accent-dim)' : 'var(--text-muted)', marginBottom: '5px' }}>{s.label}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '300', color: s.accent ? 'var(--accent-primary)' : 'var(--text-primary)' }}>{s.value ?? '—'}</div>
                </div>
              ))}
            </div>

            {trip.description && <InfoBlock label="Description">{trip.description}</InfoBlock>}
            {trip.notes && (
              <InfoBlock label="Notes" style={{ marginTop: '10px' }}>
                <pre style={{ fontFamily: 'var(--font-body)', fontSize: '14px', whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.65, color: 'var(--text-secondary)' }}>{trip.notes}</pre>
              </InfoBlock>
            )}

            {/* Budget bar */}
            {trip.budget != null && (trip.expenses || []).length > 0 && (
              <div style={{ marginTop: '14px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '10px', letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Budget usage</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>€ {totalSpent.toFixed(2)} / € {trip.budget.toLocaleString()}</span>
                </div>
                <ProgressBar value={totalSpent} max={trip.budget} />
              </div>
            )}

            {/* Destinations */}
            {(trip.destinations || []).length > 0 && (
              <div style={{ marginTop: '28px' }}>
                <SectionLabel>Destinations ({trip.destinations.length})</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[...trip.destinations].sort((a, b) => new Date(a.arrivalDate) - new Date(b.arrivalDate)).map((dest) => (
                    <div key={dest.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderLeft: '3px solid var(--accent-primary)', borderRadius: 'var(--radius-md)', padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '19px' }}>{dest.name}</span>
                        {getNights(dest.arrivalDate, dest.departureDate) > 0 && (
                          <span style={{ fontSize: '10px', color: 'var(--accent-primary)', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', borderRadius: '10px', padding: '2px 8px' }}>
                            {getNights(dest.arrivalDate, dest.departureDate)} nights
                          </span>
                        )}
                      </div>
                      {dest.location && <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '2px' }}>📍 {dest.location}</div>}
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{dest.arrivalDate?.slice(0,10)} → {dest.departureDate?.slice(0,10)}</div>
                      {dest.description && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.55 }}>{dest.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expenses */}
            {(trip.expenses || []).length > 0 && (
              <div style={{ marginTop: '28px' }}>
                <SectionLabel>Expenses ({trip.expenses.length})</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {trip.expenses.map((expense) => (
                    <div key={expense.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '11px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '18px' }}>{CATEGORY_ICONS[expense.category] || '📌'}</span>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '500' }}>{expense.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{expense.date?.slice(0,10)}</div>
                        </div>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text-primary)' }}>€ {expense.amount?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ACTIVITIES ── */}
        {activeTab === 'Activities' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '300', marginBottom: '4px' }}>Activities</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{activities.length} activit{activities.length !== 1 ? 'ies' : 'y'} planned</p>
              </div>
              {isEdit && <Button variant="accent" onClick={() => setActivityModal(true)}>+ New Activity</Button>}
            </div>
            {activities.length === 0 ? (
              <EmptyState icon="🗓" title="No activities yet" description={isEdit ? 'Add the first activity using the button above.' : 'No activities planned yet.'} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {sortedDates.map((date) => (
                  <div key={date}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                      <div style={{ width: '3px', height: '18px', background: 'var(--accent-primary)', borderRadius: '2px' }} />
                      <span style={{ fontSize: '11px', fontWeight: '500', letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        {new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {grouped[date].map((activity) => (
                        <SharedActivityCard key={activity.id} activity={activity} isEdit={isEdit} onEdit={() => setEditTarget(activity)} onDelete={() => handleDeleteActivity(activity.id)} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CHECKLIST ── */}
        {activeTab === 'Checklist' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '300', marginBottom: '4px' }}>Packing List</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{completedCheck} of {checklist.length} items completed</p>
            </div>
            {checklist.length > 0 && (
              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '16px 18px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Progress</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: completedCheck === checklist.length ? 'var(--status-completed)' : 'var(--accent-primary)' }}>{completedCheck} / {checklist.length}</span>
                </div>
                <ProgressBar value={completedCheck} max={checklist.length} color={completedCheck === checklist.length ? 'var(--status-completed)' : undefined} />
              </div>
            )}
            {isEdit && (
              <form onSubmit={handleAddCheckItem} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                  <Input value={newCheckItem} onChange={e => setNewCheckItem(e.target.value)} placeholder="e.g. Passport, charger, tickets..." />
                </div>
                <Button type="submit" variant="accent" disabled={checkLoading || !newCheckItem.trim()}>+ Add</Button>
              </form>
            )}
            {checklist.length === 0 ? (
              <EmptyState icon="✓" title="Checklist is empty" description={isEdit ? 'Add items using the form above.' : 'No checklist items yet.'} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {[...checklist.filter(i => !i.isCompleted), ...checklist.filter(i => i.isCompleted)].map((item) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 15px', background: item.isCompleted ? 'rgba(78,201,148,0.04)' : 'var(--bg-surface)', border: `1px solid ${item.isCompleted ? 'rgba(78,201,148,0.14)' : 'var(--border-subtle)'}`, borderRadius: 'var(--radius-md)', transition: 'all var(--transition-fast)' }}>
                    <div onClick={() => isEdit && handleToggleCheckItem(item)} style={{ width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0, border: `2px solid ${item.isCompleted ? 'var(--status-completed)' : 'var(--border-strong)'}`, background: item.isCompleted ? 'var(--status-completed)' : 'transparent', cursor: isEdit ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all var(--transition-fast)' }}>
                      {item.isCompleted && <span style={{ color: '#0c0c12', fontSize: '11px', fontWeight: '700' }}>✓</span>}
                    </div>
                    <span style={{ flex: 1, fontSize: '14px', textDecoration: item.isCompleted ? 'line-through' : 'none', color: item.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)' }}>{item.title}</span>
                    {isEdit && (
                      <button onClick={() => handleDeleteCheckItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: '14px', padding: '2px 4px', transition: 'color var(--transition-fast)' }} onMouseEnter={e => e.target.style.color = 'var(--status-cancelled)'} onMouseLeave={e => e.target.style.color = 'var(--text-faint)'}>✕</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '36px 28px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>Plan your own travels with Wanderlust</p>
        <button onClick={() => navigate('/login')} style={ctaBtn}>Get Started →</button>
      </div>

      <Modal open={activityModal} onClose={() => setActivityModal(false)} title="New Activity">
        <ActivityForm onSubmit={handleAddActivity} onCancel={() => setActivityModal(false)} loading={activityLoading} />
      </Modal>
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Activity">
        {editTarget && (
          <ActivityForm
            initialData={{ name: editTarget.name || '', date: editTarget.date?.slice(0,10) || '', time: editTarget.time || '', location: editTarget.location || '', description: editTarget.description || '', estimatedCost: editTarget.estimatedCost?.toString() || '', status: editTarget.status || 'planned' }}
            onSubmit={handleUpdateActivity}
            onCancel={() => setEditTarget(null)}
            loading={activityLoading}
          />
        )}
      </Modal>
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Activity"
        message="Are you sure you want to delete this activity? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteActivityConfirmed}
        onCancel={() => setConfirmDialog({ isOpen: false, id: null })}
      />
    </div>
  );
}

function SharedActivityCard({ activity, isEdit, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ background: 'var(--bg-surface)', border: `1px solid ${hovered ? 'var(--border-default)' : 'var(--border-subtle)'}`, borderLeft: `3px solid ${STATUS_COLORS[activity.status] || 'var(--text-muted)'}`, padding: '12px 16px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', transition: 'all var(--transition-fast)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: '500', fontSize: '14px' }}>{activity.name}</span>
          {activity.time && <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{activity.time.slice(0,5)}</span>}
          <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 8px', borderRadius: '10px', fontWeight: '500', background: STATUS_BG[activity.status], color: STATUS_COLORS[activity.status] }}>{STATUS_LABELS[activity.status]}</span>
        </div>
        {activity.location && <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>📍 {activity.location}</div>}
        {activity.description && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{activity.description}</div>}
        {activity.estimatedCost != null && <div style={{ fontSize: '12px', color: 'var(--accent-primary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>€ {activity.estimatedCost}</div>}
      </div>
      {isEdit && (
        <div style={{ display: 'flex', gap: '6px', marginLeft: '12px', flexShrink: 0 }}>
          <button onClick={onEdit} style={actionBtn}>Edit</button>
          <button onClick={onDelete} style={{ ...actionBtn, color: 'var(--status-cancelled)', borderColor: 'rgba(240,112,112,0.2)' }}>✕</button>
        </div>
      )}
    </div>
  );
}

function InfoBlock({ label, children, style }) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px 18px', ...style }}>
      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-muted)', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '12px' }}>{children}</div>;
}

function getDuration(start, end) {
  if (!start || !end) return null;
  const diff = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
  return diff > 0 ? `${diff} days` : null;
}

function getNights(arrival, departure) {
  if (!arrival || !departure) return 0;
  return Math.ceil((new Date(departure) - new Date(arrival)) / (1000 * 60 * 60 * 24));
}

const ctaBtn = {
  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-glow))',
  border: 'none', borderRadius: 'var(--radius-md)', padding: '11px 28px',
  color: '#0c0c12', fontWeight: '600', fontSize: '13px', cursor: 'pointer',
  letterSpacing: '0.05em', textTransform: 'uppercase', boxShadow: 'var(--shadow-accent)',
};
const actionBtn = {
  background: 'none', border: '1px solid var(--border-subtle)', cursor: 'pointer',
  color: 'var(--text-secondary)', fontSize: '11px', padding: '4px 10px',
  borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-body)',
  transition: 'all var(--transition-fast)', letterSpacing: '0.03em',
};

export default SharedTripPage;