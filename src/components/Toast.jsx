function Toast({ toast }) {
  if (!toast) return null;
  const isSuccess = toast.type === 'success';
  return (
    <div style={{
      position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999,
      padding: '14px 20px', borderRadius: 'var(--radius-md)',
      background: isSuccess
        ? 'linear-gradient(135deg, rgba(78,201,148,0.14), rgba(78,201,148,0.07))'
        : 'linear-gradient(135deg, rgba(240,112,112,0.14), rgba(240,112,112,0.07))',
      border: `1px solid ${isSuccess ? 'rgba(78,201,148,0.28)' : 'rgba(240,112,112,0.28)'}`,
      color: isSuccess ? 'var(--status-completed)' : 'var(--status-cancelled)',
      fontSize: '13px', fontWeight: '500',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      boxShadow: 'var(--shadow-lg)', maxWidth: '340px',
      display: 'flex', alignItems: 'center', gap: '10px',
      animation: 'toastIn 0.3s ease both',
    }}>
      <span style={{ fontSize: '15px', flexShrink: 0 }}>{isSuccess ? '✓' : '✕'}</span>
      <span>{toast.message}</span>
    </div>
  );
}

export default Toast;
