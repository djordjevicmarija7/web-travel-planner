import { useState } from "react";

const STATUS_OPTIONS = [
    {value: 'planned', label:'Planned'},
    {value: 'reserved', label:'Reserved'},
    {value: 'completed', label:'Completed'},
    {value: 'cancelled', label:'Cancelled'},    
];

const emptyForm= {
    name: "",
    date: "",
    time: "",
    location: "",
    description: "",
    estimatedCost: "",
    status: 'planned',
}

function ActivityForm({onSubmit, onCancel, loading}){
    const [formData, setFormData] = useState(emptyForm);
    const [errors, setErrors] = useState({});

    function handleChange(e){
        const {name, value} = e.target;
        setFormData((prev)=> ({...prev, [name]: value}));
    }
    function validate(){
        const newErrors = {};
        if(!formData.name.trim()){
            newErrors.name = 'Name is required.'
        }
            if (!formData.date)
      newErrors.date = 'Date is required.';
    if (formData.estimatedCost !== '' && Number(formData.estimatedCost) < 0)
      newErrors.estimatedCost = 'Estimated cost cannot be less then 0.';
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
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name *</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Visit to the Acropolis"
        />
        {errors.name && <p style={{ color: 'red' }}>{errors.name}</p>}
      </div>

      <div>
        <label>Date *</label>
        <input
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
        />
        {errors.date && <p style={{ color: 'red' }}>{errors.date}</p>}
      </div>

      <div>
        <label>Time</label>
        <input
          name="time"
          type="time"
          value={formData.time}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Location</label>
        <input
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="e.g. Athens, Greece"
        />
      </div>

      <div>
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="A short description of the activity."
        />
      </div>

      <div>
        <label>Estimated cost (€)</label>
        <input
          name="estimatedCost"
          type="number"
          min="0"
          value={formData.estimatedCost}
          onChange={handleChange}
          placeholder="e.g. 20"
        />
        {errors.estimatedCost && (
          <p style={{ color: 'red' }}>{errors.estimatedCost}</p>
        )}
      </div>

      <div>
        <label>Status</label>
        <select name="status" value={formData.status} onChange={handleChange}>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Add activity'}
      </button>
      <button type="button" onClick={onCancel} disabled={loading}>
        Odustani
      </button>
    </form>
  );

}
export default ActivityForm;