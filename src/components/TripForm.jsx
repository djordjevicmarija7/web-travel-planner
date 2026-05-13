import { useState } from 'react';

const emptyForm = {
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  budget: '',
  notes: '',
};

function TripForm({ initialData, onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState(initialData || emptyForm);
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const newErrors = {};

    if (!formData.name.trim())
      newErrors.name = 'Trip name is required.';

    if (!formData.startDate)
      newErrors.startDate = 'Start date is required.';

    if (!formData.endDate)
      newErrors.endDate = 'End date is required.';

    if (formData.startDate && formData.endDate &&
        formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date cannot be before start date.';
    }

    if (formData.budget !== '' && Number(formData.budget) < 0)
      newErrors.budget = 'Budget cannot be negative.';

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
      budget: formData.budget === '' ? null : Number(formData.budget),
    });
  }

  return (
    <form onSubmit={handleSubmit}>

      <div>
        <label>Trip name *</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Summer vacation in Greece"
        />
        {errors.name && <p style={{ color: 'red' }}>{errors.name}</p>}
      </div>

      <div>
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Short trip description"
        />
      </div>

      <div>
        <label>Start date *</label>
        <input
          name="startDate"
          type="date"
          value={formData.startDate}
          onChange={handleChange}
        />
        {errors.startDate && <p style={{ color: 'red' }}>{errors.startDate}</p>}
      </div>

      <div>
        <label>End date *</label>
        <input
          name="endDate"
          type="date"
          value={formData.endDate}
          onChange={handleChange}
        />
        {errors.endDate && <p style={{ color: 'red' }}>{errors.endDate}</p>}
      </div>

      <div>
        <label>Planned budget (€)</label>
        <input
          name="budget"
          type="number"
          min="0"
          value={formData.budget}
          onChange={handleChange}
          placeholder="e.g. 1500"
        />
        {errors.budget && <p style={{ color: 'red' }}>{errors.budget}</p>}
      </div>

      <div>
        <label>Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Additional notes..."
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </button>

      <button type="button" onClick={onCancel} disabled={loading}>
        Cancel
      </button>

    </form>
  );
}

export default TripForm;