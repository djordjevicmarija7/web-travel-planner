import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import shareService from '../services/shareService';
import { Button, Badge, EmptyState } from './ui';

function ShareSection({ tripId }) {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedQr, setSelectedQr] = useState(null);
  const [copied, setCopied] = useState(null);

  useEffect(() => { fetchTokens(); }, [tripId]);

  async function fetchTokens() {
    try { const data = await shareService.getTokens(tripId); setTokens(data); }
    catch { setError('Error loading share links.'); }
  }

  async function handleCreate(accessType) {
    try {
      setLoading(true);
      const token = await shareService.createToken(tripId, accessType);
      setTokens((prev) => [...prev, token]);
    } catch { setError('Error creating link.'); } finally { setLoading(false); }
  }

  async function handleRevoke(tokenId) {
    if (!window.confirm('Deactivate this link?')) return;
    try {
      await shareService.revokeToken(tripId, tokenId);
      setTokens((prev) => prev.filter((t) => t.id !== tokenId));
      if (selectedQr?.id === tokenId) setSelectedQr(null);
    } catch { setError('Error deactivating link.'); }
  }

  function buildShareUrl(token) { return `${window.location.origin}/shared/${token}`; }

  async function copyLink(token) {
    await navigator.clipboard.writeText(buildShareUrl(token.token));
    setCopied(token.id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div>
      {error && <p style={{ color: 'var(--status-cancelled)', marginBottom: '12px', fontSize: '13px' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <Button variant="secondary" onClick={() => handleCreate('view')} disabled={loading}>
          👁 View Link
        </Button>
        <Button variant="accent" onClick={() => handleCreate('edit')} disabled={loading}>
          ✏ Edit Link
        </Button>
      </div>

      {tokens.length === 0 ? (
        <EmptyState icon="🔗" title="No share links" description="Create a view or edit link to share this trip with others." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tokens.map((token) => (
            <div key={token.id} style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)', padding: '16px', overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Badge variant={token.accessType}>{token.accessType.toUpperCase()}</Badge>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Expires: {token.expiresAt?.slice(0, 10)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedQr(selectedQr?.id === token.id ? null : token)}>
                    {selectedQr?.id === token.id ? 'Hide QR' : 'QR Code'}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => copyLink(token)}>
                    {copied === token.id ? '✓ Copied' : 'Copy Link'}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleRevoke(token.id)}>
                    Revoke
                  </Button>
                </div>
              </div>

              {/* URL preview */}
              <div style={{ marginTop: '10px', padding: '8px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {buildShareUrl(token.token)}
              </div>

              {selectedQr?.id === token.id && (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', animation: 'fadeIn 0.2s ease' }}>
                  <div style={{ padding: '16px', background: '#fff', borderRadius: 'var(--radius-md)' }}>
                    <QRCodeSVG value={buildShareUrl(token.token)} size={160} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ShareSection;