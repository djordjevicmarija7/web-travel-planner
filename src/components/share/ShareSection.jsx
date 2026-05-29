import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import shareService from '../../services/shareService';
import ConfirmDialog from '../common/ConfirmDialog';
import { Button, Badge, EmptyState } from '../ui';

function ShareSection({ tripId }) {
  const [tokens, setTokens]       = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [selectedQr, setSelectedQr] = useState(null);
  const [copied, setCopied]       = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null });

  useEffect(() => { fetchTokens(); }, [tripId]);

  async function fetchTokens() {
    try {
      const data = await shareService.getTokens(tripId);
      setTokens(data);
    } catch { setError('Error loading share links.'); }
  }

  async function handleCreate(accessType) {
    try {
      setLoading(true); setError('');
      const token = await shareService.createToken(tripId, accessType);
      setTokens((prev) => [...prev, token]);
    } catch { setError('Error creating link.'); } finally { setLoading(false); }
  }

  function handleRevoke(tokenId) {
    setConfirmDialog({ isOpen: true, id: tokenId });
  }

  async function handleRevokeConfirmed() {
    const tokenId = confirmDialog.id;
    setConfirmDialog({ isOpen: false, id: null });
    try {
      await shareService.revokeToken(tripId, tokenId);
      setTokens((prev) => prev.filter((t) => t.id !== tokenId));
      if (selectedQr?.id === tokenId) setSelectedQr(null);
    } catch { setError('Error deactivating link.'); }
  }

  function buildShareUrl(token) {
    return `${window.location.origin}/shared/${token}`;
  }

  async function copyLink(token) {
    await navigator.clipboard.writeText(buildShareUrl(token.token));
    setCopied(token.id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div>
      {error && (
        <div style={{
          background: 'rgba(240,112,112,0.08)', border: '1px solid rgba(240,112,112,0.2)',
          borderRadius: 'var(--radius-md)', padding: '10px 14px',
          color: 'var(--status-cancelled)', fontSize: '13px', marginBottom: '16px',
        }}>{error}</div>
      )}

      <div style={{
        background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: '24px',
      }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
          Generate a shareable link or QR code. <strong style={{ color: 'var(--text-primary)' }}>View</strong> links allow read-only access; <strong style={{ color: 'var(--accent-primary)' }}>Edit</strong> links allow modifications.
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="secondary" onClick={() => handleCreate('view')} disabled={loading}>
            👁 Create View Link
          </Button>
          <Button variant="accent" onClick={() => handleCreate('edit')} disabled={loading}>
            ✏ Create Edit Link
          </Button>
        </div>
      </div>

      {tokens.length === 0 ? (
        <EmptyState
          icon="🔗"
          title="No share links"
          description="Create a view or edit link to share this trip plan with others."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tokens.map((token) => (
            <div key={token.id} style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)', padding: '16px 18px',
              transition: 'border-color var(--transition-fast)',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Badge variant={token.accessType}>{token.accessType.toUpperCase()}</Badge>
                  {token.expiresAt && (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Expires {token.expiresAt?.slice(0, 10)}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedQr(selectedQr?.id === token.id ? null : token)}>
                    {selectedQr?.id === token.id ? 'Hide QR' : '⊞ QR Code'}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => copyLink(token)}>
                    {copied === token.id ? '✓ Copied' : 'Copy Link'}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleRevoke(token.id)}>
                    Revoke
                  </Button>
                </div>
              </div>

              <div style={{
                marginTop: '12px', padding: '8px 12px',
                background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {buildShareUrl(token.token)}
              </div>

              {selectedQr?.id === token.id && (
                <div style={{
                  marginTop: '16px', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '12px', animation: 'fadeIn 0.2s ease',
                }}>
                  <div style={{ padding: '16px', background: '#fff', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}>
                    <QRCodeSVG value={buildShareUrl(token.token)} size={160} />
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Scan to open this trip plan
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Revoke Share Link"
        message="Are you sure you want to deactivate this share link? Anyone using it will lose access."
        confirmText="Revoke"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleRevokeConfirmed}
        onCancel={() => setConfirmDialog({ isOpen: false, id: null })}
      />
    </div>
  );
}

export default ShareSection;