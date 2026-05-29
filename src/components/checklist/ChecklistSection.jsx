import { useState } from 'react';
import checklistService from '../../services/checklistService';
import { Button, Input, EmptyState, ProgressBar } from '../ui';

function ChecklistSection({ items, tripId, onAdded, onToggled, onDeleted }) {
  const [newTitle, setNewTitle] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

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
  const total = items.length;

  return (
    <div>
      {/* Progress */}
      {total > 0 && (
        <div style={{
          background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)', padding: '18px 20px', marginBottom: '22px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Packing Progress
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: completed === total ? 'var(--status-completed)' : 'var(--accent-primary)' }}>
              {completed} / {total}
            </span>
          </div>
          <ProgressBar value={completed} max={total} color={completed === total ? 'var(--status-completed)' : undefined} />
          {completed === total && total > 0 && (
            <div style={{ fontSize: '12px', color: 'var(--status-completed)', marginTop: '8px', textAlign: 'center' }}>
              ✓ All packed — you're ready to go!
            </div>
          )}
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
        <Button type="submit" variant="accent" disabled={loading} style={{ alignSelf: 'flex-start' }}>
          + Add
        </Button>
      </form>

      {/* List */}
      {total === 0 ? (
        <EmptyState
          icon="✓"
          title="Checklist is empty"
          description="Add items you need to pack or tasks to complete before your trip."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {/* Pending first, then completed */}
          {[...items.filter(i => !i.isCompleted), ...items.filter(i => i.isCompleted)].map((item) => (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '11px 15px',
              background: item.isCompleted ? 'rgba(78,201,148,0.04)' : 'var(--bg-surface)',
              border: `1px solid ${item.isCompleted ? 'rgba(78,201,148,0.14)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-md)',
              transition: 'all var(--transition-fast)',
            }}>
              {/* Checkbox */}
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
                {item.isCompleted && (
                  <span style={{ color: '#0c0c12', fontSize: '11px', fontWeight: '700', lineHeight: 1 }}>✓</span>
                )}
              </div>

              <span style={{
                flex: 1, fontSize: '14px',
                textDecoration: item.isCompleted ? 'line-through' : 'none',
                color: item.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                transition: 'all var(--transition-fast)',
              }}>
                {item.title}
              </span>

              <button
                onClick={() => handleDelete(item.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-faint)', fontSize: '14px', padding: '2px 4px',
                  transition: 'color var(--transition-fast)',
                }}
                onMouseEnter={e => e.target.style.color = 'var(--status-cancelled)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-faint)'}
              >
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
