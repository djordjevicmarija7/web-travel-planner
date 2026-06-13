const sectionBlock = { marginBottom: '30px' };
const sectionHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '14px' };
const sectionLabel = { fontSize: '10px', fontWeight: '600', letterSpacing: '0.11em', textTransform: 'uppercase', color: 'var(--text-muted)' };

function SharedSection({ label, action, children }) {
  return (
    <section style={sectionBlock}>
      <div style={sectionHeader}>
        <div style={sectionLabel}>{label}</div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default SharedSection;