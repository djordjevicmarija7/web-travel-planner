import { useEffect, useRef } from 'react';

function ConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) {
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => confirmBtnRef.current?.focus(), 50);
    const handleKey = (e) => { if (e.key === 'Escape') onCancel?.(); };
    window.addEventListener('keydown', handleKey);
    return () => { clearTimeout(timer); window.removeEventListener('keydown', handleKey); };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const variantColors = {
    danger:  { btn: 'var(--status-cancelled, #ef4444)', hover: 'rgba(239,68,68,0.15)',  icon: '🗑' },
    warning: { btn: 'var(--status-reserved, #f59e0b)', hover: 'rgba(245,158,11,0.15)', icon: '⚠️' },
    default: { btn: 'var(--accent-primary, #4a9eff)',  hover: 'rgba(74,158,255,0.15)', icon: '❓' },
  };
  const { btn: btnColor, hover: hoverBg, icon } = variantColors[variant] ?? variantColors.default;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onCancel}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          animation: 'cdFadeIn 0.15s ease',
        }}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cd-title"
        style={{
          position: 'fixed', inset: 0, zIndex: 1001,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
          pointerEvents: 'none',
        }}
      >
        <div style={{
          pointerEvents: 'auto',
          background: 'var(--bg-elevated, #1a1a2e)',
          border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '28px 28px 24px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
          animation: 'cdSlideUp 0.18s ease',
        }}>
          {/* Icon + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '22px', lineHeight: 1 }}>{icon}</span>
            <h2
              id="cd-title"
              style={{
                margin: 0,
                fontFamily: 'var(--font-display, inherit)',
                fontSize: '17px',
                fontWeight: '600',
                color: 'var(--text-primary, #fff)',
                letterSpacing: '0.01em',
              }}
            >
              {title}
            </h2>
          </div>

          {/* Message */}
          {message && (
            <p style={{
              margin: '0 0 24px',
              fontSize: '13px',
              lineHeight: 1.6,
              color: 'var(--text-muted, rgba(255,255,255,0.5))',
              paddingLeft: '34px',
            }}>
              {message}
            </p>
          )}

          {/* Buttons */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: '10px',
            marginTop: message ? 0 : '24px',
          }}>
            <button
              onClick={onCancel}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
                background: 'transparent',
                color: 'var(--text-secondary, rgba(255,255,255,0.7))',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {cancelText}
            </button>

            <button
              ref={confirmBtnRef}
              onClick={onConfirm}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-md, 8px)',
                border: 'none',
                background: hoverBg,
                color: btnColor,
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.15s, box-shadow 0.15s',
                outline: `1px solid ${btnColor}33`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = btnColor;
                e.currentTarget.style.color = '#0a0a0f';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = hoverBg;
                e.currentTarget.style.color = btnColor;
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cdFadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes cdSlideUp { from { opacity: 0; transform: translateY(12px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
      `}</style>
    </>
  );
}

export default ConfirmDialog;