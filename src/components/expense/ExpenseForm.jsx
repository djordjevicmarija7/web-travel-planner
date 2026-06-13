import { useState } from 'react';
import { Button, Input, Textarea, Select, FormRow } from '../ui';
import { ExpenseCategory } from '../../enums/expense/ExpenseCategory';

const CATEGORIES = [
  { value: ExpenseCategory.transport,     label: 'Transport',     icon: '✈' },
  { value: ExpenseCategory.accommodation, label: 'Accommodation', icon: '🏨' },
  { value: ExpenseCategory.food,          label: 'Food & Drink',  icon: '🍽' },
  { value: ExpenseCategory.tickets,       label: 'Tickets',       icon: '🎟' },
  { value: ExpenseCategory.shopping,      label: 'Shopping',      icon: '🛍' },
  { value: ExpenseCategory.other,         label: 'Other',         icon: '📌' },
];

const emptyForm = { name: '', category: ExpenseCategory.other, amount: '', date: '', description: '' };

function ExpenseForm({ onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

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

  function handleSubmit(e) {
    e.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length > 0) { setErrors(ve); return; }
    setErrors({});
    onSubmit({ ...formData, amount: Number(formData.amount) });
  }

  return (
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
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>Cancel</Button>
      </div>
    </form>
  );
}

export default ExpenseForm;