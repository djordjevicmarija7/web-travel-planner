import { useState } from 'react';

const STATUS_LABELS = {
  planned: 'Planned', reserved: 'Reserved',
  completed: 'Completed', cancelled: 'Cancelled',
};
const STATUS_COLORS = {
  planned: 'var(--status-planned)', reserved: 'var(--status-reserved)',
  completed: 'var(--status-completed)', cancelled: 'var(--status-cancelled)',
};
const STATUS_BG = {
  planned: 'rgba(91,156,246,0.12)', reserved: 'rgba(240,164,74,0.12)',
  completed: 'rgba(78,201,148,0.12)', cancelled: 'rgba(240,112,112,0.12)',
};

const actionBtn = {
  background: 'none', border: '1px solid var(--border-subtle)', cursor: 'pointer',
  color: 'var(--text-secondary)', fontSize: '10px', padding: '4px 9px',
  borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-body)',
  transition: 'all var(--transition-fast)', letterSpacing: '0.03em',
};

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
        borderRadius: '16px', padding: '12px 14px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        transition: 'all var(--transition-fast)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: '500', fontSize: '13px' }}>{activity.name}</span>
          {activity.time && (
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {activity.time.slice(0, 5)}
            </span>
          )}
          <span style={{
            fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.06em',
            padding: '2px 7px', borderRadius: '10px', fontWeight: '500',
            background: STATUS_BG[activity.status], color: STATUS_COLORS[activity.status],
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
          <button
            onClick={onDelete}
            style={{ ...actionBtn, color: 'var(--status-cancelled)', borderColor: 'rgba(240,112,112,0.2)' }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default SharedActivityCard;