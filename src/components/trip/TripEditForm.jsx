import { useState } from 'react';
import { Button, Input, Textarea, FormRow } from '../ui';

function TripEditForm({ trip, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: trip.name || '',
    description: trip.description || '',
    startDate: trip.startDate?.slice(0, 10) || '',
    endDate: trip.endDate?.slice(0, 10) || '',
    budget: trip.budget?.toString() || '',
    notes: trip.notes || '',
  });
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Trip name is required.';
    if (!form.startDate) e.startDate = 'Start date is required.';
    if (!form.endDate) e.endDate = 'End date is required.';
    if (form.startDate && form.endDate && form.endDate < form.startDate)
      e.endDate = 'End date cannot be before start date.';
    if (form.budget !== '' && Number(form.budget) < 0)
      e.budget = 'Budget cannot be negative.';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length > 0) { setErrors(ve); return; }
    setErrors({});
    onSubmit({
      ...form,
      budget: form.budget === '' ? null : Number(form.budget),
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Input label="Trip Name *" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Summer in Greece" error={errors.name} />
      <Textarea label="Description" name="description" value={form.description} onChange={handleChange} placeholder="A short description..." />
      <FormRow>
        <Input label="Start Date *" name="startDate" type="date" value={form.startDate} onChange={handleChange} error={errors.startDate} />
        <Input label="End Date *" name="endDate" type="date" value={form.endDate} onChange={handleChange} error={errors.endDate} />
      </FormRow>
      <Input label="Planned Budget (€)" name="budget" type="number" min="0" value={form.budget} onChange={handleChange} placeholder="e.g. 1500" error={errors.budget} hint="Leave empty if no budget set" />
      <Textarea label="Notes" name="notes" value={form.notes} onChange={handleChange} placeholder="Additional notes..." />
      <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
        <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>Cancel</Button>
      </div>
    </form>
  );
}

export default TripEditForm;