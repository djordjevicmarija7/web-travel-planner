function OverviewSection({ title, icon, onViewAll, children }) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
        <span style={{ fontSize: '11px', fontWeight: '500', letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          {icon} {title}
        </span>
        {onViewAll && (
          <button onClick={onViewAll} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: 'var(--accent-primary)', letterSpacing: '0.04em', padding: 0 }}>
            View all →
          </button>
        )}
      </div>
      <div style={{ padding: '4px 18px 10px' }}>{children}</div>
    </div>
  );
}
export default OverviewSection;