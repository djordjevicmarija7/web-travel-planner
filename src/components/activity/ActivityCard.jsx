import { useState } from 'react';
import { Badge } from '../ui';

const STATUS_LABELS = { planned: 'Planned', reserved: 'Reserved', completed: 'Completed', cancelled: 'Cancelled' };
const STATUS_COLORS = {
  planned: 'var(--status-planned)',
  reserved: 'var(--status-reserved)',
  completed: 'var(--status-completed)',
  cancelled: 'var(--status-cancelled)',
};

const actionBtnStyle = {
  background: 'none',
  border: '1px solid var(--border-subtle)',
  cursor: 'pointer',
  color: 'var(--text-secondary)',
  fontSize: '11px',
  padding: '4px 10px',
  borderRadius: 'var(--radius-sm)',
  fontFamily: 'var(--font-body)',
  transition: 'all var(--transition-fast)',
  letterSpacing: '0.03em',
};

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
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
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
        <button
          onClick={onDelete}
          style={{ ...actionBtnStyle, color: 'var(--status-cancelled)', borderColor: 'rgba(240,112,112,0.2)' }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default ActivityCard;