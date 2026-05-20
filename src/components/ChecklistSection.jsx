import { useState } from 'react';
import checklistService from '../services/checklistService';

function ChecklistSection({ items, tripId, onAdded, onToggled, onDeleted }) {
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    if (!newTitle.trim()) {
      setError('Name is required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const created = await checklistService.create(tripId, newTitle.trim());
      onAdded(created);
      setNewTitle('');
    } catch {
      setError('Error while adding item.');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(item) {
    try {
      const updated = await checklistService.toggle(
        tripId, item.id, !item.isCompleted
      );
      onToggled(updated);
    } catch {
      alert('Error while updating item.');
    }
  }

  async function handleDelete(id) {
    try {
      await checklistService.remove(tripId, id);
      onDeleted(id);
    } catch {
      alert('Error while deleting item.');
    }
  }

  const completed = items.filter((i) => i.isCompleted).length;

  return (
    <div>
      <p>{completed}/{items.length} done</p>

      <form onSubmit={handleAdd}>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="eg for Passport, ticket, insurance..."
        />
        <button type="submit" disabled={loading}>Add</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>

      {items.length === 0 ? (
        <p>List is empty.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {items.map((item) => (
            <li key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <input
                type="checkbox"
                checked={item.isCompleted}
                onChange={() => handleToggle(item)}
              />
              <span style={{
                textDecoration: item.isCompleted ? 'line-through' : 'none',
                color: item.isCompleted ? '#999' : 'inherit',
              }}>
                {item.title}
              </span>
              <button onClick={() => handleDelete(item.id)}>✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ChecklistSection;