import { useState } from 'react';
import activityService from '../services/activityService';
import ActivityForm from './ActivityForm';

const STATUS_LABELS = {
  planned: 'Planned',
  reserved: 'Reserved',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_COLORS = {
  planned: '#3B8BD4',
  reserved: '#EF9F27',
  completed: '#1D9E75',
  cancelled: '#E24B4A',
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function ActivityList({ activities, tripId, onDeleted, onUpdated }) {
  const [view, setView] = useState('list');
  const firstDate = activities.length > 0
    ? new Date(activities[0].date)
    : new Date();

  const [calYear, setCalYear] = useState(firstDate.getFullYear());
  const [calMonth, setCalMonth] = useState(firstDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const grouped = activities.reduce((acc, activity) => {
    const date = activity.date?.slice(0, 10);
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  async function handleDelete(id) {
    if (!window.confirm('Delete activity?')) return;
    try {
      await activityService.remove(tripId, id);
      onDeleted(id);
    } catch {
      alert('Error while deleting activity.');
    }
  }

  async function handleUpdate(id, formData) {
    try {
      setEditLoading(true);
      const updated = await activityService.update(tripId, id, formData);
      onUpdated(updated);
      setEditingId(null);
    } catch {
      alert('Error while updating activity.');
    } finally {
      setEditLoading(false);
    }
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
    ? `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : null;
  const selectedActivities = selectedKey ? (grouped[selectedKey] || []) : [];

  if (activities.length === 0) {
    return <p>No activities. Add the first one!</p>;
  }

  return (
    <div>
      {/* Toggle list / calendar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['list', 'calendar'].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              background: view === v ? '#1D9E75' : 'transparent',
              color: view === v ? '#fff' : 'inherit',
              cursor: 'pointer',
              fontWeight: view === v ? '500' : '400',
            }}
          >
            {v === 'list' ? 'List' : 'Calendar'}
          </button>
        ))}
      </div>

      {/* ── LIST VIEW ── */}
      {view === 'list' && (
        <div>
          {sortedDates.map((date) => (
            <div key={date} style={{ marginBottom: '16px' }}>
              <div style={{
                fontWeight: '500',
                fontSize: '14px',
                padding: '4px 10px',
                background: '#f5f5f5',
                borderRadius: '4px',
                marginBottom: '8px',
                borderLeft: '3px solid #1D9E75',
              }}>
                {date}
              </div>
              {grouped[date].map((activity) => (
                <div key={activity.id}>
                  {editingId === activity.id ? (
                    <ActivityForm
                      initialData={{
                        name: activity.name || '',
                        date: activity.date?.slice(0, 10) || '',
                        time: activity.time || '',
                        location: activity.location || '',
                        description: activity.description || '',
                        estimatedCost: activity.estimatedCost?.toString() || '',
                        status: activity.status || 'planned',
                      }}
                      onSubmit={(formData) =>
                        handleUpdate(activity.id, formData)
                      }
                      onCancel={() => setEditingId(null)}
                      loading={editLoading}
                    />
                  ) : (
                    <ActivityCard
                      activity={activity}
                      onDelete={handleDelete}
                      onEdit={() => setEditingId(activity.id)}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── CALENDAR VIEW ── */}
      {view === 'calendar' && (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <button onClick={prevMonth} style={navBtnStyle}>←</button>
            <span style={{ fontWeight: '500', fontSize: '15px' }}>
              {MONTH_NAMES[calMonth]} {calYear}
            </span>
            <button onClick={nextMonth} style={navBtnStyle}>→</button>
          </div>

          <div style={calGridStyle}>
            {DAY_NAMES.map((d) => (
              <div key={d} style={dayHeaderStyle}>{d}</div>
            ))}
          </div>

          <div style={calGridStyle}>
            {Array.from({ length: getFirstDayOfMonth(calYear, calMonth) })
              .map((_, i) => (
                <div key={`empty-${i}`} style={emptyDayStyle} />
              ))}

            {Array.from({ length: getDaysInMonth(calYear, calMonth) })
              .map((_, i) => {
                const day = i + 1;
                const key = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayActivities = grouped[key] || [];
                const isSelected = selectedDay === day;
                const isToday = (() => {
                  const t = new Date();
                  return t.getFullYear() === calYear &&
                    t.getMonth() === calMonth &&
                    t.getDate() === day;
                })();

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    style={{
                      border: isSelected
                        ? '2px solid #1D9E75'
                        : isToday
                          ? '2px solid #3B8BD4'
                          : '1px solid #e0e0e0',
                      borderRadius: '6px',
                      padding: '6px',
                      minHeight: '64px',
                      cursor: dayActivities.length > 0 ? 'pointer' : 'default',
                      background: isSelected ? '#E1F5EE' : '#fff',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{
                      fontWeight: isToday ? '600' : '400',
                      fontSize: '13px',
                      color: isToday ? '#3B8BD4' : '#333',
                      marginBottom: '4px',
                    }}>
                      {day}
                    </div>
                    {dayActivities.slice(0, 3).map((act) => (
                      <div
                        key={act.id}
                        title={act.name}
                        style={{
                          fontSize: '11px',
                          color: '#fff',
                          background: STATUS_COLORS[act.status] || '#888',
                          borderRadius: '3px',
                          padding: '1px 4px',
                          marginBottom: '2px',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {act.time ? `${act.time.slice(0, 5)} ` : ''}{act.name}
                      </div>
                    ))}
                    {dayActivities.length > 3 && (
                      <div style={{ fontSize: '10px', color: '#999' }}>
                        +{dayActivities.length - 3} more
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Selected day details — with edit option */}
          {selectedDay && (
            <div style={{
              marginTop: '16px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '14px',
            }}>
              <div style={{
                fontWeight: '500',
                marginBottom: '10px',
                fontSize: '14px',
                borderLeft: '3px solid #1D9E75',
                paddingLeft: '8px',
              }}>
                {selectedDay}. {MONTH_NAMES[calMonth]} {calYear}
              </div>

              {selectedActivities.length === 0 ? (
                <p style={{ color: '#999', fontSize: '13px' }}>
                  No activities for this day.
                </p>
              ) : (
                selectedActivities.map((activity) => (
                  <div key={activity.id}>
                    {editingId === activity.id ? (
                      <ActivityForm
                        initialData={{
                          name: activity.name || '',
                          date: activity.date?.slice(0, 10) || '',
                          time: activity.time || '',
                          location: activity.location || '',
                          description: activity.description || '',
                          estimatedCost: activity.estimatedCost?.toString() || '',
                          status: activity.status || 'planned',
                        }}
                        onSubmit={(formData) =>
                          handleUpdate(activity.id, formData)
                        }
                        onCancel={() => setEditingId(null)}
                        loading={editLoading}
                      />
                    ) : (
                      <ActivityCard
                        activity={activity}
                        onDelete={handleDelete}
                        onEdit={() => setEditingId(activity.id)}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Legend */}
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            marginTop: '14px',
          }}>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <div key={key} style={{
                display: 'flex', alignItems: 'center',
                gap: '5px', fontSize: '12px',
              }}>
                <div style={{
                  width: '10px', height: '10px', borderRadius: '2px',
                  background: STATUS_COLORS[key],
                }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


function ActivityCard({ activity, onDelete, onEdit }) {
  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderLeft: `3px solid ${STATUS_COLORS[activity.status] || '#ccc'}`,
      padding: '10px 12px',
      marginBottom: '8px',
      borderRadius: '6px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '500', fontSize: '14px' }}>
          {activity.name}
          {activity.time && (
            <span style={{
              fontWeight: '400', color: '#666',
              marginLeft: '8px', fontSize: '13px',
            }}>
              {activity.time.slice(0, 5)}
            </span>
          )}
        </div>
        {activity.location && (
          <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
            {activity.location}
          </div>
        )}
        {activity.description && (
          <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
            {activity.description}
          </div>
        )}
        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
          {activity.estimatedCost != null && (
            <span style={{ fontSize: '12px', color: '#555' }}>
              {activity.estimatedCost} €
            </span>
          )}
          <span style={{
            fontSize: '11px',
            padding: '1px 6px',
            borderRadius: '10px',
            background: STATUS_COLORS[activity.status] + '22',
            color: STATUS_COLORS[activity.status],
            fontWeight: '500',
          }}>
            {STATUS_LABELS[activity.status] || activity.status}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
        <button
          onClick={onEdit}
          title="Edit activity"
          style={{
            background: 'none',
            border: '1px solid #ddd',
            cursor: 'pointer',
            color: '#555',
            fontSize: '12px',
            padding: '3px 8px',
            borderRadius: '4px',
          }}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(activity.id)}
          title="Delete activity"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#ccc',
            fontSize: '16px',
            padding: '0 4px',
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

const navBtnStyle = {
  padding: '4px 12px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '16px',
};

const calGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: '4px',
  marginBottom: '4px',
};

const dayHeaderStyle = {
  textAlign: 'center',
  fontSize: '12px',
  fontWeight: '500',
  color: '#666',
  padding: '4px 0',
};

const emptyDayStyle = {
  border: '1px solid transparent',
  borderRadius: '6px',
  minHeight: '64px',
};

export default ActivityList;