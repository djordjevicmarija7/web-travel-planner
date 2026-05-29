import { useState } from 'react';
import expenseService from '../../services/expenseService';
import ConfirmDialog from '../common/ConfirmDialog';
import { Button, Input, Textarea, Select, FormRow, Modal, EmptyState, ProgressBar } from '../ui';

const CATEGORIES = [
  { value: 'transport',      label: 'Transport',      icon: '✈' },
  { value: 'accommodation',  label: 'Accommodation',  icon: '🏨' },
  { value: 'food',           label: 'Food & Drink',   icon: '🍽' },
  { value: 'tickets',        label: 'Tickets',        icon: '🎟' },
  { value: 'shopping',       label: 'Shopping',       icon: '🛍' },
  { value: 'other',          label: 'Other',          icon: '📌' },
];

const emptyForm = { name: '', category: 'other', amount: '', date: '', description: '' };

function ExpenseSection({ expenses, tripId, budget, onAdded, onDeleted }) {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors]     = useState({});
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null });

  const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const remaining  = budget != null ? budget - totalSpent : null;
  const catMap     = Object.fromEntries(CATEGORIES.map(c => [c.value, c]));

  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + (e.amount || 0);
    return acc;
  }, {});

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
      onAdded(created);
      setFormData(emptyForm);
      setShowModal(false);
    } catch { alert('Error adding expense.'); } finally { setLoading(false); }
  }

  function handleDelete(id) {
    setConfirmDialog({ isOpen: true, id });
  }

  async function handleDeleteConfirmed() {
    const id = confirmDialog.id;
    setConfirmDialog({ isOpen: false, id: null });
    try { await expenseService.remove(tripId, id); onDeleted(id); }
    catch { alert('Error deleting expense.'); }
  }

  return (
    <div>
      {/* Budget Summary */}
      <div style={{
        background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', padding: '22px', marginBottom: '24px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: budget != null ? 'repeat(3, 1fr)' : '1fr 1fr',
          gap: '20px', marginBottom: budget != null ? '18px' : '0',
        }}>
          {budget != null && (
            <div>
              <div style={statLabelStyle}>Budget</div>
              <div style={statValueStyle}>€ {budget.toLocaleString()}</div>
            </div>
          )}
          <div>
            <div style={statLabelStyle}>Spent</div>
            <div style={{ ...statValueStyle, color: 'var(--status-cancelled)' }}>
              € {totalSpent.toFixed(2)}
            </div>
          </div>
          {remaining != null && (
            <div>
              <div style={statLabelStyle}>Remaining</div>
              <div style={{ ...statValueStyle, color: remaining < 0 ? 'var(--status-cancelled)' : 'var(--status-completed)' }}>
                {remaining < 0 ? '−' : ''}€ {Math.abs(remaining).toFixed(2)}
              </div>
            </div>
          )}
        </div>
        {budget != null && <ProgressBar value={totalSpent} max={budget} />}

        {expenses.length > 0 && (
          <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Breakdown by Category
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {Object.entries(byCategory).map(([cat, total]) => {
                const c = catMap[cat];
                return (
                  <div key={cat} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)', padding: '5px 10px', fontSize: '12px',
                  }}>
                    <span>{c?.icon || '📌'}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{c?.label || cat}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>€{total.toFixed(0)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '18px' }}>
        <Button variant="accent" onClick={() => setShowModal(true)}>
          + Add Expense
        </Button>
      </div>

      {expenses.length === 0 ? (
        <EmptyState
          icon="💳"
          title="No expenses recorded"
          description="Track your spending by adding expenses."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).map((expense) => {
            const cat = catMap[expense.category];
            return (
              <div key={expense.id} style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)', padding: '13px 16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
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
                      {cat?.label || expense.category} · {expense.date?.slice(0, 10)}
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
                    onClick={() => handleDelete(expense.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '14px', padding: '4px', transition: 'color var(--transition-fast)' }}
                    onMouseEnter={e => e.target.style.color = 'var(--status-cancelled)'}
                    onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Expense Modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); setFormData(emptyForm); setErrors({}); }} title="New Expense">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Name *" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Plane tickets" error={errors.name} />
          <FormRow>
            <Select label="Category" name="category" value={formData.category} onChange={handleChange}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value} style={{ background: 'var(--bg-elevated)' }}>
                  {c.icon} {c.label}
                </option>
              ))}
            </Select>
            <Input label="Amount (€) *" name="amount" type="number" min="0.01" step="0.01" value={formData.amount} onChange={handleChange} placeholder="e.g. 250" error={errors.amount} />
          </FormRow>
          <Input label="Date *" name="date" type="date" value={formData.date} onChange={handleChange} error={errors.date} />
          <Textarea label="Description" name="description" value={formData.description} onChange={handleChange} placeholder="Extra notes..." style={{ height: '64px' }} />
          <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
            <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Saving...' : 'Save Expense'}</Button>
            <Button type="button" variant="ghost" onClick={() => { setShowModal(false); setFormData(emptyForm); setErrors({}); }}>Cancel</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDialog({ isOpen: false, id: null })}
      />
    </div>
  );
}

const statLabelStyle = { fontSize: '10px', letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' };
const statValueStyle = { fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '300' };

export default ExpenseSection;