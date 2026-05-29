import { useState } from 'react';
import activityService from '../../services/activityService';
import ActivityForm from './ActivityForm';
import ConfirmDialog from '../common/ConfirmDialog';
import { Badge, EmptyState, Modal } from '../ui';

const STATUS_LABELS = {
  planned: 'Planned', reserved: 'Reserved',
  completed: 'Completed', cancelled: 'Cancelled',
};
const STATUS_COLORS = {
  planned:   'var(--status-planned)',
  reserved:  'var(--status-reserved)',
  completed: 'var(--status-completed)',
  cancelled: 'var(--status-cancelled)',
};

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_NAMES = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function getDaysInMonth(y, m)  { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfMonth(y, m) {
  const d = new Date(y, m, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

function ActivityList({ activities, tripId, onDeleted, onUpdated }) {
  const [view, setView]             = useState('list');
  const firstDate = activities.length > 0 ? new Date(activities[0].date) : new Date();
  const [calYear, setCalYear]       = useState(firstDate.getFullYear());
  const [calMonth, setCalMonth]     = useState(firstDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null });

  const grouped = activities.reduce((acc, a) => {
    const d = a.date?.slice(0, 10);
    if (!acc[d]) acc[d] = [];
    acc[d].push(a);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort();

  function handleDelete(id) {
    setConfirmDialog({ isOpen: true, id });
  }

  async function handleDeleteConfirmed() {
    const id = confirmDialog.id;
    setConfirmDialog({ isOpen: false, id: null });
    try { await activityService.remove(tripId, id); onDeleted(id); }
    catch { alert('Error deleting activity.'); }
  }

  async function handleUpdate(formData) {
    try {
      setEditLoading(true);
      const updated = await activityService.update(tripId, editTarget.id, formData);
      onUpdated(updated);
      setEditTarget(null);
    } catch { alert('Error updating activity.'); } finally { setEditLoading(false); }
  }

  function prevMonth() {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
    setSelectedDay(null);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
    setSelectedDay(null);
  }

  const selectedKey = selectedDay
    ? `${calYear}-${String(calMonth + 1).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}`
    : null;
  const selectedActivities = selectedKey ? (grouped[selectedKey] || []) : [];

  if (activities.length === 0) {
    return <EmptyState icon="🗓" title="No activities yet" description="Start planning your days by adding your first activity." />;
  }

  return (
    <div>
      {/* View toggle */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '22px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '4px', width: 'fit-content' }}>
        {['list','calendar'].map((v) => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: '7px 18px', borderRadius: 'var(--radius-sm)', border: 'none',
            background: view === v ? 'var(--accent-subtle)' : 'transparent',
            color: view === v ? 'var(--accent-primary)' : 'var(--text-muted)',
            fontWeight: view === v ? '500' : '400',
            fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase',
            cursor: 'pointer', transition: 'all var(--transition-fast)',
          }}>
            {v === 'list' ? '≡ List' : '◫ Calendar'}
          </button>
        ))}
      </div>

      {/* LIST VIEW */}
      {view === 'list' && (
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
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onDelete={() => handleDelete(activity.id)}
                    onEdit={() => setEditTarget(activity)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CALENDAR VIEW */}
      {view === 'calendar' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <button onClick={prevMonth} style={navBtnStyle}>‹</button>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '300', letterSpacing: '0.04em' }}>
              {MONTH_NAMES[calMonth]} {calYear}
            </span>
            <button onClick={nextMonth} style={navBtnStyle}>›</button>
          </div>

          <div style={calGridStyle}>
            {DAY_NAMES.map((d) => (
              <div key={d} style={{ textAlign: 'center', fontSize: '10px', fontWeight: '500', letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '8px 0' }}>{d}</div>
            ))}
          </div>

          <div style={calGridStyle}>
            {Array.from({ length: getFirstDayOfMonth(calYear, calMonth) }).map((_, i) => (
              <div key={`e-${i}`} style={{ minHeight: '76px' }} />
            ))}
            {Array.from({ length: getDaysInMonth(calYear, calMonth) }).map((_, i) => {
              const day = i + 1;
              const key = `${calYear}-${String(calMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
              const dayActs = grouped[key] || [];
              const isSelected = selectedDay === day;
              const t = new Date();
              const isToday = t.getFullYear() === calYear && t.getMonth() === calMonth && t.getDate() === day;

              return (
                <div key={day} onClick={() => setSelectedDay(isSelected ? null : day)} style={{
                  border: isSelected
                    ? '1px solid var(--accent-primary)'
                    : isToday
                      ? '1px solid rgba(91,156,246,0.4)'
                      : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)', padding: '8px', minHeight: '76px',
                  cursor: 'pointer',
                  background: isSelected ? 'var(--accent-subtle)' : isToday ? 'rgba(91,156,246,0.04)' : 'var(--bg-surface)',
                  transition: 'all var(--transition-fast)',
                }}>
                  <div style={{ fontSize: '12px', fontWeight: isToday ? '600' : '400', color: isToday ? 'var(--status-planned)' : 'var(--text-secondary)', marginBottom: '4px' }}>{day}</div>
                  {dayActs.slice(0, 2).map((act) => (
                    <div key={act.id} title={act.name} style={{
                      fontSize: '10px', color: '#fff',
                      background: STATUS_COLORS[act.status] || 'var(--text-muted)',
                      borderRadius: '3px', padding: '1px 5px', marginBottom: '2px',
                      overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', opacity: 0.9,
                    }}>
                      {act.time ? `${act.time.slice(0,5)} ` : ''}{act.name}
                    </div>
                  ))}
                  {dayActs.length > 2 && (
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>+{dayActs.length - 2}</div>
                  )}
                </div>
              );
            })}
          </div>

          {selectedDay && (
            <div style={{ marginTop: '20px', background: 'var(--bg-elevated)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-lg)', padding: '18px', animation: 'fadeIn 0.2s ease' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '300', marginBottom: '14px', color: 'var(--accent-primary)' }}>
                {selectedDay} {MONTH_NAMES[calMonth]} {calYear}
              </div>
              {selectedActivities.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No activities for this day.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedActivities.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} onDelete={() => handleDelete(activity.id)} onEdit={() => setEditTarget(activity)} />
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: STATUS_COLORS[key] }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Activity">
        {editTarget && (
          <ActivityForm
            initialData={{
              name: editTarget.name || '',
              date: editTarget.date?.slice(0, 10) || '',
              time: editTarget.time || '',
              location: editTarget.location || '',
              description: editTarget.description || '',
              estimatedCost: editTarget.estimatedCost?.toString() || '',
              status: editTarget.status || 'planned',
            }}
            onSubmit={handleUpdate}
            onCancel={() => setEditTarget(null)}
            loading={editLoading}
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
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDialog({ isOpen: false, id: null })}
      />
    </div>
  );
}

function ActivityCard({ activity, onDelete, onEdit }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${hovered ? 'var(--border-default)' : 'var(--border-subtle)'}`,
        borderLeft: `3px solid ${STATUS_COLORS[activity.status] || 'var(--text-muted)'}`,
        padding: '12px 16px', borderRadius: 'var(--radius-md)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        transition: 'all var(--transition-fast)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: '500', fontSize: '14px' }}>{activity.name}</span>
          {activity.time && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {activity.time.slice(0, 5)}
            </span>
          )}
          <Badge variant={activity.status}>{STATUS_LABELS[activity.status]}</Badge>
        </div>
        {activity.location && (
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>📍 {activity.location}</div>
        )}
        {activity.description && (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{activity.description}</div>
        )}
        {activity.estimatedCost != null && (
          <div style={{ fontSize: '12px', color: 'var(--accent-primary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            € {activity.estimatedCost}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: '6px', marginLeft: '12px', flexShrink: 0 }}>
        <button onClick={onEdit} style={actionBtnStyle}>Edit</button>
        <button onClick={onDelete} style={{ ...actionBtnStyle, color: 'var(--status-cancelled)', borderColor: 'rgba(240,112,112,0.2)' }}>✕</button>
      </div>
    </div>
  );
}

const actionBtnStyle = {
  background: 'none', border: '1px solid var(--border-subtle)', cursor: 'pointer',
  color: 'var(--text-secondary)', fontSize: '11px', padding: '4px 10px',
  borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-body)',
  transition: 'all var(--transition-fast)', letterSpacing: '0.03em',
};

const navBtnStyle = {
  background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
  cursor: 'pointer', color: 'var(--text-primary)', fontSize: '22px',
  width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  borderRadius: 'var(--radius-sm)', transition: 'all var(--transition-fast)',
};

const calGridStyle = {
  display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px',
};

export default ActivityList;