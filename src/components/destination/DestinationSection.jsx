import { useState } from 'react';
import destinationService from '../../services/destinationService';
import ConfirmDialog from '../common/ConfirmDialog';
import { Button, Input, Textarea, FormRow, Modal, Badge, EmptyState, Card } from '../ui';

const emptyForm = {
  name: '', location: '', arrivalDate: '', departureDate: '', description: '', notes: '',
};

function DestinationForm({ initialData, onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState(initialData || emptyForm);
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const e = {};
    if (!formData.name.trim()) e.name = 'Destination name is required.';
    if (!formData.arrivalDate) e.arrivalDate = 'Arrival date is required.';
    if (!formData.departureDate) e.departureDate = 'Departure date is required.';
    if (formData.arrivalDate && formData.departureDate && formData.departureDate < formData.arrivalDate)
      e.departureDate = 'Departure cannot be before arrival.';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length > 0) { setErrors(ve); return; }
    setErrors({});
    onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
        />
        <Input
          label="Departure Date *"
          name="departureDate"
          type="date"
          value={formData.departureDate}
          onChange={handleChange}
          error={errors.departureDate}
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

function DestinationCard({ dest, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false);

  function getNights() {
    if (!dest.arrivalDate || !dest.departureDate) return null;
    const diff = Math.ceil(
      (new Date(dest.departureDate) - new Date(dest.arrivalDate)) / (1000 * 60 * 60 * 24)
    );
    return diff > 0 ? diff : 0;
  }

  const nights = getNights();

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${hovered ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
        borderLeft: '3px solid var(--accent-primary)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 18px',
        transition: 'all var(--transition-base)',
        boxShadow: hovered ? 'var(--shadow-accent)' : 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '19px', fontWeight: '400' }}>
              {dest.name}
            </span>
            {nights !== null && (
              <span style={{
                fontSize: '10px', color: 'var(--accent-primary)', background: 'var(--accent-subtle)',
                border: '1px solid var(--accent-border)', borderRadius: '10px',
                padding: '2px 8px', letterSpacing: '0.06em',
              }}>
                {nights} night{nights !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {dest.location && (
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              📍 {dest.location}
            </div>
          )}

          <div style={{
            fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
            marginBottom: dest.description || dest.notes ? '8px' : '0',
          }}>
            {dest.arrivalDate?.slice(0, 10)} → {dest.departureDate?.slice(0, 10)}
          </div>

          {dest.description && (
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: dest.notes ? '4px' : '0' }}>
              {dest.description}
            </p>
          )}
          {dest.notes && (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, fontStyle: 'italic' }}>
              💬 {dest.notes}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          <button onClick={onEdit} style={actionBtn}>Edit</button>
          <button
            onClick={onDelete}
            style={{ ...actionBtn, color: 'var(--status-cancelled)', borderColor: 'rgba(240,112,112,0.2)' }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

const actionBtn = {
  background: 'none', border: '1px solid var(--border-subtle)', cursor: 'pointer',
  color: 'var(--text-secondary)', fontSize: '11px', padding: '5px 11px',
  borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-body)',
  letterSpacing: '0.03em', transition: 'all var(--transition-fast)',
};

function DestinationSection({ destinations, tripId, onAdded, onUpdated, onDeleted }) {
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null });

  async function handleSubmit(formData) {
    try {
      setLoading(true);
      if (editTarget) {
        const updated = await destinationService.update(tripId, editTarget.id, formData);
        onUpdated(updated);
      } else {
        const created = await destinationService.create(tripId, formData);
        onAdded(created);
      }
      setShowModal(false);
      setEditTarget(null);
    } catch {
      alert('Error saving destination.');
    } finally {
      setLoading(false);
    }
  }

  function handleDelete(id) {
    setConfirmDialog({ isOpen: true, id });
  }

  async function handleDeleteConfirmed() {
    const id = confirmDialog.id;
    setConfirmDialog({ isOpen: false, id: null });
    try {
      await destinationService.remove(tripId, id);
      onDeleted(id);
    } catch {
      alert('Error deleting destination.');
    }
  }

  function openEdit(dest) {
    setEditTarget(dest);
    setShowModal(true);
  }

  function openCreate() {
    setEditTarget(null);
    setShowModal(true);
  }

  const sorted = [...destinations].sort((a, b) =>
    new Date(a.arrivalDate) - new Date(b.arrivalDate)
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <Button variant="accent" onClick={openCreate}>
          + Add Destination
        </Button>
      </div>

      {destinations.length === 0 ? (
        <EmptyState
          icon="🗺"
          title="No destinations yet"
          description="Add the places you plan to visit on this trip."
          action={<Button variant="accent" onClick={openCreate}>+ Add First Destination</Button>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sorted.map((dest, idx) => (
            <div
              key={dest.id}
              style={{ animation: `fadeIn 0.28s ease ${idx * 0.06}s both` }}
            >
              <DestinationCard
                dest={dest}
                onEdit={() => openEdit(dest)}
                onDelete={() => handleDelete(dest.id)}
              />
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showModal}
        onClose={() => { setShowModal(false); setEditTarget(null); }}
        title={editTarget ? 'Edit Destination' : 'New Destination'}
      >
        <DestinationForm
          initialData={editTarget ? {
            name: editTarget.name || '',
            location: editTarget.location || '',
            arrivalDate: editTarget.arrivalDate?.slice(0, 10) || '',
            departureDate: editTarget.departureDate?.slice(0, 10) || '',
            description: editTarget.description || '',
            notes: editTarget.notes || '',
          } : null}
          onSubmit={handleSubmit}
          onCancel={() => { setShowModal(false); setEditTarget(null); }}
          loading={loading}
        />
      </Modal>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Destination"
        message="Are you sure you want to delete this destination? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDialog({ isOpen: false, id: null })}
      />
    </div>
  );
}

export default DestinationSection;