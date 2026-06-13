const infoCard = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-subtle)',
  borderLeft: '2px solid var(--accent-primary)',
  borderRadius: '18px',
  padding: '14px 16px',
};
const infoLabel = {
  fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.09em',
  color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '600',
};
const infoContent = { fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 };

function SharedInfoBlock({ label, children }) {
  return (
    <div style={infoCard}>
      <div style={infoLabel}>{label}</div>
      <div style={infoContent}>{children}</div>
    </div>
  );
}

export default SharedInfoBlock;