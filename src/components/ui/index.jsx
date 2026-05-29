import React from 'react';

/* ─── BUTTON ──────────────────────────────────────────────────── */
const btnBase = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  gap: '6px', fontFamily: 'var(--font-body)', fontWeight: '500',
  fontSize: '12px', letterSpacing: '0.06em', textTransform: 'uppercase',
  borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
  transition: 'all var(--transition-fast)', whiteSpace: 'nowrap',
};

const btnVariants = {
  primary: {
    background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-glow) 100%)',
    color: '#0c0c12', padding: '10px 22px',
    boxShadow: '0 2px 16px rgba(201,168,76,0.28)',
  },
  secondary: {
    background: 'var(--bg-elevated)', color: 'var(--text-primary)',
    padding: '10px 22px', border: '1px solid var(--border-default)',
  },
  ghost: {
    background: 'transparent', color: 'var(--text-secondary)',
    padding: '10px 16px', border: '1px solid var(--border-subtle)',
  },
  danger: {
    background: 'rgba(240,112,112,0.08)', color: 'var(--status-cancelled)',
    padding: '10px 22px', border: '1px solid rgba(240,112,112,0.2)',
  },
  accent: {
    background: 'var(--accent-subtle)', color: 'var(--accent-primary)',
    padding: '10px 22px', border: '1px solid var(--accent-border)',
  },
};

const btnSizes = {
  xs: { fontSize: '10px', padding: '4px 10px', letterSpacing: '0.04em' },
  sm: { fontSize: '11px', padding: '7px 14px' },
  md: {},
  lg: { fontSize: '13px', padding: '13px 30px' },
  icon: { padding: '8px', width: '34px', height: '34px', borderRadius: 'var(--radius-sm)', fontSize: '14px', letterSpacing: 0 },
};

export function Button({ variant = 'secondary', size = 'md', disabled, children, style, ...props }) {
  const [hovered, setHovered] = React.useState(false);
  const s = { ...btnBase, ...btnVariants[variant], ...btnSizes[size], ...style };
  if (disabled) { s.opacity = 0.42; s.cursor = 'not-allowed'; s.pointerEvents = 'none'; }
  else if (hovered) { s.transform = 'translateY(-1px)'; s.filter = 'brightness(1.1)'; }
  return (
    <button {...props} disabled={disabled} style={s}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {children}
    </button>
  );
}

/* ─── INPUT ───────────────────────────────────────────────────── */
const inputBase = {
  width: '100%', padding: '10px 14px',
  background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
  fontSize: '13px', fontFamily: 'var(--font-body)',
  transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
  outline: 'none', boxSizing: 'border-box',
};

const labelStyle = {
  fontSize: '10px', fontWeight: '500', letterSpacing: '0.1em',
  textTransform: 'uppercase', color: 'var(--text-muted)',
};

export function Input({ label, error, hint, style, ...props }) {
  const [focused, setFocused] = React.useState(false);
  const s = {
    ...inputBase,
    borderColor: error ? 'var(--status-cancelled)' : focused ? 'var(--accent-primary)' : 'var(--border-default)',
    boxShadow: error ? '0 0 0 3px rgba(240,112,112,0.1)' : focused ? '0 0 0 3px rgba(201,168,76,0.1)' : 'none',
    ...style,
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {label && <label style={labelStyle}>{label}</label>}
      <input {...props} style={s} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
      {error && <span style={{ color: 'var(--status-cancelled)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>⚠ {error}</span>}
      {hint && !error && <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{hint}</span>}
    </div>
  );
}

export function Textarea({ label, error, style, ...props }) {
  const [focused, setFocused] = React.useState(false);
  const s = {
    ...inputBase, height: '88px', resize: 'vertical',
    borderColor: error ? 'var(--status-cancelled)' : focused ? 'var(--accent-primary)' : 'var(--border-default)',
    boxShadow: focused ? '0 0 0 3px rgba(201,168,76,0.1)' : 'none', ...style,
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {label && <label style={labelStyle}>{label}</label>}
      <textarea {...props} style={s} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
      {error && <span style={{ color: 'var(--status-cancelled)', fontSize: '11px' }}>⚠ {error}</span>}
    </div>
  );
}

export function Select({ label, error, children, style, ...props }) {
  const [focused, setFocused] = React.useState(false);
  const s = {
    ...inputBase, appearance: 'none', WebkitAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='7' viewBox='0 0 12 7'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b6970' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 13px center', paddingRight: '36px',
    borderColor: focused ? 'var(--accent-primary)' : 'var(--border-default)',
    boxShadow: focused ? '0 0 0 3px rgba(201,168,76,0.1)' : 'none', ...style,
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {label && <label style={labelStyle}>{label}</label>}
      <select {...props} style={s} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>{children}</select>
      {error && <span style={{ color: 'var(--status-cancelled)', fontSize: '11px' }}>⚠ {error}</span>}
    </div>
  );
}

/* ─── BADGE ───────────────────────────────────────────────────── */
const badgeColors = {
  planned:   { bg: 'rgba(91,156,246,0.12)',  color: 'var(--status-planned)' },
  reserved:  { bg: 'rgba(240,164,74,0.12)',  color: 'var(--status-reserved)' },
  completed: { bg: 'rgba(78,201,148,0.12)',  color: 'var(--status-completed)' },
  cancelled: { bg: 'rgba(240,112,112,0.12)', color: 'var(--status-cancelled)' },
  view:      { bg: 'rgba(91,156,246,0.12)',  color: 'var(--status-planned)' },
  edit:      { bg: 'rgba(240,164,74,0.12)',  color: 'var(--status-reserved)' },
  admin:     { bg: 'rgba(201,168,76,0.14)',  color: 'var(--accent-primary)' },
  user:      { bg: 'var(--bg-overlay)',      color: 'var(--text-secondary)' },
  upcoming:  { bg: 'rgba(91,156,246,0.12)',  color: 'var(--status-planned)' },
  ongoing:   { bg: 'rgba(78,201,148,0.12)',  color: 'var(--status-completed)' },
  past:      { bg: 'var(--bg-overlay)',      color: 'var(--text-muted)' },
};

export function Badge({ variant = 'planned', children, style }) {
  const c = badgeColors[variant] || badgeColors.planned;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
      borderRadius: '20px', fontSize: '10px', fontWeight: '500',
      letterSpacing: '0.07em', textTransform: 'uppercase',
      background: c.bg, color: c.color, ...style,
    }}>
      {children}
    </span>
  );
}

