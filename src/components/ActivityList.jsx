import activityService from '../services/activityService';

const STATUS_LABELS = {
  planned: 'Planned',
  reserved: 'Reserved',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function ActivityList({ activities, tripId, onDeleted }) {
  const grouped = activities.reduce((acc, activity) => {
    const date = activity.date?.slice(0, 10);
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  async function handleDelete(id) {
    if (!window.confirm('Delete activity?')) return;
    try {
      await activityService.remove(tripId, id);
      onDeleted(id);
    } catch {
      alert('Error while deleting activity.');
    }
  }

  if (activities.length === 0) {
    return <p>No activity. Add the first one!</p>;
  }

  return (
    <div>
      {sortedDates.map((date) => (
        <div key={date}>
          <h4>{date}</h4>
          {grouped[date].map((activity) => (
            <div
              key={activity.id}
              style={{ border: '1px solid #ddd', padding: '8px', marginBottom: '6px' }}
            >
              <strong>{activity.name}</strong>
              {activity.time && <span> — {activity.time}</span>}
              {activity.location && <p>📍 {activity.location}</p>}
              {activity.description && <p>{activity.description}</p>}
              {activity.estimatedCost != null && (
                <p>Trošak: {activity.estimatedCost} €</p>
              )}
              <p>Status: {STATUS_LABELS[activity.status] || activity.status}</p>
              <button onClick={() => handleDelete(activity.id)}>Delete</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default ActivityList;