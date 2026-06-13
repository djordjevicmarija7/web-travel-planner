import { useState } from 'react';
import destinationService from '../../services/destinationService';
import { Button, Modal, EmptyState } from '../ui';
import DestinationForm from './DestinationForm';
import DestinationCard from './DestinationCard';
import ConfirmDialog from '../common/ConfirmDialog';

function DestinationSection({ destinations, tripId, tripStartDate, tripEndDate, onAdded, onUpdated, onDeleted }) {
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

  const sorted = [...destinations].sort((a, b) => new Date(a.arrivalDate) - new Date(b.arrivalDate));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <Button
          variant="accent"
          onClick={() => {
            setEditTarget(null);
            setShowModal(true);
          }}
        >
          + Add Destination
        </Button>
      </div>

      {destinations.length === 0 ? (
        <EmptyState
          icon="🗺"
          title="No destinations yet"
          description="Add the places you plan to visit on this trip."
          action={
            <Button
              variant="accent"
              onClick={() => {
                setEditTarget(null);
                setShowModal(true);
              }}
            >
              + Add First Destination
            </Button>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sorted.map((dest, idx) => (
            <div key={dest.id} style={{ animation: `fadeIn 0.28s ease ${idx * 0.06}s both` }}>
              <DestinationCard
                dest={dest}
                onEdit={() => {
                  setEditTarget(dest);
                  setShowModal(true);
                }}
                onDelete={() => handleDelete(dest.id)}
              />
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditTarget(null);
        }}
        title={editTarget ? 'Edit Destination' : 'New Destination'}
      >
        <DestinationForm
          initialData={
            editTarget
              ? {
                  name: editTarget.name || '',
                  location: editTarget.location || '',
                  arrivalDate: editTarget.arrivalDate?.slice(0, 10) || '',
                  departureDate: editTarget.departureDate?.slice(0, 10) || '',
                  description: editTarget.description || '',
                  notes: editTarget.notes || '',
                }
              : null
          }
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false);
            setEditTarget(null);
          }}
          loading={loading}
          tripStartDate={tripStartDate}
          tripEndDate={tripEndDate}
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