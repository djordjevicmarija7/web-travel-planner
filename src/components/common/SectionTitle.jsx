function SectionTitle({ title, subtitle }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '300', marginBottom: '4px' }}>
        {title}
      </h3>
      {subtitle && <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{subtitle}</p>}
    </div>
  );
}

export default SectionTitle;