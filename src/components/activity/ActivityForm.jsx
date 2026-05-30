import { useState } from 'react';
import { Button, Input, Textarea, Select, FormRow } from '../ui';
import { ActivityStatus } from '../../enums/activity/ActivityStatus';

const STATUS_OPTIONS = [
  { value: ActivityStatus.planned,   label: 'Planned' },
  { value: ActivityStatus.reserved,  label: 'Reserved' },
  { value: ActivityStatus.completed, label: 'Completed' },
  { value: ActivityStatus.cancelled, label: 'Cancelled' },
];

const emptyForm = {
  name: '', date: '', time: '', location: '',
  description: '', estimatedCost: '', status: ActivityStatus.planned,
};

function ActivityForm({ initialData, onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState(initialData || emptyForm);
  const [errors, setErrors] = useState({});
  const isEdit = !!initialData;

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const e = {};
    if (!formData.name.trim()) e.name = 'Activity name is required.';
    if (!formData.date) e.date = 'Date is required.';
    if (formData.estimatedCost !== '' && Number(formData.estimatedCost) < 0)
      e.estimatedCost = 'Cost cannot be negative.';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length > 0) { setErrors(ve); return; }
    setErrors({});
    onSubmit({
      ...formData,
      estimatedCost: formData.estimatedCost === '' ? null : Number(formData.estimatedCost),
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <Input
        label="Activity Name *"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="e.g. Visit to Acropolis"
        error={errors.name}
      />
      <FormRow>
        <Input label="Date *" name="date" type="date" value={formData.date} onChange={handleChange} error={errors.date} />
        <Input label="Time" name="time" type="time" value={formData.time} onChange={handleChange} />
      </FormRow>
      <Input
        label="Location"
        name="location"
        value={formData.location}
        onChange={handleChange}
        placeholder="e.g. Athens, Greece"
      />
      <Textarea
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Short activity description..."
        style={{ height: '72px' }}
      />
      <FormRow>
        <Input
          label="Estimated Cost (€)"
          name="estimatedCost"
          type="number"
          min="0"
          value={formData.estimatedCost}
          onChange={handleChange}
          placeholder="e.g. 20"
          error={errors.estimatedCost}
        />
        <Select label="Status" name="status" value={formData.status} onChange={handleChange}>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ background: 'var(--bg-elevated)' }}>
              {opt.label}
            </option>
          ))}
        </Select>
      </FormRow>
      <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Activity'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default ActivityForm;
