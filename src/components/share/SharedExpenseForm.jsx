import { useState } from 'react';
import { Button, Input, Textarea, Select, FormRow } from '../ui';

const CATEGORIES = [
  { value: 'transport',     label: 'Transport',     icon: '✈' },
  { value: 'accommodation', label: 'Accommodation', icon: '🏨' },
  { value: 'food',          label: 'Food & Drink',  icon: '🍽' },
  { value: 'tickets',       label: 'Tickets',       icon: '🎟' },
  { value: 'shopping',      label: 'Shopping',      icon: '🛍' },
  { value: 'other',         label: 'Other',         icon: '📌' },
];

function SharedExpenseForm({ onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({ name: '', category: 'other', amount: '', date: '', description: '' });
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.amount || Number(form.amount) <= 0) e.amount = 'Amount must be greater than 0.';
    if (!form.date) e.date = 'Date is required.';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length > 0) { setErrors(ve); return; }
    setErrors({});
    onSubmit({ ...form, amount: Number(form.amount) });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <Input label="Name *" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Plane tickets" error={errors.name} />
      <FormRow>
        <Select label="Category" name="category" value={form.category} onChange={handleChange}>
          {CATEGORIES.map(c => (
            <option key={c.value} value={c.value} style={{ background: 'var(--bg-elevated)' }}>
              {c.icon} {c.label}
            </option>
          ))}
        </Select>
        <Input label="Amount (€) *" name="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={handleChange} placeholder="e.g. 250" error={errors.amount} />
      </FormRow>
      <Input label="Date *" name="date" type="date" value={form.date} onChange={handleChange} error={errors.date} />
      <Textarea label="Description" name="description" value={form.description} onChange={handleChange} placeholder="Extra notes..." style={{ height: '60px' }} />
      <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
        <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Saving...' : 'Save Expense'}</Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>Cancel</Button>
      </div>
    </form>
  );
}

export default SharedExpenseForm;