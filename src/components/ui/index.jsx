import React from 'react';

/* ─── BUTTON ─────────────────────────────────────────────── */
const btnBase = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  fontFamily: 'var(--font-body)',
  fontWeight: '500',
  fontSize: '13px',
  letterSpacing: '0.03em',
  borderRadius: 'var(--radius-md)',
  border: 'none',
  cursor: 'pointer',
  transition: 'all var(--transition-fast)',
  whiteSpace: 'nowrap',
  textTransform: 'uppercase',
};

const btnVariants = {
  primary: {
    background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-glow) 100%)',
    color: '#0a0a0f',
    padding: '9px 20px',
    boxShadow: '0 2px 12px rgba(201,168,76,0.3)',
  },
  secondary: {
    background: 'var(--bg-elevated)',
    color: 'var(--text-primary)',
    padding: '9px 20px',
    border: '1px solid var(--border-default)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    padding: '9px 16px',
    border: '1px solid var(--border-subtle)',
  },
  danger: {
    background: 'rgba(248,113,113,0.1)',
    color: 'var(--status-cancelled)',
    padding: '9px 20px',
    border: '1px solid rgba(248,113,113,0.2)',
  },
  accent: {
    background: 'var(--accent-subtle)',
    color: 'var(--accent-primary)',
    padding: '9px 20px',
    border: '1px solid var(--accent-border)',
  },
};

const btnSizes = {
  sm: { fontSize: '11px', padding: '6px 12px' },
  md: {},
  lg: { fontSize: '14px', padding: '12px 28px' },
  icon: { padding: '8px', width: '34px', height: '34px', borderRadius: 'var(--radius-sm)' },
};

export function Button({
  variant = 'secondary',
  size = 'md',
  disabled,
  children,
  style,
  ...props
}) {
  const [hovered, setHovered] = React.useState(false);
  const base = { ...btnBase, ...btnVariants[variant], ...btnSizes[size], ...style };
  if (disabled) {
    base.opacity = 0.45;
    base.cursor = 'not-allowed';
  } else if (hovered) {
    base.transform = 'translateY(-1px)';
    base.filter = 'brightness(1.08)';
  }
  return (
    <button
      {...props}
      disabled={disabled}
      style={base}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}

/* ─── INPUT ──────────────────────────────────────────────── */
const inputBase = {
  width: '100%',
  padding: '10px 14px',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-primary)',
  fontSize: '13px',
  fontFamily: 'var(--font-body)',
  transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
  outline: 'none',
  boxSizing: 'border-box',
};

export function Input({ label, error, style, ...props }) {
  const [focused, setFocused] = React.useState(false);
  const inputStyle = {
    ...inputBase,
    borderColor: error ? 'var(--status-cancelled)' : focused ? 'var(--accent-primary)' : 'var(--border-default)',
    boxShadow: focused ? '0 0 0 3px rgba(201,168,76,0.1)' : 'none',
    ...style,
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {label && <label style={labelStyle}>{label}</label>}
      <input
        {...props}
        style={inputStyle}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {error && <span style={{ color: 'var(--status-cancelled)', fontSize: '11px' }}>{error}</span>}
    </div>
  );
}

export function Textarea({ label, error, style, ...props }) {
  const [focused, setFocused] = React.useState(false);
  const s = {
    ...inputBase,
    height: '88px',
    resize: 'vertical',
    borderColor: error ? 'var(--status-cancelled)' : focused ? 'var(--accent-primary)' : 'var(--border-default)',
    boxShadow: focused ? '0 0 0 3px rgba(201,168,76,0.1)' : 'none',
    ...style,
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {label && <label style={labelStyle}>{label}</label>}
      <textarea
        {...props}
        style={s}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {error && <span style={{ color: 'var(--status-cancelled)', fontSize: '11px' }}>{error}</span>}
    </div>
  );
}

export function Select({ label, error, children, style, ...props }) {
  const [focused, setFocused] = React.useState(false);
  const s = {
    ...inputBase,
    appearance: 'none',
    WebkitAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239896a0' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: '36px',
    borderColor: focused ? 'var(--accent-primary)' : 'var(--border-default)',
    boxShadow: focused ? '0 0 0 3px rgba(201,168,76,0.1)' : 'none',
    ...style,
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {label && <label style={labelStyle}>{label}</label>}
      <select
        {...props}
        style={s}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        {children}
      </select>
      {error && <span style={{ color: 'var(--status-cancelled)', fontSize: '11px' }}>{error}</span>}
    </div>
  );
}

/* ─── BADGE ──────────────────────────────────────────────── */
const badgeColors = {
  planned:   { bg: 'rgba(74,158,255,0.12)',  color: 'var(--status-planned)' },
  reserved:  { bg: 'rgba(245,158,11,0.12)', color: 'var(--status-reserved)' },
  completed: { bg: 'rgba(52,211,153,0.12)', color: 'var(--status-completed)' },
  cancelled: { bg: 'rgba(248,113,113,0.12)',color: 'var(--status-cancelled)' },
  view:      { bg: 'rgba(74,158,255,0.12)',  color: 'var(--status-planned)' },
  edit:      { bg: 'rgba(245,158,11,0.12)', color: 'var(--status-reserved)' },
  admin:     { bg: 'rgba(201,168,76,0.12)', color: 'var(--accent-primary)' },
  user:      { bg: 'var(--bg-overlay)',     color: 'var(--text-secondary)' },
};

export function Badge({ variant = 'planned', children, style }) {
  const c = badgeColors[variant] || badgeColors.planned;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 9px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '500',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      background: c.bg,
      color: c.color,
      ...style,
    }}>
      {children}
    </span>
  );
}

/* ─── CARD ───────────────────────────────────────────────── */
export function Card({ children, style, hover = false, onClick }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${hovered ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        transition: 'border-color var(--transition-base), box-shadow var(--transition-base), transform var(--transition-base)',
        boxShadow: hovered ? 'var(--shadow-accent)' : 'none',
        transform: hovered ? 'translateY(-2px)' : 'none',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─── DIVIDER ────────────────────────────────────────────── */
export function Divider({ style }) {
  return <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '16px 0', ...style }} />;
}

/* ─── LABEL STYLE (shared) ───────────────────────────────── */
const labelStyle = {
  fontSize: '11px',
  fontWeight: '500',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
};

/* ─── EMPTY STATE ────────────────────────────────────────── */
export function EmptyState({ icon, title, description, action }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      textAlign: 'center',
      gap: '12px',
    }}>
      {icon && <div style={{ fontSize: '36px', opacity: 0.3 }}>{icon}</div>}
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--text-secondary)' }}>{title}</div>
      {description && <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '280px' }}>{description}</p>}
      {action && <div style={{ marginTop: '8px' }}>{action}</div>}
    </div>
  );
}