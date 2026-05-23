import { useState } from 'react';

const STATUS_OPTIONS = [
  { value: 'planned', label: 'Planned' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const emptyForm = {
  name: '',
  date: '',
  time: '',
  location: '',
  description: '',
  estimatedCost: '',
  status: 'planned',
};

function ActivityForm({ initialData, onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState(initialData || emptyForm);
  const [errors, setErrors] = useState({});

  const isEdit = !!initialData;

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const newErrors = {};
    if (!formData.name.trim())
      newErrors.name = 'Activity name is required.';
    if (!formData.date)
      newErrors.date = 'Date is required.';
    if (formData.estimatedCost !== '' && Number(formData.estimatedCost) < 0)
      newErrors.estimatedCost = 'Cost cannot be negative.';
    return newErrors;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    onSubmit({
      ...formData,
      estimatedCost: formData.estimatedCost === ''
        ? null
        : Number(formData.estimatedCost),
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '16px',
      marginTop: '10px',
      background: isEdit ? '#FFFBF0' : '#fff',
    }}>
      <h4 style={{ margin: '0 0 12px' }}>
        {isEdit ? 'Edit Activity' : 'New Activity'}
      </h4>

      <div style={{ marginBottom: '10px' }}>
        <label style={labelStyle}>Name *</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Visit to Acropolis"
          style={inputStyle}
        />
        {errors.name && <p style={errorStyle}>{errors.name}</p>}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Date *</label>
          <input
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            style={inputStyle}
          />
          {errors.date && <p style={errorStyle}>{errors.date}</p>}
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Time</label>
          <input
            name="time"
            type="time"
            value={formData.time}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={labelStyle}>Location</label>
        <input
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="e.g. Athens, Greece"
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={labelStyle}>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Short activity description"
          style={{ ...inputStyle, height: '72px', resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Estimated Cost (€)</label>
          <input
            name="estimatedCost"
            type="number"
            min="0"
            value={formData.estimatedCost}
            onChange={handleChange}
            placeholder="e.g. 20"
            style={inputStyle}
          />
          {errors.estimatedCost && (
            <p style={errorStyle}>{errors.estimatedCost}</p>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={inputStyle}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: '#1D9E75',
            color: '#fff',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '500',
          }}
        >
          {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Activity'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '500',
  marginBottom: '4px',
  color: '#555',
};

const inputStyle = {
  width: '100%',
  padding: '7px 10px',
  borderRadius: '6px',
  border: '1px solid #ddd',
  fontSize: '13px',
  boxSizing: 'border-box',
};

const errorStyle = {
  color: '#E24B4A',
  fontSize: '11px',
  margin: '3px 0 0',
};

export default ActivityForm;