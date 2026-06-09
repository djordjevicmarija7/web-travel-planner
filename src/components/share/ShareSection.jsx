import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import shareService from '../../services/shareService';
import { Button, Badge, EmptyState } from '../ui';
import ConfirmDialog from '../common/ConfirmDialog';
import { generateTripPdf } from '../../utils/generateTripPdf';

function ShareSection({ tripId, trip }) {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedQr, setSelectedQr] = useState(null);
  const [copied, setCopied] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null });

  useEffect(() => {
    fetchTokens();
  }, [tripId]);

  async function fetchTokens() {
    try {
      const data = await shareService.getTokens(tripId);
      setTokens(data);
    } catch {
      setError('Error loading share links.');
    }
  }

  async function handleCreate(accessType) {
    try {
      setLoading(true);
      setError('');
      const token = await shareService.createToken(tripId, accessType);
      setTokens((prev) => [...prev, token]);
    } catch {
      setError('Error creating link.');
    } finally {
      setLoading(false);
    }
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
    } catch {
      setError('Error deactivating link.');
    }
  }

  function handleDownloadPdf() {
    if (!trip) return;
    setPdfLoading(true);
    try {
      generateTripPdf(trip);
    } finally {
      setPdfLoading(false);
    }
  }

function buildShareUrl(token) {
  const base = import.meta.env.VITE_APP_URL || window.location.origin;
  return `${base}/shared/${token}`;
}

  async function copyLink(token) {
    await navigator.clipboard.writeText(buildShareUrl(token.token));
    setCopied(token.id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div style={pageWrap}>
      {error && (
        <div style={errorBanner}>
          <span style={{ fontSize: '14px' }}>⚠</span>
          <span>{error}</span>
        </div>
      )}

      <div style={topGrid}>
        <Panel
          title="Share Links"
          description={
            <>
              Generate a shareable link or QR code. <strong style={{ color: 'var(--text-primary)' }}>View</strong> links
              allow read-only access; <strong style={{ color: 'var(--accent-primary)' }}>Edit</strong> links allow
              modifications.
            </>
          }
        >
          <div style={buttonRow}>
            <Button variant="secondary" onClick={() => handleCreate('view')} disabled={loading}>
              👁 Create View Link
            </Button>
            <Button variant="accent" onClick={() => handleCreate('edit')} disabled={loading}>
              ✏ Create Edit Link
            </Button>
          </div>
        </Panel>

        <Panel
          title="PDF Report"
          description="Download a complete PDF report — destinations, activities, expenses and packing list."
        >
          <Button variant="secondary" onClick={handleDownloadPdf} disabled={pdfLoading}>
            {pdfLoading ? '⏳ Generating...' : '⬇ Download PDF Report'}
          </Button>
        </Panel>
      </div>

      {tokens.length === 0 ? (
        <div style={{ marginTop: '6px' }}>
          <EmptyState
            icon="🔗"
            title="No share links"
            description="Create a view or edit link to share this trip plan with others."
          />
        </div>
      ) : (
        <div style={listWrap}>
          {tokens.map((token) => {
            const isQrOpen = selectedQr?.id === token.id;

            return (
              <div
                key={token.id}
                style={{
                  ...tokenCard,
                  borderColor: isQrOpen ? 'var(--border-default)' : 'var(--border-subtle)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = isQrOpen ? 'var(--border-default)' : 'var(--border-subtle)')
                }
              >
                <div style={tokenHeader}>
                  <div style={tokenMeta}>
                    <Badge variant={token.accessType}>{token.accessType.toUpperCase()}</Badge>
                    {token.expiresAt && <span style={expiresText}>Expires {token.expiresAt?.slice(0, 10)}</span>}
                  </div>

                  <div style={tokenActions}>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedQr(isQrOpen ? null : token)}
                    >
                      {isQrOpen ? 'Hide QR' : '⊞ QR Code'}
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => copyLink(token)}>
                      {copied === token.id ? '✓ Copied' : 'Copy Link'}
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleRevoke(token.id)}>
                      Revoke
                    </Button>
                  </div>
                </div>

                <div style={urlPreview}>{buildShareUrl(token.token)}</div>

                {isQrOpen && (
                  <div style={qrWrap}>
                    <div style={qrFrame}>
                      <QRCodeSVG value={buildShareUrl(token.token)} size={160} />
                    </div>
                    <p style={qrCaption}>Scan to open this trip plan</p>
                  </div>
                )}
              </div>
            );
          })}
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

function Panel({ title, description, children }) {
  return (
    <div style={panelCard}>
      <div style={panelEyebrow}>{title}</div>
      <div style={panelDesc}>{description}</div>
      {children}
    </div>
  );
}

const pageWrap = {
  display: 'grid',
  gap: '16px',
};

const topGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '16px',
};

const panelCard = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-lg)',
  padding: '20px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
};

const panelEyebrow = {
  fontSize: '10px',
  letterSpacing: '0.11em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  marginBottom: '10px',
  fontWeight: '600',
};

const panelDesc = {
  fontSize: '13px',
  color: 'var(--text-secondary)',
  marginBottom: '16px',
  lineHeight: 1.7,
};

const buttonRow = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
};

const errorBanner = {
  background: 'rgba(240,112,112,0.08)',
  border: '1px solid rgba(240,112,112,0.2)',
  borderRadius: 'var(--radius-md)',
  padding: '12px 14px',
  color: 'var(--status-cancelled)',
  fontSize: '13px',
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const listWrap = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  marginTop: '8px',
};

const tokenCard = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-lg)',
  padding: '16px 18px',
  transition: 'border-color var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast)',
  boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
};

const tokenHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap',
};

const tokenMeta = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  flexWrap: 'wrap',
};

const tokenActions = {
  display: 'flex',
  gap: '6px',
  flexWrap: 'wrap',
};

const expiresText = {
  fontSize: '11px',
  color: 'var(--text-muted)',
};

const urlPreview = {
  marginTop: '12px',
  padding: '10px 12px',
  background: 'var(--bg-surface)',
  borderRadius: 'var(--radius-sm)',
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  color: 'var(--text-muted)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  border: '1px solid var(--border-subtle)',
};

const qrWrap = {
  marginTop: '16px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '12px',
  animation: 'fadeIn 0.2s ease',
};

const qrFrame = {
  padding: '16px',
  background: '#fff',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-md)',
  border: '1px solid rgba(0,0,0,0.05)',
};

const qrCaption = {
  fontSize: '12px',
  color: 'var(--text-muted)',
  textAlign: 'center',
  margin: 0,
};

export default ShareSection;