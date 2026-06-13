import { formatDate } from '../../utils/formatDate';

const CATEGORIES = [
  { value: 'transport',     label: 'Transport',     icon: '✈' },
  { value: 'accommodation', label: 'Accommodation', icon: '🏨' },
  { value: 'food',          label: 'Food & Drink',  icon: '🍽' },
  { value: 'tickets',       label: 'Tickets',       icon: '🎟' },
  { value: 'shopping',      label: 'Shopping',      icon: '🛍' },
  { value: 'other',         label: 'Other',         icon: '📌' },
];

const catMap = Object.fromEntries(CATEGORIES.map(c => [c.value, c]));

function ExpenseCard({ expense, onDelete }) {
  const cat = catMap[expense.category];

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '13px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'border-color var(--transition-fast)',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px',
          flexShrink: 0,
        }}>
          {cat?.icon || '📌'}
        </div>
        <div>
          <div style={{ fontWeight: '500', fontSize: '14px' }}>{expense.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {cat?.label || expense.category} · {formatDate(expense.date)}
          </div>
          {expense.description && (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {expense.description}
            </div>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)' }}>
          € {expense.amount.toFixed(2)}
        </span>
        <button
          onClick={() => onDelete(expense.id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '14px', padding: '4px', transition: 'color var(--transition-fast)' }}
          onMouseEnter={e => e.target.style.color = 'var(--status-cancelled)'}
          onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default ExpenseCard;