/* ─── CARD ────────────────────────────────────────────────────── */
export function Card({ children, style, hover = false, onClick, glass = false }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: glass ? 'var(--bg-glass)' : 'var(--bg-surface)',
        backdropFilter: glass ? 'blur(16px)' : 'none',
        border: `1px solid ${hovered ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-lg)', padding: '20px',
        transition: 'all var(--transition-base)',
        boxShadow: hovered ? 'var(--shadow-accent)' : 'none',
        transform: hovered ? 'translateY(-2px)' : 'none',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}>
      {children}
    </div>
  );
}

/* ─── DIVIDER ─────────────────────────────────────────────────── */
export function Divider({ label, style }) {
  if (!label) return <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '20px 0', ...style }} />;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0', ...style }}>
      <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
      <span style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
      <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
    </div>
  );
}

/* ─── EMPTY STATE ─────────────────────────────────────────────── */
export function EmptyState({ icon, title, description, action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '56px 24px', textAlign: 'center', gap: '12px',
    }}>
      {icon && <div style={{ fontSize: '40px', opacity: 0.25, marginBottom: '4px' }}>{icon}</div>}
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '400', color: 'var(--text-secondary)' }}>{title}</div>
      {description && <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '300px', lineHeight: 1.6 }}>{description}</p>}
      {action && <div style={{ marginTop: '12px' }}>{action}</div>}
    </div>
  );
}

/* ─── SPINNER ─────────────────────────────────────────────────── */
export function Spinner({ size = 20, color = 'var(--accent-primary)' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `2px solid rgba(255,255,255,0.08)`,
      borderTopColor: color,
      animation: 'spin 0.7s linear infinite',
      flexShrink: 0,
    }} />
  );
}

/* ─── MODAL ───────────────────────────────────────────────────── */
export function Modal({ open, onClose, title, children, width = 520 }) {
  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(12,12,18,0.82)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
      animation: 'fadeIn 0.2s ease',
    }} onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div style={{
        width: '100%', maxWidth: width,
        background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)',
        animation: 'scaleIn 0.22s ease',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)',
        }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '400', color: 'var(--text-primary)' }}>{title}</h3>
          <button onClick={onClose} style={{
            background: 'none', border: '1px solid var(--border-subtle)', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: '16px', width: '30px', height: '30px',
            borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all var(--transition-fast)',
          }}>×</button>
        </div>
        <div style={{ padding: '24px', overflowY: 'auto' }}>{children}</div>
      </div>
    </div>
  );
}

/* ─── SECTION HEADER ──────────────────────────────────────────── */
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
      <div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: '300', marginBottom: '4px' }}>{title}</h3>
        {subtitle && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{subtitle}</p>}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}

/* ─── STAT CARD ───────────────────────────────────────────────── */
export function StatCard({ label, value, icon, accent = false }) {
  return (
    <div style={{
      background: accent ? 'var(--accent-subtle)' : 'var(--bg-surface)',
      border: `1px solid ${accent ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
      borderRadius: 'var(--radius-md)', padding: '16px 18px',
    }}>
      <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: accent ? 'var(--accent-dim)' : 'var(--text-muted)', marginBottom: '6px' }}>
        {icon && <span style={{ marginRight: '5px' }}>{icon}</span>}{label}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '400', color: accent ? 'var(--accent-primary)' : 'var(--text-primary)', lineHeight: 1.2 }}>
        {value ?? '—'}
      </div>
    </div>
  );
}

/* ─── PROGRESS BAR ────────────────────────────────────────────── */
export function ProgressBar({ value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const barColor = color || (pct > 90 ? 'var(--status-cancelled)' : pct > 70 ? 'var(--status-reserved)' : 'var(--accent-primary)');
  return (
    <div style={{ height: '4px', background: 'var(--bg-overlay)', borderRadius: '2px', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: '2px', transition: 'width 0.5s ease' }} />
    </div>
  );
}

/* ─── FORM ROW ────────────────────────────────────────────────── */
export function FormRow({ children, cols = 2 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '12px' }}>
      {children}
    </div>
  );
}
