function Toast({ toast }) {
  if (!toast) return null;
  const isSuccess = toast.type === 'success';
  return (
    <div style={{
      position: 'fixed',
      bottom: '28px',
      right: '28px',
      padding: '14px 20px',
      borderRadius: 'var(--radius-md)',
      background: isSuccess
        ? 'linear-gradient(135deg, rgba(52,211,153,0.15), rgba(52,211,153,0.08))'
        : 'linear-gradient(135deg, rgba(248,113,113,0.15), rgba(248,113,113,0.08))',
      border: `1px solid ${isSuccess ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
      color: isSuccess ? 'var(--status-completed)' : 'var(--status-cancelled)',
      fontSize: '13px',
      fontWeight: '500',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      boxShadow: 'var(--shadow-lg)',
      zIndex: 9999,
      maxWidth: '340px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      animation: 'toastIn 0.3s ease both',
    }}>
      <span style={{ fontSize: '16px' }}>{isSuccess ? '✓' : '✕'}</span>
      {toast.message}
    </div>
  );
}
export default Toast;