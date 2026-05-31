import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useServices } from '../context/ServiceContext';
import sharedEditService from '../services/sharedEditService';
import { Badge, Button, Input, EmptyState, Modal, ProgressBar } from '../components/ui';
import ActivityForm from '../components/activity/ActivityForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { generateTripPdf } from '../utils/generateTripPdf';

const STATUS_LABELS = { planned: 'Planned', reserved: 'Reserved', completed: 'Completed', cancelled: 'Cancelled' };
const STATUS_COLORS = {
  planned:   'var(--status-planned)',
  reserved:  'var(--status-reserved)',
  completed: 'var(--status-completed)',
  cancelled: 'var(--status-cancelled)',
};
const STATUS_BG = {
  planned:   'rgba(91,156,246,0.12)',
  reserved:  'rgba(240,164,74,0.12)',
  completed: 'rgba(78,201,148,0.12)',
  cancelled: 'rgba(240,112,112,0.12)',
};
const CATEGORY_ICONS = {
  transport: '✈', accommodation: '🏨', food: '🍽',
  tickets: '🎟', shopping: '🛍', other: '📌',
};

function SharedTripPage() {
  const { shareService } = useServices();
  const { token } = useParams();
  const navigate = useNavigate();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const [activities, setActivities] = useState([]);
  const [checklist, setChecklist]   = useState([]);

  const [activityModal, setActivityModal]   = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);
  const [editTarget, setEditTarget]         = useState(null);
  const [newCheckItem, setNewCheckItem]     = useState('');
  const [checkLoading, setCheckLoading]     = useState(false);
  const [pdfLoading, setPdfLoading]         = useState(false);
  const [confirmDialog, setConfirmDialog]   = useState({ isOpen: false, id: null });

  useEffect(() => { fetchSharedTrip(); }, [token]);

  async function fetchSharedTrip() {
    try {
      setLoading(true);
      const result = await shareService.getSharedTrip(token);
      setData(result);
      // Activities and checklist come embedded in trip DTO
      setActivities(result.trip?.activities || []);
      setChecklist(result.trip?.checklistItems || result.trip?.checklist || []);
    } catch { setError('This link is invalid or has expired.'); }
    finally { setLoading(false); }
  }

  // ── Activity handlers ─────────────────────────────────────────────────────
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

  function handleDeleteActivity(id) { setConfirmDialog({ isOpen: true, id }); }

  async function handleDeleteActivityConfirmed() {
    const id = confirmDialog.id;
    setConfirmDialog({ isOpen: false, id: null });
    try {
      await sharedEditService.deleteActivity(token, id);
      setActivities(prev => prev.filter(a => a.id !== id));
    } catch { alert('Error deleting activity.'); }
  }

  // ── Checklist handlers ────────────────────────────────────────────────────
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

  // ── PDF ───────────────────────────────────────────────────────────────────
  function handleDownloadPdf() {
    if (!data?.trip) return;
    setPdfLoading(true);
    try {
      generateTripPdf({ ...data.trip, activities, checklist });
    } finally { setPdfLoading(false); }
  }

  // ── Loading / error states ────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '300', color: 'var(--accent-primary)' }}>
        Loading...
      </div>
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

  const totalSpent     = (trip.expenses || []).reduce((s, e) => s + (e.amount || 0), 0);
  const completedCheck = checklist.filter(i => i.isCompleted).length;
  const sortedActs     = [...activities].sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));

  const grouped = sortedActs.reduce((acc, a) => {
    const d = a.date?.slice(0, 10);
    if (!acc[d]) acc[d] = [];
    acc[d].push(a);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page, var(--bg-surface))' }}>

      {/* ── Minimal header ────────────────────────────────────────────────── */}
      <header style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(10,10,16,0.9)',
        backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 200,
      }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '5px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-glow))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#0c0c12' }}>✈</div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--accent-primary)', letterSpacing: '0.04em' }}>Wanderlust</span>
          </div>
          <div style={{ flex: 1 }} />
          <Badge variant={accessType}>{accessType.toUpperCase()} Access</Badge>
          <button
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--accent-primary)',
              fontSize: '11px', fontWeight: '500',
              cursor: pdfLoading ? 'not-allowed' : 'pointer',
              opacity: pdfLoading ? 0.6 : 1,
              transition: 'border-color 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { if (!pdfLoading) e.currentTarget.style.borderColor = 'var(--accent-border)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
          >
            {pdfLoading ? '⏳' : '⬇'} {pdfLoading ? 'Generating...' : 'PDF'}
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 12px', borderRadius: '20px', marginBottom: '12px', fontSize: '11px', fontWeight: '500',
            background: isEdit ? 'rgba(240,164,74,0.1)' : 'rgba(91,156,246,0.1)',
            border: `1px solid ${isEdit ? 'rgba(240,164,74,0.25)' : 'rgba(91,156,246,0.25)'}`,
            color: isEdit ? 'var(--status-reserved)' : 'var(--status-planned)',
          }}>
            {isEdit ? '✏ Edit access' : '👁 View only'}
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: '300', lineHeight: 1.1, marginBottom: '6px' }}>
            {trip.name}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
            {trip.startDate?.slice(0,10)} – {trip.endDate?.slice(0,10)}
          </p>
        </div>

        {/* ── Stats strip ───────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {[
            trip.budget != null && { label: 'Budget', value: `€ ${trip.budget.toLocaleString()}`, accent: true },
            activities.length  > 0 && { label: 'Activities',   value: activities.length },
            checklist.length   > 0 && { label: 'Packed',       value: `${completedCheck}/${checklist.length}` },
            (trip.expenses||[]).length > 0 && { label: 'Spent', value: `€ ${totalSpent.toFixed(2)}` },
          ].filter(Boolean).map((s) => (
            <div key={s.label} style={{
              background: s.accent ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
              border: `1px solid ${s.accent ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-md)', padding: '10px 16px',
            }}>
              <div style={{ fontSize: '9px', letterSpacing: '0.09em', textTransform: 'uppercase', color: s.accent ? 'var(--accent-dim)' : 'var(--text-muted)', marginBottom: '3px' }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '300', color: s.accent ? 'var(--accent-primary)' : 'var(--text-primary)' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* ── Description / Notes ───────────────────────────────────────────── */}
        {(trip.description || trip.notes) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
            {trip.description && (
              <InfoBlock label="Description">{trip.description}</InfoBlock>
            )}
            {trip.notes && (
              <InfoBlock label="Notes">
                <pre style={{ fontFamily: 'var(--font-body)', fontSize: '13px', whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.65, color: 'var(--text-secondary)' }}>{trip.notes}</pre>
              </InfoBlock>
            )}
          </div>
        )}

        {/* ── Destinations ──────────────────────────────────────────────────── */}
        {(trip.destinations || []).length > 0 && (
          <Section label={`Destinations (${trip.destinations.length})`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[...trip.destinations]
                .sort((a, b) => new Date(a.arrivalDate) - new Date(b.arrivalDate))
                .map((dest) => {
                  const nights = Math.ceil((new Date(dest.departureDate) - new Date(dest.arrivalDate)) / 86400000);
                  return (
                    <div key={dest.id} style={{
                      background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                      borderLeft: '3px solid var(--accent-primary)',
                      borderRadius: 'var(--radius-md)', padding: '14px 16px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: '17px' }}>{dest.name}</span>
                            {nights > 0 && (
                              <span style={{ fontSize: '9px', color: 'var(--accent-primary)', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', borderRadius: '10px', padding: '2px 7px' }}>
                                {nights} night{nights !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          {dest.location && <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>📍 {dest.location}</div>}
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '11px', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                            {dest.arrivalDate?.slice(0,10)} → {dest.departureDate?.slice(0,10)}
                          </div>
                        </div>
                      </div>
                      {dest.description && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.55 }}>{dest.description}</p>}
                    </div>
                  );
                })
              }
            </div>
          </Section>
        )}

        {/* ── Activities ────────────────────────────────────────────────────── */}
        <Section
          label={`Activities (${activities.length})`}
          action={isEdit && (
            <Button size="sm" variant="accent" onClick={() => setActivityModal(true)}>+ Add</Button>
          )}
        >
          {activities.length === 0 ? (
            <EmptyState icon="🗓" title="No activities" description={isEdit ? 'Add the first activity.' : 'No activities planned yet.'} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {sortedDates.map((date) => (
                <div key={date}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ width: '2.5px', height: '16px', background: 'var(--accent-primary)', borderRadius: '2px' }} />
                    <span style={{ fontSize: '10px', fontWeight: '500', letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      {new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {grouped[date].map((activity) => (
                      <SharedActivityCard
                        key={activity.id}
                        activity={activity}
                        isEdit={isEdit}
                        onEdit={() => setEditTarget(activity)}
                        onDelete={() => handleDeleteActivity(activity.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ── Packing list ──────────────────────────────────────────────────── */}
        <Section
          label={`Packing List (${completedCheck}/${checklist.length})`}
          action={null}
        >
          {checklist.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <ProgressBar
                value={completedCheck}
                max={checklist.length}
                color={completedCheck === checklist.length ? 'var(--status-completed)' : undefined}
              />
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '5px' }}>
                {completedCheck === checklist.length && checklist.length > 0 ? '✓ All packed!' : `${checklist.length - completedCheck} item${checklist.length - completedCheck !== 1 ? 's' : ''} remaining`}
              </div>
            </div>
          )}

          {isEdit && (
            <form onSubmit={handleAddCheckItem} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <div style={{ flex: 1 }}>
                <Input
                  value={newCheckItem}
                  onChange={e => setNewCheckItem(e.target.value)}
                  placeholder="e.g. Passport, charger..."
                />
              </div>
              <Button type="submit" variant="accent" size="sm" disabled={checkLoading || !newCheckItem.trim()}>
                + Add
              </Button>
            </form>
          )}

          {checklist.length === 0 ? (
            <EmptyState icon="✓" title="Checklist is empty" description={isEdit ? 'Add items using the form above.' : 'No items yet.'} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[...checklist.filter(i => !i.isCompleted), ...checklist.filter(i => i.isCompleted)].map((item) => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 13px',
                  background: item.isCompleted ? 'rgba(78,201,148,0.04)' : 'var(--bg-elevated)',
                  border: `1px solid ${item.isCompleted ? 'rgba(78,201,148,0.15)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  transition: 'all var(--transition-fast)',
                }}>
                  <div
                    onClick={() => isEdit && handleToggleCheckItem(item)}
                    style={{
                      width: '17px', height: '17px', borderRadius: '4px', flexShrink: 0,
                      border: `2px solid ${item.isCompleted ? 'var(--status-completed)' : 'var(--border-strong, var(--border-default))'}`,
                      background: item.isCompleted ? 'var(--status-completed)' : 'transparent',
                      cursor: isEdit ? 'pointer' : 'default',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {item.isCompleted && (
                      <span style={{ color: '#0c0c12', fontSize: '10px', fontWeight: '700', lineHeight: 1 }}>✓</span>
                    )}
                  </div>
                  <span style={{
                    flex: 1, fontSize: '13px',
                    textDecoration: item.isCompleted ? 'line-through' : 'none',
                    color: item.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                  }}>
                    {item.title ?? item.name}
                  </span>
                  {isEdit && (
                    <button
                      onClick={() => handleDeleteCheckItem(item.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint, var(--text-muted))', fontSize: '13px', padding: '2px 4px' }}
                      onMouseEnter={e => e.target.style.color = 'var(--status-cancelled)'}
                      onMouseLeave={e => e.target.style.color = 'var(--text-faint, var(--text-muted))'}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ── Expenses (read-only view) ──────────────────────────────────────── */}
        {(trip.expenses || []).length > 0 && (
          <Section label={`Expenses (${trip.expenses.length})`}>
            {trip.budget != null && (
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>Budget usage</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>€ {totalSpent.toFixed(2)} / € {trip.budget.toLocaleString()}</span>
                </div>
                <ProgressBar value={totalSpent} max={trip.budget} />
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {trip.expenses.map((expense) => (
                <div key={expense.id} style={{
                  background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)', padding: '10px 14px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px' }}>{CATEGORY_ICONS[expense.category] || '📌'}</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '500' }}>{expense.name}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{expense.date?.slice(0,10)}</div>
                    </div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-primary)' }}>
                    € {expense.amount?.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Footer CTA ────────────────────────────────────────────────────── */}
        <div style={{ marginTop: '56px', paddingTop: '32px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '14px' }}>
            Plan your own travels with Wanderlust
          </p>
          <button onClick={() => navigate('/login')} style={ctaBtn}>Get Started →</button>
        </div>
      </main>

      {/* ── Modals ────────────────────────────────────────────────────────────── */}
      <Modal open={activityModal} onClose={() => setActivityModal(false)} title="New Activity">
        <ActivityForm
          onSubmit={handleAddActivity}
          onCancel={() => setActivityModal(false)}
          loading={activityLoading}
        />
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Activity">
        {editTarget && (
          <ActivityForm
            initialData={{
              name: editTarget.name || '',
              date: editTarget.date?.slice(0,10) || '',
              time: editTarget.time || '',
              location: editTarget.location || '',
              description: editTarget.description || '',
              estimatedCost: editTarget.estimatedCost?.toString() || '',
              status: editTarget.status || 'planned',
            }}
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

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ label, action, children }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          {label}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function InfoBlock({ label, children }) {
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
      borderLeft: '2px solid var(--accent-primary)',
      borderRadius: 'var(--radius-md)', padding: '14px 16px',
    }}>
      <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-muted)', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

function SharedActivityCard({ activity, isEdit, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg-elevated)',
        border: `1px solid ${hovered ? 'var(--border-default)' : 'var(--border-subtle)'}`,
        borderLeft: `3px solid ${STATUS_COLORS[activity.status] || 'var(--text-muted)'}`,
        padding: '11px 14px', borderRadius: 'var(--radius-md)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        transition: 'all var(--transition-fast)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: '500', fontSize: '13px' }}>{activity.name}</span>
          {activity.time && (
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {activity.time.slice(0,5)}
            </span>
          )}
          <span style={{
            fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.06em',
            padding: '2px 7px', borderRadius: '10px', fontWeight: '500',
            background: STATUS_BG[activity.status],
            color: STATUS_COLORS[activity.status],
          }}>
            {STATUS_LABELS[activity.status]}
          </span>
        </div>
        {activity.location && (
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>📍 {activity.location}</div>
        )}
        {activity.description && (
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{activity.description}</div>
        )}
        {activity.estimatedCost != null && (
          <div style={{ fontSize: '11px', color: 'var(--accent-primary)', marginTop: '3px', fontFamily: 'var(--font-mono)' }}>
            € {activity.estimatedCost}
          </div>
        )}
      </div>
      {isEdit && (
        <div style={{ display: 'flex', gap: '5px', marginLeft: '10px', flexShrink: 0 }}>
          <button onClick={onEdit} style={actionBtn}>Edit</button>
          <button onClick={onDelete} style={{ ...actionBtn, color: 'var(--status-cancelled)', borderColor: 'rgba(240,112,112,0.2)' }}>✕</button>
        </div>
      )}
    </div>
  );
}

const ctaBtn = {
  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-glow))',
  border: 'none', borderRadius: 'var(--radius-md)', padding: '10px 24px',
  color: '#0c0c12', fontWeight: '600', fontSize: '12px', cursor: 'pointer',
  letterSpacing: '0.05em', textTransform: 'uppercase',
};
const actionBtn = {
  background: 'none', border: '1px solid var(--border-subtle)', cursor: 'pointer',
  color: 'var(--text-secondary)', fontSize: '10px', padding: '4px 9px',
  borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-body)',
  transition: 'all var(--transition-fast)', letterSpacing: '0.03em',
};

export default SharedTripPage;