import { useState } from 'react';
import expenseService from '../services/expenseService';

const CATEGORIES = [
  { value: 'transport', label: 'Transport' },
  { value: 'accommodation', label: 'Accomodation' },
  { value: 'food', label: 'Food' },
  { value: 'tickets', label: 'Tickets' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'other', label: 'Other' },
];

const emptyForm = {
  name: '',
  category: 'other',
  amount: '',
  date: '',
  description: '',
};

function ExpenseSection({ expenses, tripId, budget, onAdded, onDeleted }) {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const remaining = budget != null ? budget - totalSpent : null;

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const newErrors = {};
    if (!formData.name.trim())
      newErrors.name = 'Expense name is required.';
    if (!formData.amount || Number(formData.amount) <= 0)
      newErrors.amount = 'Amount must be greater then 0.';
    if (!formData.date)
      newErrors.date = 'Date is required.';
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const created = await expenseService.create(tripId, {
        ...formData,
        amount: Number(formData.amount),
      });
      onAdded(created);
      setFormData(emptyForm);
      setShowForm(false);
    } catch {
      alert('Error while adding expense.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete expense?')) return;
    try {
      await expenseService.remove(tripId, id);
      onDeleted(id);
    } catch {
      alert('Error while deleting expense.');
    }
  }

  return (
    <div>
      <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px', marginBottom: '12px' }}>
        {budget != null && <p>Planned budget: <strong>{budget} €</strong></p>}
        <p>Total amount spent: <strong>{totalSpent.toFixed(2)} €</strong></p>
        {remaining != null && (
          <p style={{ color: remaining < 0 ? 'red' : 'green' }}>
            Remaining: <strong>{remaining.toFixed(2)} €</strong>
          </p>
        )}
      </div>

      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Close' : '+ Add expense '}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginTop: '10px' }}>
          <div>
            <label>Name *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="eg. Plane tickets"
            />
            {errors.name && <p style={{ color: 'red' }}>{errors.name}</p>}
          </div>

          <div>
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleChange}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Amount (€) *</label>
            <input
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              placeholder="npr. 250"
            />
            {errors.amount && <p style={{ color: 'red' }}>{errors.amount}</p>}
          </div>

          <div>
            <label>Date *</label>
            <input
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
            />
            {errors.date && <p style={{ color: 'red' }}>{errors.date}</p>}
          </div>

          <div>
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Extra notes..."
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save expense'}
          </button>
          <button type="button" onClick={() => setShowForm(false)}>
            Odustani
          </button>
        </form>
      )}

      {expenses.length === 0 ? (
        <p style={{ marginTop: '10px' }}>No expenses recorded.</p>
      ) : (
        <div style={{ marginTop: '10px' }}>
          {expenses.map((expense) => (
            <div
              key={expense.id}
              style={{ border: '1px solid #ddd', padding: '8px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <strong>{expense.name}</strong>
                <span style={{ marginLeft: '8px', color: '#666', fontSize: '13px' }}>
                  {CATEGORIES.find(c => c.value === expense.category)?.label || expense.category}
                </span>
                <p style={{ margin: '2px 0' }}>{expense.date?.slice(0, 10)}</p>
                {expense.description && <p style={{ margin: 0, color: '#666' }}>{expense.description}</p>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <strong>{expense.amount} €</strong>
                <button onClick={() => handleDelete(expense.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExpenseSection;