import { useState } from 'react';
import checklistService from '../services/checklistService';
import { Button, Input, EmptyState } from './ui';

function ChecklistSection({ items, tripId, onAdded, onToggled, onDeleted }) {
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    if (!newTitle.trim()) { setError('Item name is required.'); return; }
    setError('');
    setLoading(true);
    try {
      const created = await checklistService.create(tripId, newTitle.trim());
      onAdded(created);
      setNewTitle('');
    } catch { setError('Error adding item.'); } finally { setLoading(false); }
  }

  async function handleToggle(item) {
    try {
      const updated = await checklistService.toggle(tripId, item.id, !item.isCompleted);
      onToggled(updated);
    } catch { alert('Error updating item.'); }
  }

  async function handleDelete(id) {
    try { await checklistService.remove(tripId, id); onDeleted(id); }
    catch { alert('Error deleting item.'); }
  }

  const completed = items.filter((i) => i.isCompleted).length;
  const progress = items.length > 0 ? (completed / items.length) * 100 : 0;

  return (
    <div>
      {/* Progress bar */}
      {items.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Packing progress</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent-primary)' }}>{completed} / {items.length}</span>
          </div>
          <div style={{ height: '4px', background: 'var(--bg-overlay)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: progress === 100 ? 'var(--status-completed)' : 'var(--accent-primary)', borderRadius: '2px', transition: 'width 0.4s ease' }} />
          </div>
        </div>
      )}

      {/* Add form */}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <Input
            value={newTitle}
            onChange={(e) => { setNewTitle(e.target.value); setError(''); }}
            placeholder="e.g. Passport, tickets, insurance..."
            error={error}
          />
        </div>
        <Button type="submit" variant="accent" disabled={loading} style={{ alignSelf: 'flex-start', marginTop: '0' }}>
          + Add
        </Button>
      </form>

      {items.length === 0 ? (
        <EmptyState icon="✓" title="Checklist empty" description="Add items to pack before your trip." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {items.map((item) => (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 14px',
              background: item.isCompleted ? 'rgba(52,211,153,0.04)' : 'var(--bg-surface)',
              border: `1px solid ${item.isCompleted ? 'rgba(52,211,153,0.15)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-md)',
              transition: 'all var(--transition-fast)',
            }}>
              <div
                onClick={() => handleToggle(item)}
                style={{
                  width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
                  border: `2px solid ${item.isCompleted ? 'var(--status-completed)' : 'var(--border-strong)'}`,
                  background: item.isCompleted ? 'var(--status-completed)' : 'transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {item.isCompleted && <span style={{ color: '#0a0a0f', fontSize: '11px', fontWeight: '700' }}>✓</span>}
              </div>
              <span style={{
                flex: 1, fontSize: '14px',
                textDecoration: item.isCompleted ? 'line-through' : 'none',
                color: item.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                transition: 'all var(--transition-fast)',
              }}>
                {item.title}
              </span>
              <button onClick={() => handleDelete(item.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: '14px', padding: '2px 4px',
                transition: 'color var(--transition-fast)',
              }} onMouseEnter={e => e.target.style.color='var(--status-cancelled)'}
                 onMouseLeave={e => e.target.style.color='var(--text-muted)'}>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ChecklistSection;