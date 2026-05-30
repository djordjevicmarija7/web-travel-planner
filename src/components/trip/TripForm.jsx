import { useState } from 'react';
import { Button, Input, Textarea, FormRow } from '../ui';

const emptyForm = {
  name: '', description: '', startDate: '', endDate: '', budget: '', notes: '',
};

function TripForm({ initialData, onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState(initialData || emptyForm);
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const e = {};
    if (!formData.name.trim()) e.name = 'Trip name is required.';
    if (!formData.startDate) e.startDate = 'Start date is required.';
    if (!formData.endDate) e.endDate = 'End date is required.';
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate)
      e.endDate = 'End date cannot be before start date.';
    if (formData.budget !== '' && Number(formData.budget) < 0)
      e.budget = 'Budget cannot be negative.';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length > 0) { setErrors(ve); return; }
    setErrors({});
    onSubmit({
      ...formData,
      budget: formData.budget === '' ? null : Number(formData.budget),
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Input
        label="Trip Name *"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="e.g. Summer in Greece"
        error={errors.name}
      />
      <Textarea
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="A short description of your trip..."
      />
      <FormRow>
        <Input
          label="Start Date *"
          name="startDate"
          type="date"
          value={formData.startDate}
          onChange={handleChange}
          error={errors.startDate}
        />
        <Input
          label="End Date *"
          name="endDate"
          type="date"
          value={formData.endDate}
          onChange={handleChange}
          error={errors.endDate}
        />
      </FormRow>
      <Input
        label="Planned Budget (€)"
        name="budget"
        type="number"
        min="0"
        value={formData.budget}
        onChange={handleChange}
        placeholder="e.g. 1500"
        error={errors.budget}
        hint="Leave empty if no budget set"
      />
      <Textarea
        label="Notes"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        placeholder="Additional notes, reminders..."
      />
      <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Trip'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default TripForm;
