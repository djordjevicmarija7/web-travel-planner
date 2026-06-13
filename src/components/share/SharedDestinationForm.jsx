import { useState } from 'react';
import { Button, Input, Textarea, FormRow } from '../ui';
import { formatDate } from '../../utils/formatDate';

const empty = { name: '', location: '', arrivalDate: '', departureDate: '', description: '', notes: '' };

function SharedDestinationForm({ initialData, onSubmit, onCancel, loading, tripStartDate, tripEndDate }) {
  const [form, setForm] = useState(initialData || empty);
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.arrivalDate) e.arrivalDate = 'Arrival date is required.';
    if (!form.departureDate) e.departureDate = 'Departure date is required.';
    if (form.arrivalDate && form.departureDate && form.departureDate < form.arrivalDate)
      e.departureDate = 'Departure cannot be before arrival.';
    if (tripStartDate && form.arrivalDate && form.arrivalDate < tripStartDate)
      e.arrivalDate = 'Cannot be before trip start.';
    if (tripEndDate && form.departureDate && form.departureDate > tripEndDate)
      e.departureDate = 'Cannot be after trip end.';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length > 0) { setErrors(ve); return; }
    setErrors({});
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {tripStartDate && tripEndDate && (
        <div style={{ padding: '9px 13px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', fontSize: '11px', color: 'var(--accent-dim)' }}>
          Trip runs {formatDate(tripStartDate)} → {formatDate(tripEndDate)}
        </div>
      )}
      <Input label="Destination Name *" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Athens" error={errors.name} />
      <Input label="Location" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Athens, Greece" />
      <FormRow>
        <Input label="Arrival Date *" name="arrivalDate" type="date" value={form.arrivalDate} onChange={handleChange} error={errors.arrivalDate} min={tripStartDate || undefined} max={tripEndDate || undefined} />
        <Input label="Departure Date *" name="departureDate" type="date" value={form.departureDate} onChange={handleChange} error={errors.departureDate} min={tripStartDate || undefined} max={tripEndDate || undefined} />
      </FormRow>
      <Textarea label="Description" name="description" value={form.description} onChange={handleChange} placeholder="What will you do here?" style={{ height: '68px' }} />
      <Textarea label="Notes" name="notes" value={form.notes} onChange={handleChange} placeholder="Reminders, tips..." style={{ height: '60px' }} />
      <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
        <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Saving...' : initialData ? 'Save Changes' : 'Add Destination'}</Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>Cancel</Button>
      </div>
    </form>
  );
}

export default SharedDestinationForm;