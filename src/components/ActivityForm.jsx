import { useState } from 'react';
import { Button, Input, Textarea, Select } from './ui';

const STATUS_OPTIONS = [
  { value: 'planned', label: 'Planned' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const emptyForm = { name: '', date: '', time: '', location: '', description: '', estimatedCost: '', status: 'planned' };

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
    onSubmit({ ...formData, estimatedCost: formData.estimatedCost === '' ? null : Number(formData.estimatedCost) });
  }

  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--accent-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      marginTop: '12px',
      animation: 'fadeIn 0.25s ease',
    }}>
      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', marginBottom: '16px', color: 'var(--accent-primary)' }}>
        {isEdit ? 'Edit Activity' : 'New Activity'}
      </h4>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <Input label="Name *" name="name" value={formData.name} onChange={handleChange}
          placeholder="e.g. Visit to Acropolis" error={errors.name} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Input label="Date *" name="date" type="date" value={formData.date} onChange={handleChange} error={errors.date} />
          <Input label="Time" name="time" type="time" value={formData.time} onChange={handleChange} />
        </div>
        <Input label="Location" name="location" value={formData.location} onChange={handleChange}
          placeholder="e.g. Athens, Greece" />
        <Textarea label="Description" name="description" value={formData.description} onChange={handleChange}
          placeholder="Short activity description" style={{ height: '72px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Input label="Estimated Cost (€)" name="estimatedCost" type="number" min="0" value={formData.estimatedCost}
            onChange={handleChange} placeholder="e.g. 20" error={errors.estimatedCost} />
          <Select label="Status" name="status" value={formData.status} onChange={handleChange}>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} style={{ background: 'var(--bg-elevated)' }}>{opt.label}</option>
            ))}
          </Select>
        </div>
        <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Activity'}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

export default ActivityForm;