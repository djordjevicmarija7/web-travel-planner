import { useState } from 'react';
import activityService from '../../services/activityService';
import ActivityForm from './ActivityForm';
import { Badge, EmptyState, Modal } from '../ui';
import { ActivityStatus } from '../../enums/activity/ActivityStatus';
import ConfirmDialog from '../common/ConfirmDialog';

const STATUS_LABELS = { planned: 'Planned', reserved: 'Reserved', completed: 'Completed', cancelled: 'Cancelled' };
const STATUS_COLORS = { planned: 'var(--status-planned)', reserved: 'var(--status-reserved)', completed: 'var(--status-completed)', cancelled: 'var(--status-cancelled)' };
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfMonth(y, m) { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; }
function toYMD(date) {
  if (!date) return null;
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getDestinationsForDate(dateStr, destinations) {
  return (destinations || []).filter(dest => {
    if (!dest.arrivalDate || !dest.departureDate) return false;
    const arrival = toYMD(dest.arrivalDate);
    const departure = toYMD(dest.departureDate);
    return dateStr >= arrival && dateStr <= departure;
  });
}

function ActivityList({ activities, tripId, onDeleted, onUpdated, tripStartDate, tripEndDate, destinations }) {
  const [view, setView] = useState('list');
  const firstDate = activities.length > 0 ? new Date(activities[0].date) : (tripStartDate ? new Date(tripStartDate) : new Date());
  const [calYear, setCalYear] = useState(firstDate.getFullYear());
  const [calMonth, setCalMonth] = useState(firstDate.getMonth());
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

  const tripStart = tripStartDate ? toYMD(tripStartDate) : null;
  const tripEnd   = tripEndDate   ? toYMD(tripEndDate)   : null;

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
    } catch { alert('Error updating activity.'); }
    finally { setEditLoading(false); }
  }

  function prevMonth() {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); } else setCalMonth(m => m - 1);
    setSelectedDay(null);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); } else setCalMonth(m => m + 1);
    setSelectedDay(null);
  }

  const selectedKey = selectedDay
    ? `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}`
    : null;
  const selectedActivities = selectedKey ? (grouped[selectedKey] || []) : [];
  const selectedDestinations = selectedKey ? getDestinationsForDate(selectedKey, destinations) : [];

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
            fontWeight: view === v ? '500' : '400', fontSize: '11px',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            cursor: 'pointer', transition: 'all var(--transition-fast)',
          }}>
            {v === 'list' ? '≡ List' : '◫ Calendar'}
          </button>
        ))}
      </div>

      {/* LIST VIEW */}
      {view === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {sortedDates.map((date) => {
            const destsOnDay = getDestinationsForDate(date, destinations);
            return (
              <div key={date}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <div style={{ width: '3px', height: '18px', background: 'var(--accent-primary)', borderRadius: '2px' }} />
                  <span style={{ fontSize: '11px', fontWeight: '500', letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    {new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  {destsOnDay.map(dest => (
                    <span key={dest.id} style={{ fontSize: '10px', color: 'var(--accent-primary)', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', borderRadius: '10px', padding: '2px 9px', letterSpacing: '0.04em' }}>
                      📍 {dest.name}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {grouped[date].map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} onDelete={() => handleDelete(activity.id)} onEdit={() => setEditTarget(activity)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CALENDAR VIEW */}
      {view === 'calendar' && (
        <div>
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <button onClick={prevMonth} style={navBtnStyle}>‹</button>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '300', letterSpacing: '0.04em' }}>
              {MONTH_NAMES[calMonth]} {calYear}
            </span>
            <button onClick={nextMonth} style={navBtnStyle}>›</button>
          </div>

          {/* Day headers */}
          <div style={calGridStyle}>
            {DAY_NAMES.map((d) => (
              <div key={d} style={{ textAlign: 'center', fontSize: '10px', fontWeight: '500', letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '8px 0' }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div style={calGridStyle}>
            {Array.from({ length: getFirstDayOfMonth(calYear, calMonth) }).map((_, i) => (
              <div key={`e-${i}`} style={{ minHeight: '82px' }} />
            ))}
            {Array.from({ length: getDaysInMonth(calYear, calMonth) }).map((_, i) => {
              const day = i + 1;
              const key = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
              const dayActs = grouped[key] || [];
              const isSelected = selectedDay === day;
              const today = new Date();
              const isToday = today.getFullYear() === calYear && today.getMonth() === calMonth && today.getDate() === day;

              const inTrip = tripStart && tripEnd ? (key >= tripStart && key <= tripEnd) : false;
              const isTripStart = key === tripStart;
              const isTripEnd   = key === tripEnd;

              const destsOnDay = getDestinationsForDate(key, destinations);
              const hasDestination = destsOnDay.length > 0;

              let cellBg = 'var(--bg-surface)';
              let cellBorder = 'var(--border-subtle)';
              if (inTrip) { cellBg = 'rgba(201,168,76,0.06)'; cellBorder = 'rgba(201,168,76,0.15)'; }
              if (hasDestination) { cellBg = 'rgba(201,168,76,0.13)'; cellBorder = 'var(--accent-border)'; }
              if (isSelected) { cellBg = 'rgba(201,168,76,0.22)'; cellBorder = 'var(--accent-primary)'; }
              if (isToday) { cellBorder = 'rgba(91,156,246,0.5)'; }

              return (
                <div key={day} onClick={() => setSelectedDay(isSelected ? null : day)} style={{
                  border: `1px solid ${cellBorder}`,
                  borderRadius: 'var(--radius-md)', padding: '7px 7px 5px', minHeight: '82px',
                  cursor: 'pointer', background: cellBg,
                  transition: 'all var(--transition-fast)',
                  position: 'relative',
                  opacity: !inTrip && tripStart && tripEnd ? 0.55 : 1,
                }}>
                  {/* Trip start/end labels */}
                  {(isTripStart || isTripEnd) && (
                    <div style={{ position: 'absolute', top: '-1px', right: '-1px', fontSize: '8px', background: 'var(--accent-primary)', color: '#0c0c12', borderRadius: '0 var(--radius-md) 0 var(--radius-sm)', padding: '1px 5px', fontWeight: '600', letterSpacing: '0.04em', zIndex: 1 }}>
                      {isTripStart ? 'START' : 'END'}
                    </div>
                  )}

                  <div style={{ fontSize: '12px', fontWeight: isToday ? '600' : '400', color: isToday ? 'var(--status-planned)' : inTrip ? 'var(--text-primary)' : 'var(--text-muted)', marginBottom: '4px' }}>{day}</div>

                  {/* Destination chip */}
                  {hasDestination && destsOnDay.slice(0, 1).map(dest => (
                    <div key={dest.id} style={{ fontSize: '9px', color: 'var(--accent-primary)', background: 'rgba(201,168,76,0.2)', borderRadius: '3px', padding: '1px 4px', marginBottom: '2px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontWeight: '500' }}>
                      📍 {dest.name}
                    </div>
                  ))}
                  {hasDestination && destsOnDay.length > 1 && (
                    <div style={{ fontSize: '9px', color: 'var(--accent-dim)' }}>+{destsOnDay.length - 1} dest.</div>
                  )}

                  {/* Activity chips */}
                  {dayActs.slice(0, hasDestination ? 1 : 2).map((act) => (
                    <div key={act.id} title={act.name} style={{ fontSize: '10px', color: '#fff', background: STATUS_COLORS[act.status] || 'var(--text-muted)', borderRadius: '3px', padding: '1px 5px', marginBottom: '2px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', opacity: 0.9 }}>
                      {act.time ? `${act.time.slice(0,5)} ` : ''}{act.name}
                    </div>
                  ))}
                  {dayActs.length > (hasDestination ? 1 : 2) && (
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>+{dayActs.length - (hasDestination ? 1 : 2)}</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected day detail */}
          {selectedDay && (
            <div style={{ marginTop: '20px', background: 'var(--bg-elevated)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-lg)', padding: '18px', animation: 'fadeIn 0.2s ease' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '300', marginBottom: '10px', color: 'var(--accent-primary)' }}>
                {selectedDay} {MONTH_NAMES[calMonth]} {calYear}
              </div>

              {/* Destinations on this day */}
              {selectedDestinations.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {selectedDestinations.map(dest => (
                    <div key={dest.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', padding: '5px 11px', fontSize: '12px', color: 'var(--accent-primary)' }}>
                      <span>📍</span>
                      <span style={{ fontWeight: '500' }}>{dest.name}</span>
                      {dest.location && <span style={{ color: 'var(--accent-dim)', fontSize: '11px' }}>— {dest.location}</span>}
                    </div>
                  ))}
                </div>
              )}

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

          {/* Status legend */}
          <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <LegendItem color="rgba(201,168,76,0.15)" border="var(--accent-border)" label="Trip duration" />
            <LegendItem color="rgba(201,168,76,0.28)" border="var(--accent-primary)" label="Active destination" />
            <LegendItem color="rgba(91,156,246,0.08)" border="rgba(91,156,246,0.3)" label="Today" />
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
            initialData={{ name: editTarget.name || '', date: editTarget.date?.slice(0,10) || '', time: editTarget.time || '', location: editTarget.location || '', description: editTarget.description || '', estimatedCost: editTarget.estimatedCost?.toString() || '', status: editTarget.status || ActivityStatus.planned }}
            onSubmit={handleUpdate}
            onCancel={() => setEditTarget(null)}
            loading={editLoading}
            tripStartDate={tripStartDate}
            tripEndDate={tripEndDate}
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

function LegendItem({ color, border, label, dot }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
      {dot
        ? <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: border }} />
        : <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: color, border: `1px solid ${border}` }} />
      }
      {label}
    </div>
  );
}

function ActivityCard({ activity, onDelete, onEdit }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ background: 'var(--bg-surface)', border: `1px solid ${hovered ? 'var(--border-default)' : 'var(--border-subtle)'}`, borderLeft: `3px solid ${STATUS_COLORS[activity.status] || 'var(--text-muted)'}`, padding: '12px 16px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', transition: 'all var(--transition-fast)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: '500', fontSize: '14px' }}>{activity.name}</span>
          {activity.time && <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{activity.time.slice(0,5)}</span>}
          <Badge variant={activity.status}>{STATUS_LABELS[activity.status]}</Badge>
        </div>
        {activity.location && <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>📍 {activity.location}</div>}
        {activity.description && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{activity.description}</div>}
        {activity.estimatedCost != null && <div style={{ fontSize: '12px', color: 'var(--accent-primary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>€ {activity.estimatedCost}</div>}
      </div>
      <div style={{ display: 'flex', gap: '6px', marginLeft: '12px', flexShrink: 0 }}>
        <button onClick={onEdit} style={actionBtnStyle}>Edit</button>
        <button onClick={onDelete} style={{ ...actionBtnStyle, color: 'var(--status-cancelled)', borderColor: 'rgba(240,112,112,0.2)' }}>✕</button>
      </div>
    </div>
  );
}

const actionBtnStyle = { background: 'none', border: '1px solid var(--border-subtle)', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '11px', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-body)', transition: 'all var(--transition-fast)', letterSpacing: '0.03em' };
const navBtnStyle = { background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '22px', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)', transition: 'all var(--transition-fast)' };
const calGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' };

export default ActivityList;
