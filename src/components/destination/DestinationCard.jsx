import { useState } from 'react';
import { formatDate } from '../../utils/formatDate';

const actionBtn = {
  background: 'none',
  border: '1px solid var(--border-subtle)',
  cursor: 'pointer',
  color: 'var(--text-secondary)',
  fontSize: '11px',
  padding: '5px 11px',
  borderRadius: 'var(--radius-sm)',
  fontFamily: 'var(--font-body)',
  letterSpacing: '0.03em',
  transition: 'all var(--transition-fast)',
};

function getNights(arrival, departure) {
  if (!arrival || !departure) return 0;
  return Math.ceil((new Date(departure) - new Date(arrival)) / (1000 * 60 * 60 * 24));
}

function DestinationCard({ dest, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const nights = getNights(dest.arrivalDate, dest.departureDate);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${hovered ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
        borderLeft: '3px solid var(--accent-primary)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 18px',
        transition: 'all var(--transition-base)',
        boxShadow: hovered ? 'var(--shadow-accent)' : 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '400' }}>
              {dest.name}
            </span>
            {nights > 0 && (
              <span
                style={{
                  fontSize: '10px',
                  color: 'var(--accent-primary)',
                  background: 'var(--accent-subtle)',
                  border: '1px solid var(--accent-border)',
                  borderRadius: '10px',
                  padding: '2px 8px',
                  letterSpacing: '0.06em',
                }}
              >
                {nights} night{nights !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {dest.location && (
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              📍 {dest.location}
            </div>
          )}

          <div
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              marginBottom: dest.description || dest.notes ? '8px' : '0',
            }}
          >
            {formatDate(dest.arrivalDate)} → {formatDate(dest.departureDate)}
          </div>

          {dest.description && (
            <p
              style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                lineHeight: 1.55,
                marginBottom: dest.notes ? '4px' : '0',
              }}
            >
              {dest.description}
            </p>
          )}

          {dest.notes && (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, fontStyle: 'italic' }}>
              💬 {dest.notes}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          <button onClick={onEdit} style={actionBtn}>
            Edit
          </button>
          <button
            onClick={onDelete}
            style={{ ...actionBtn, color: 'var(--status-cancelled)', borderColor: 'rgba(240,112,112,0.2)' }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

export default DestinationCard;