function LegendItem({ color, border, label, dot }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
      {dot
        ? <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: border }} />
        : <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: color, border: `1px solid ${border}` }} />
      }
      {label}
    </div>
  );
}

export default LegendItem;