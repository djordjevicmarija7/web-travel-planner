import { useState } from 'react';
import expenseService from '../services/expenseService';
import { Button, Input, Textarea, Select, Badge, EmptyState } from './ui';

const CATEGORIES = [
  { value: 'transport', label: 'Transport', icon: '✈' },
  { value: 'accommodation', label: 'Accommodation', icon: '🏨' },
  { value: 'food', label: 'Food', icon: '🍽' },
  { value: 'tickets', label: 'Tickets', icon: '🎟' },
  { value: 'shopping', label: 'Shopping', icon: '🛍' },
  { value: 'other', label: 'Other', icon: '📌' },
];

const emptyForm = { name: '', category: 'other', amount: '', date: '', description: '' };

function ExpenseSection({ expenses, tripId, budget, onAdded, onDeleted }) {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const remaining = budget != null ? budget - totalSpent : null;
  const spentPct = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const e = {};
    if (!formData.name.trim()) e.name = 'Expense name is required.';
    if (!formData.amount || Number(formData.amount) <= 0) e.amount = 'Amount must be greater than 0.';
    if (!formData.date) e.date = 'Date is required.';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length > 0) { setErrors(ve); return; }
    setErrors({}); setLoading(true);
    try {
      const created = await expenseService.create(tripId, { ...formData, amount: Number(formData.amount) });
      onAdded(created); setFormData(emptyForm); setShowForm(false);
    } catch { alert('Error adding expense.'); } finally { setLoading(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete expense?')) return;
    try { await expenseService.remove(tripId, id); onDeleted(id); }
    catch { alert('Error deleting expense.'); }
  }

  const catMap = Object.fromEntries(CATEGORIES.map(c => [c.value, c]));

  return (
    <div>
      {/* Budget summary */}
      <div style={{
        background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: '20px',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: budget != null ? '16px' : '0' }}>
          {budget != null && (
            <div>
              <div style={{ fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Budget</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px' }}>€ {budget.toLocaleString()}</div>
            </div>
          )}
          <div>
            <div style={{ fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Spent</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--status-cancelled)' }}>€ {totalSpent.toFixed(2)}</div>
          </div>
          {remaining != null && (
            <div>
              <div style={{ fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Remaining</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: remaining < 0 ? 'var(--status-cancelled)' : 'var(--status-completed)' }}>
                € {remaining.toFixed(2)}
              </div>
            </div>
          )}
        </div>
        {budget != null && (
          <div style={{ height: '4px', background: 'var(--bg-overlay)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${spentPct}%`, background: spentPct > 90 ? 'var(--status-cancelled)' : spentPct > 70 ? 'var(--status-reserved)' : 'var(--accent-primary)', borderRadius: '2px', transition: 'width 0.4s ease' }} />
          </div>
        )}
      </div>

      <Button variant="accent" onClick={() => setShowForm(!showForm)} style={{ marginBottom: '16px' }}>
        {showForm ? '✕ Close' : '+ Add Expense'}
      </Button>

      {showForm && (
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: '20px', animation: 'fadeIn 0.25s ease' }}>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--accent-primary)', marginBottom: '16px' }}>New Expense</h4>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Input label="Name *" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Plane tickets" error={errors.name} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Select label="Category" name="category" value={formData.category} onChange={handleChange}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value} style={{ background: 'var(--bg-elevated)' }}>{c.icon} {c.label}</option>)}
              </Select>
              <Input label="Amount (€) *" name="amount" type="number" min="0.01" step="0.01" value={formData.amount} onChange={handleChange} placeholder="e.g. 250" error={errors.amount} />
            </div>
            <Input label="Date *" name="date" type="date" value={formData.date} onChange={handleChange} error={errors.date} />
            <Textarea label="Description" name="description" value={formData.description} onChange={handleChange} placeholder="Extra notes..." style={{ height: '64px' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Saving...' : 'Save Expense'}</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {expenses.length === 0 ? (
        <EmptyState icon="💳" title="No expenses recorded" description="Track your spending by adding expenses." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {expenses.map((expense) => {
            const cat = catMap[expense.category];
            return (
              <div key={expense.id} style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)', padding: '12px 16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                    {cat?.icon || '📌'}
                  </div>
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '14px' }}>{expense.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {cat?.label || expense.category} · {expense.date?.slice(0, 10)}
                    </div>
                    {expense.description && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{expense.description}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '500', color: 'var(--text-primary)' }}>€ {expense.amount}</span>
                  <button onClick={() => handleDelete(expense.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '14px', padding: '4px' }}
                    onMouseEnter={e => e.target.style.color='var(--status-cancelled)'}
                    onMouseLeave={e => e.target.style.color='var(--text-muted)'}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ExpenseSection;