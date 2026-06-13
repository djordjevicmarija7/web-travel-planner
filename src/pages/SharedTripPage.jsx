import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useServices } from '../context/ServiceContext';
import sharedEditService from '../services/sharedEditService';
import { Badge, Button, Input, EmptyState, Modal, ProgressBar } from '../components/ui';
import ActivityForm from '../components/activity/ActivityForm';
import SharedActivityCard from '../components/share/SharedActivityCard';
import SharedSection from '../components/share/SharedSection';
import SharedInfoBlock from '../components/share/SharedInfoBlock';
import SharedDestinationForm from '../components/share/SharedDestinationForm';
import SharedExpenseForm from '../components/share/SharedExpenseForm';
import TripEditForm from '../components/trip/TripEditForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { generateTripPdf } from '../utils/generateTripPdf';
import { formatDate, formatDateLong } from '../utils/formatDate';

const CATEGORY_ICONS = {
  transport: '✈', accommodation: '🏨', food: '🍽',
  tickets: '🎟', shopping: '🛍', other: '📌',
};
const CATEGORY_LABELS = {
  transport: 'Transport', accommodation: 'Accommodation', food: 'Food & Drink',
  tickets: 'Tickets', shopping: 'Shopping', other: 'Other',
};

function SharedTripPage() {
  const { shareService } = useServices();
  const { token } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [trip, setTrip] = useState(null);
  const [activities, setActivities] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [destinations, setDestinations] = useState([]);

  const [activityModal, setActivityModal] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);
  const [editActivityTarget, setEditActivityTarget] = useState(null);

  const [destModal, setDestModal] = useState(false);
  const [destLoading, setDestLoading] = useState(false);
  const [editDestTarget, setEditDestTarget] = useState(null);

  const [expenseModal, setExpenseModal] = useState(false);
  const [expenseLoading, setExpenseLoading] = useState(false);

  const [tripEditModal, setTripEditModal] = useState(false);
  const [tripEditLoading, setTripEditLoading] = useState(false);

  const [newCheckItem, setNewCheckItem] = useState('');
  const [checkLoading, setCheckLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null, type: null });

  useEffect(() => { fetchSharedTrip(); }, [token]);

  async function fetchSharedTrip() {
    try {
      setLoading(true);
      const result = await shareService.getSharedTrip(token);
      setData(result);
      setTrip(result.trip);
      setActivities(result.trip?.activities || []);
      setChecklist(result.trip?.checklistItems || result.trip?.checklist || []);
      setExpenses(result.trip?.expenses || []);
      setDestinations(result.trip?.destinations || []);
    } catch {
      setError('This link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
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
      const updated = await sharedEditService.updateActivity(token, editActivityTarget.id, formData);
      setActivities(prev => prev.map(a => a.id === updated.id ? updated : a));
      setEditActivityTarget(null);
    } catch { alert('Error updating activity.'); }
    finally { setActivityLoading(false); }
  }

  function openDeleteConfirm(id, type) {
    setConfirmDialog({ isOpen: true, id, type });
  }

  async function handleDeleteConfirmed() {
    const { id, type } = confirmDialog;
    setConfirmDialog({ isOpen: false, id: null, type: null });
    try {
      if (type === 'activity') {
        await sharedEditService.deleteActivity(token, id);
        setActivities(prev => prev.filter(a => a.id !== id));
      } else if (type === 'destination') {
        await sharedEditService.deleteDestination(token, id);
        setDestinations(prev => prev.filter(d => d.id !== id));
      } else if (type === 'expense') {
        await sharedEditService.deleteExpense(token, id);
        setExpenses(prev => prev.filter(e => e.id !== id));
      }
    } catch { alert('Error deleting item.'); }
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

  async function handleSubmitDestination(formData) {
    try {
      setDestLoading(true);
      if (editDestTarget) {
        const updated = await sharedEditService.updateDestination(token, editDestTarget.id, formData);
        setDestinations(prev => prev.map(d => d.id === updated.id ? updated : d));
      } else {
        const created = await sharedEditService.createDestination(token, formData);
        setDestinations(prev => [...prev, created]);
      }
      setDestModal(false);
      setEditDestTarget(null);
    } catch { alert('Error saving destination.'); }
    finally { setDestLoading(false); }
  }

  async function handleAddExpense(formData) {
    try {
      setExpenseLoading(true);
      const created = await sharedEditService.createExpense(token, formData);
      setExpenses(prev => [...prev, created]);
      setExpenseModal(false);
    } catch { alert('Error adding expense.'); }
    finally { setExpenseLoading(false); }
  }

  async function handleUpdateTrip(formData) {
    try {
      setTripEditLoading(true);
      const updated = await sharedEditService.updateTrip(token, formData);
      setTrip(updated);
      setTripEditModal(false);
    } catch { alert('Error updating trip.'); }
    finally { setTripEditLoading(false); }
  }

  function handleDownloadPdf() {
    if (!trip) return;
    setPdfLoading(true);
    try { generateTripPdf({ ...trip, activities, checklistItems: checklist, expenses, destinations }); }
    finally { setPdfLoading(false); }
  }

  if (loading) {
    return (
      <div style={loadingWrap}>
        <div style={loadingCard}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={errorWrap}>
        <div style={{ fontSize: '52px' }}>🔒</div>
        <h2 style={errorTitle}>{error}</h2>
        <button onClick={() => navigate('/login')} style={ctaBtn}>Go to Login</button>
      </div>
    );
  }

  if (!data || !trip) return null;

  const { accessType } = data;
  const isEdit = accessType === 'edit';

  const totalSpent = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const completedCheck = checklist.filter(i => i.isCompleted).length;
  const tripStartDate = trip.startDate?.slice(0, 10) || '';
  const tripEndDate = trip.endDate?.slice(0, 10) || '';

  const sortedActs = [...activities].sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
  const grouped = sortedActs.reduce((acc, a) => {
    const d = a.date?.slice(0, 10);
    if (!acc[d]) acc[d] = [];
    acc[d].push(a);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort();

  const sortedDestinations = [...destinations].sort((a, b) => new Date(a.arrivalDate) - new Date(b.arrivalDate));

  return (
    <div style={pageShell}>
      {/* Header */}
      <header style={topHeader}>
        <div style={headerInner}>
          <div style={brandWrap}>
            <div style={brandIcon}>✈</div>
            <span style={brandText}>Wanderlust</span>
          </div>
          <div style={{ flex: 1 }} />
          <Badge variant={accessType}>{accessType.toUpperCase()} Access</Badge>
          <button
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            style={pdfBtn}
            onMouseEnter={e => { if (!pdfLoading) e.currentTarget.style.borderColor = 'var(--accent-border)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
          >
            {pdfLoading ? '⏳' : '⬇'} {pdfLoading ? 'Generating...' : 'PDF'}
          </button>
        </div>
      </header>

      <main style={mainWrap}>
        {/* Hero */}
        <section style={heroCard}>
          <div style={{ ...accessPill, background: isEdit ? 'rgba(240,164,74,0.1)' : 'rgba(91,156,246,0.1)', borderColor: isEdit ? 'rgba(240,164,74,0.25)' : 'rgba(91,156,246,0.25)', color: isEdit ? 'var(--status-reserved)' : 'var(--status-planned)' }}>
            {isEdit ? '✎ Edit access' : '👁 View only'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <h1 style={heroTitle}>{trip.name}</h1>
              <p style={heroMeta}>{formatDate(tripStartDate)} – {formatDate(tripEndDate)}</p>
            </div>
            {isEdit && (
              <Button size="sm" variant="secondary" onClick={() => setTripEditModal(true)}>
                ✎ Edit Trip Info
              </Button>
            )}
          </div>
        </section>

        {/* Stats */}
        <section style={statsGrid}>
          {[
            trip.budget != null && { label: 'Budget', value: `€ ${Number(trip.budget).toLocaleString()}`, accent: true },
            activities.length > 0 && { label: 'Activities', value: activities.length },
            checklist.length > 0 && { label: 'Packed', value: `${completedCheck}/${checklist.length}` },
            expenses.length > 0 && { label: 'Spent', value: `€ ${totalSpent.toFixed(2)}` },
          ].filter(Boolean).map(s => (
            <div key={s.label} style={{ ...statCard, background: s.accent ? 'var(--accent-subtle)' : 'var(--bg-elevated)', borderColor: s.accent ? 'var(--accent-border)' : 'var(--border-subtle)' }}>
              <div style={{ ...statLabel, color: s.accent ? 'var(--accent-dim)' : 'var(--text-muted)' }}>{s.label}</div>
              <div style={{ ...statValue, color: s.accent ? 'var(--accent-primary)' : 'var(--text-primary)' }}>{s.value}</div>
            </div>
          ))}
        </section>

        {/* Description / Notes */}
        {(trip.description || trip.notes) && (
          <section style={stackedSection}>
            {trip.description && <SharedInfoBlock label="Description">{trip.description}</SharedInfoBlock>}
            {trip.notes && (
              <SharedInfoBlock label="Notes">
                <pre style={notesText}>{trip.notes}</pre>
              </SharedInfoBlock>
            )}
          </section>
        )}

        {/* ── Destinations ── */}
        <SharedSection
          label={`Destinations (${destinations.length})`}
          action={isEdit && (
            <Button size="sm" variant="accent" onClick={() => { setEditDestTarget(null); setDestModal(true); }}>
              + Add
            </Button>
          )}
        >
          {destinations.length === 0 ? (
            <EmptyState icon="🗺" title="No destinations" description={isEdit ? 'Add the first destination.' : 'No destinations yet.'} />
          ) : (
            <div style={cardList}>
              {sortedDestinations.map(dest => {
                const nights = Math.ceil((new Date(dest.departureDate) - new Date(dest.arrivalDate)) / 86400000);
                return (
                  <div key={dest.id} style={destinationCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px' }}>{dest.name}</span>
                          {nights > 0 && (
                            <span style={nightBadge}>{nights} night{nights !== 1 ? 's' : ''}</span>
                          )}
                        </div>
                        {dest.location && <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>📍 {dest.location}</div>}
                        <div style={{ fontSize: '11px', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                          {formatDate(dest.arrivalDate)} → {formatDate(dest.departureDate)}
                        </div>
                        {dest.description && <p style={mutedText}>{dest.description}</p>}
                        {dest.notes && <p style={{ ...mutedText, fontStyle: 'italic' }}>💬 {dest.notes}</p>}
                      </div>
                      {isEdit && (
                        <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                          <button onClick={() => { setEditDestTarget(dest); setDestModal(true); }} style={actionBtn}>Edit</button>
                          <button onClick={() => openDeleteConfirm(dest.id, 'destination')} style={{ ...actionBtn, color: 'var(--status-cancelled)', borderColor: 'rgba(240,112,112,0.2)' }}>✕</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SharedSection>

        {/* ── Activities ── */}
        <SharedSection
          label={`Activities (${activities.length})`}
          action={isEdit && (
            <Button size="sm" variant="accent" onClick={() => setActivityModal(true)}>+ Add</Button>
          )}
        >
          {activities.length === 0 ? (
            <EmptyState icon="🗓" title="No activities" description={isEdit ? 'Add the first activity.' : 'No activities yet.'} />
          ) : (
            <div style={timelineWrap}>
              {sortedDates.map(date => (
                <div key={date}>
                  <div style={dateLabelRow}>
                    <div style={dateMark} />
                    <span style={dateLabel}>{formatDateLong(date)}</span>
                  </div>
                  <div style={cardList}>
                    {grouped[date].map(activity => (
                      <SharedActivityCard
                        key={activity.id}
                        activity={activity}
                        isEdit={isEdit}
                        onEdit={() => setEditActivityTarget(activity)}
                        onDelete={() => openDeleteConfirm(activity.id, 'activity')}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SharedSection>

        {/* ── Checklist ── */}
        <SharedSection label={`Packing List (${completedCheck}/${checklist.length})`}>
          {checklist.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <ProgressBar value={completedCheck} max={checklist.length} color={completedCheck === checklist.length ? 'var(--status-completed)' : undefined} />
              <div style={miniNote}>
                {completedCheck === checklist.length && checklist.length > 0 ? '✔ All packed!' : `${checklist.length - completedCheck} item${checklist.length - completedCheck !== 1 ? 's' : ''} remaining`}
              </div>
            </div>
          )}
          {isEdit && (
            <form onSubmit={handleAddCheckItem} style={checkForm}>
              <div style={{ flex: 1 }}>
                <Input value={newCheckItem} onChange={e => setNewCheckItem(e.target.value)} placeholder="e.g. Passport, charger..." />
              </div>
              <Button type="submit" variant="accent" size="sm" disabled={checkLoading || !newCheckItem.trim()}>+ Add</Button>
            </form>
          )}
          {checklist.length === 0 ? (
            <EmptyState icon="✔" title="Checklist is empty" description={isEdit ? 'Add items above.' : 'No items yet.'} />
          ) : (
            <div style={checklistWrap}>
              {[...checklist.filter(i => !i.isCompleted), ...checklist.filter(i => i.isCompleted)].map(item => (
                <div key={item.id} style={{ ...checkItemCard, background: item.isCompleted ? 'rgba(78,201,148,0.04)' : 'var(--bg-elevated)', borderColor: item.isCompleted ? 'rgba(78,201,148,0.15)' : 'var(--border-subtle)' }}>
                  <div
                    onClick={() => isEdit && handleToggleCheckItem(item)}
                    style={{ ...checkBox, borderColor: item.isCompleted ? 'var(--status-completed)' : 'var(--border-strong, var(--border-default))', background: item.isCompleted ? 'var(--status-completed)' : 'transparent', cursor: isEdit ? 'pointer' : 'default' }}
                  >
                    {item.isCompleted && <span style={checkMark}>✔</span>}
                  </div>
                  <span style={{ ...checkText, textDecoration: item.isCompleted ? 'line-through' : 'none', color: item.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                    {item.title ?? item.name}
                  </span>
                  {isEdit && (
                    <button
                      onClick={() => handleDeleteCheckItem(item.id)}
                      style={deleteIconBtn}
                      onMouseEnter={e => (e.target.style.color = 'var(--status-cancelled)')}
                      onMouseLeave={e => (e.target.style.color = 'var(--text-faint, var(--text-muted))')}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </SharedSection>

        {/* ── Expenses ── */}
        <SharedSection
          label={`Expenses (${expenses.length})`}
          action={isEdit && (
            <Button size="sm" variant="accent" onClick={() => setExpenseModal(true)}>+ Add</Button>
          )}
        >
          {trip.budget != null && expenses.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <div style={budgetRow}>
                <span>Budget usage</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>€ {totalSpent.toFixed(2)} / € {Number(trip.budget).toLocaleString()}</span>
              </div>
              <ProgressBar value={totalSpent} max={trip.budget} />
            </div>
          )}
          {expenses.length === 0 ? (
            <EmptyState icon="💳" title="No expenses" description={isEdit ? 'Track spending by adding expenses.' : 'No expenses recorded.'} />
          ) : (
            <div style={expenseList}>
              {[...expenses].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')).map(expense => (
                <div key={expense.id} style={expenseCard}>
                  <div style={expenseLeft}>
                    <span style={expenseIcon}>{CATEGORY_ICONS[expense.category] || '📌'}</span>
                    <div>
                      <div style={expenseName}>{expense.name}</div>
                      <div style={expenseDate}>{CATEGORY_LABELS[expense.category] || expense.category} · {formatDate(expense.date)}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={expenseAmount}>€ {expense.amount?.toFixed(2)}</span>
                    {isEdit && (
                      <button
                        onClick={() => openDeleteConfirm(expense.id, 'expense')}
                        style={deleteIconBtn}
                        onMouseEnter={e => (e.target.style.color = 'var(--status-cancelled)')}
                        onMouseLeave={e => (e.target.style.color = 'var(--text-faint, var(--text-muted))')}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SharedSection>

        <div style={footerCta}>
          <p style={footerText}>Plan your own travels with Wanderlust</p>
          <button onClick={() => navigate('/login')} style={ctaBtn}>Get Started →</button>
        </div>
      </main>

      {/* ── Modals ── */}
      <Modal open={activityModal} onClose={() => setActivityModal(false)} title="New Activity">
        <ActivityForm onSubmit={handleAddActivity} onCancel={() => setActivityModal(false)} loading={activityLoading} tripStartDate={tripStartDate} tripEndDate={tripEndDate} />
      </Modal>

      <Modal open={!!editActivityTarget} onClose={() => setEditActivityTarget(null)} title="Edit Activity">
        {editActivityTarget && (
          <ActivityForm
            initialData={{ name: editActivityTarget.name || '', date: editActivityTarget.date?.slice(0, 10) || '', time: editActivityTarget.time || '', location: editActivityTarget.location || '', description: editActivityTarget.description || '', estimatedCost: editActivityTarget.estimatedCost?.toString() || '', status: editActivityTarget.status || 'planned' }}
            onSubmit={handleUpdateActivity}
            onCancel={() => setEditActivityTarget(null)}
            loading={activityLoading}
            tripStartDate={tripStartDate}
            tripEndDate={tripEndDate}
          />
        )}
      </Modal>

      <Modal open={destModal} onClose={() => { setDestModal(false); setEditDestTarget(null); }} title={editDestTarget ? 'Edit Destination' : 'New Destination'}>
        <SharedDestinationForm
          initialData={editDestTarget ? { name: editDestTarget.name || '', location: editDestTarget.location || '', arrivalDate: editDestTarget.arrivalDate?.slice(0, 10) || '', departureDate: editDestTarget.departureDate?.slice(0, 10) || '', description: editDestTarget.description || '', notes: editDestTarget.notes || '' } : null}
          onSubmit={handleSubmitDestination}
          onCancel={() => { setDestModal(false); setEditDestTarget(null); }}
          loading={destLoading}
          tripStartDate={tripStartDate}
          tripEndDate={tripEndDate}
        />
      </Modal>

      <Modal open={expenseModal} onClose={() => setExpenseModal(false)} title="New Expense">
        <SharedExpenseForm onSubmit={handleAddExpense} onCancel={() => setExpenseModal(false)} loading={expenseLoading} />
      </Modal>

      <Modal open={tripEditModal} onClose={() => setTripEditModal(false)} title="Edit Trip Info">
        {trip && (
          <TripEditForm trip={trip} onSubmit={handleUpdateTrip} onCancel={() => setTripEditModal(false)} loading={tripEditLoading} />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.type === 'activity' ? 'Delete Activity' : confirmDialog.type === 'destination' ? 'Delete Destination' : 'Delete Expense'}
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDialog({ isOpen: false, id: null, type: null })}
      />
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const pageShell = { minHeight: '100vh', background: 'radial-gradient(circle at top, rgba(91,156,246,0.08), transparent 34%), var(--bg-page, var(--bg-surface))' };
const topHeader = { borderBottom: '1px solid var(--border-subtle)', background: 'rgba(10,10,16,0.9)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 200 };
const headerInner = { maxWidth: '960px', margin: '0 auto', padding: '0 24px', minHeight: '60px', display: 'flex', alignItems: 'center', gap: '12px' };
const brandWrap = { display: 'flex', alignItems: 'center', gap: '8px' };
const brandIcon = { width: '26px', height: '26px', borderRadius: '7px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-glow))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#0c0c12' };
const brandText = { fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--accent-primary)', letterSpacing: '0.04em' };
const pdfBtn = { display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)', fontSize: '11px', fontWeight: '500', cursor: 'pointer', transition: 'border-color 0.15s', whiteSpace: 'nowrap' };
const mainWrap = { maxWidth: '960px', margin: '0 auto', padding: '32px 24px 80px' };
const heroCard = { background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0))', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '22px', marginBottom: '22px' };
const accessPill = { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '999px', marginBottom: '14px', fontSize: '11px', fontWeight: '600', border: '1px solid transparent' };
const heroTitle = { fontFamily: 'var(--font-display)', fontSize: '44px', fontWeight: '300', lineHeight: 1.05, margin: 0 };
const heroMeta = { color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'var(--font-mono)', marginTop: '8px', marginBottom: 0 };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '24px' };
const statCard = { border: '1px solid', borderRadius: '18px', padding: '12px 16px' };
const statLabel = { fontSize: '9px', letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '600' };
const statValue = { fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '300' };
const stackedSection = { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '26px' };
const notesText = { fontFamily: 'var(--font-body)', fontSize: '13px', whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.7, color: 'var(--text-secondary)' };
const cardList = { display: 'flex', flexDirection: 'column', gap: '8px' };
const destinationCard = { background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderLeft: '3px solid var(--accent-primary)', borderRadius: '18px', padding: '14px 16px' };
const nightBadge = { fontSize: '9px', color: 'var(--accent-primary)', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', borderRadius: '999px', padding: '2px 7px' };
const mutedText = { fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.65, marginBottom: 0 };
const timelineWrap = { display: 'flex', flexDirection: 'column', gap: '18px' };
const dateLabelRow = { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' };
const dateMark = { width: '2.5px', height: '16px', background: 'var(--accent-primary)', borderRadius: '2px' };
const dateLabel = { fontSize: '10px', fontWeight: '500', letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--text-muted)' };
const checkForm = { display: 'flex', gap: '8px', marginBottom: '14px' };
const miniNote = { fontSize: '10px', color: 'var(--text-muted)', marginTop: '5px' };
const checklistWrap = { display: 'flex', flexDirection: 'column', gap: '5px' };
const checkItemCard = { display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 13px', border: '1px solid', borderRadius: '16px', transition: 'all var(--transition-fast)' };
const checkBox = { width: '17px', height: '17px', borderRadius: '4px', flexShrink: 0, border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all var(--transition-fast)' };
const checkMark = { color: '#0c0c12', fontSize: '10px', fontWeight: '700', lineHeight: 1 };
const checkText = { flex: 1, fontSize: '13px' };
const deleteIconBtn = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint, var(--text-muted))', fontSize: '13px', padding: '2px 4px' };
const budgetRow = { display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '11px', color: 'var(--text-muted)' };
const expenseList = { display: 'flex', flexDirection: 'column', gap: '6px' };
const expenseCard = { background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const expenseLeft = { display: 'flex', alignItems: 'center', gap: '10px' };
const expenseIcon = { fontSize: '16px' };
const expenseName = { fontSize: '13px', fontWeight: '500' };
const expenseDate = { fontSize: '10px', color: 'var(--text-muted)' };
const expenseAmount = { fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-primary)' };
const footerCta = { marginTop: '56px', paddingTop: '32px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' };
const footerText = { color: 'var(--text-muted)', fontSize: '12px', marginBottom: '14px' };
const loadingWrap = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const loadingCard = { fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '300', color: 'var(--accent-primary)' };
const errorWrap = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px', padding: '24px' };
const errorTitle = { fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '300', color: 'var(--text-secondary)', textAlign: 'center', margin: 0 };
const ctaBtn = { background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-glow))', border: 'none', borderRadius: 'var(--radius-md)', padding: '10px 24px', color: '#0c0c12', fontWeight: '600', fontSize: '12px', cursor: 'pointer', letterSpacing: '0.05em', textTransform: 'uppercase' };
const actionBtn = { background: 'none', border: '1px solid var(--border-subtle)', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '10px', padding: '4px 9px', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-body)', transition: 'all var(--transition-fast)', letterSpacing: '0.03em' };

export default SharedTripPage;