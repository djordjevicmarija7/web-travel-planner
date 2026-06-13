import { useState } from 'react';
import { Button, Input, Textarea, FormRow } from '../ui';
import { formatDate } from '../../utils/formatDate';

const emptyForm = {
  name: '',
  location: '',
  arrivalDate: '',
  departureDate: '',
  description: '',
  notes: '',
};

function DestinationForm({ initialData, onSubmit, onCancel, loading, tripStartDate, tripEndDate }) {
  const [formData, setFormData] = useState(initialData || emptyForm);
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const e = {};

    const arrival = new Date(formData.arrivalDate);
    const departure = new Date(formData.departureDate);
    const start = new Date(tripStartDate);
    const end = new Date(tripEndDate);

    if (!formData.name.trim()) {
      e.name = 'Destination name is required.';
    }

    if (!formData.arrivalDate) {
      e.arrivalDate = 'Arrival date is required.';
    }

    if (!formData.departureDate) {
      e.departureDate = 'Departure date is required.';
    }

    if (formData.arrivalDate && formData.departureDate && departure < arrival) {
      e.departureDate = 'Departure cannot be before arrival.';
    }

    if (tripStartDate && formData.arrivalDate && arrival < start) {
      e.arrivalDate = 'Arrival cannot be before trip start date.';
    }

    if (tripEndDate && formData.arrivalDate && arrival > end) {
      e.arrivalDate = 'Arrival cannot be after trip end date.';
    }

    if (tripStartDate && formData.departureDate && departure < start) {
      e.departureDate = 'Departure cannot be before trip start date.';
    }

    if (tripEndDate && formData.departureDate && departure > end) {
      e.departureDate = 'Departure cannot be after trip end date.';
    }

    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length > 0) {
      setErrors(ve);
      return;
    }
    setErrors({});
    onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {tripStartDate && tripEndDate && (
        <div
          style={{
            padding: '9px 13px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--accent-subtle)',
            border: '1px solid var(--accent-border)',
            fontSize: '11px',
            color: 'var(--accent-dim)',
          }}
        >
          Trip runs {formatDate(tripStartDate)} → {formatDate(tripEndDate)}. Destination dates must stay within this range.
        </div>
      )}

      <Input
        label="Destination Name *"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="e.g. Athens"
        error={errors.name}
      />
      <Input
        label="Location"
        name="location"
        value={formData.location}
        onChange={handleChange}
        placeholder="e.g. Athens, Greece"
      />

      <FormRow>
        <Input
          label="Arrival Date *"
          name="arrivalDate"
          type="date"
          value={formData.arrivalDate}
          onChange={handleChange}
          error={errors.arrivalDate}
          min={tripStartDate || undefined}
          max={tripEndDate || undefined}
        />
        <Input
          label="Departure Date *"
          name="departureDate"
          type="date"
          value={formData.departureDate}
          onChange={handleChange}
          error={errors.departureDate}
          min={tripStartDate || undefined}
          max={tripEndDate || undefined}
        />
      </FormRow>

      <Textarea
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="What will you do here?"
        style={{ height: '72px' }}
      />
      <Textarea
        label="Notes"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        placeholder="Reminders, tips, important info..."
        style={{ height: '64px' }}
      />

      <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Add Destination'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default DestinationForm;