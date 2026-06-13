function InfoBlock({ label, children }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      padding: '18px',
    }}>
      <div style={{
        fontSize: '10px',
        textTransform: 'uppercase',
        letterSpacing: '0.09em',
        color: 'var(--text-muted)',
        marginBottom: '8px',
      }}>
        {label}
      </div>
      <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
        {children}
      </div>
    </div>
  );
}

export default InfoBlock;