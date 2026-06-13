import { useState } from 'react';
import expenseService from '../../services/expenseService';
import { Button, Modal, EmptyState, ProgressBar } from '../ui';
import { ExpenseCategory } from '../../enums/expense/ExpenseCategory';
import ExpenseForm from './ExpenseForm';
import ExpenseCard from './ExpenseCard';
import ConfirmDialog from '../common/ConfirmDialog';

const CATEGORIES = [
  { value: ExpenseCategory.transport,     label: 'Transport',     icon: '✈' },
  { value: ExpenseCategory.accommodation, label: 'Accommodation', icon: '🏨' },
  { value: ExpenseCategory.food,          label: 'Food & Drink',  icon: '🍽' },
  { value: ExpenseCategory.tickets,       label: 'Tickets',       icon: '🎟' },
  { value: ExpenseCategory.shopping,      label: 'Shopping',      icon: '🛍' },
  { value: ExpenseCategory.other,         label: 'Other',         icon: '📌' },
];

const statLabelStyle = { fontSize: '10px', letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' };
const statValueStyle = { fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '300' };

function ExpenseSection({ expenses, tripId, budget, onAdded, onDeleted }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null });

  const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const remaining  = budget != null ? budget - totalSpent : null;
  const catMap     = Object.fromEntries(CATEGORIES.map(c => [c.value, c]));

  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + (e.amount || 0);
    return acc;
  }, {});

  async function handleSubmit(formData) {
    setLoading(true);
    try {
      const created = await expenseService.create(tripId, formData);
      onAdded(created);
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

        {/* Category breakdown */}
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

      {/* Add button */}
      <div style={{ marginBottom: '18px' }}>
        <Button variant="accent" onClick={() => setShowModal(true)}>
          + Add Expense
        </Button>
      </div>

      {/* Expense list */}
      {expenses.length === 0 ? (
        <EmptyState
          icon="💳"
          title="No expenses recorded"
          description="Track your spending by adding expenses."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Add Expense Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="New Expense"
      >
        <ExpenseForm
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
          loading={loading}
        />
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

export default ExpenseSection;