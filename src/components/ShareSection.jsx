import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import shareService from '../services/shareService';

function ShareSection({ tripId }) {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedQr, setSelectedQr] = useState(null);

  useEffect(() => {
    fetchTokens();
  }, [tripId]);

  async function fetchTokens() {
    try {
      const data = await shareService.getTokens(tripId);
      setTokens(data);
    } catch {
      setError('Error loading links.');
    }
  }

  async function handleCreate(accessType) {
    try {
      setLoading(true);
      const token = await shareService.createToken(tripId, accessType);
      setTokens((prev) => [...prev, token]);
    } catch {
      setError('Error creating link.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke(tokenId) {
    if (!window.confirm('Deactivate this link?')) return;
    try {
      await shareService.revokeToken(tripId, tokenId);
      setTokens((prev) => prev.filter((t) => t.id !== tokenId));
      if (selectedQr?.id === tokenId) setSelectedQr(null);
    } catch {
      setError('Error deactivating link.');
    }
  }

  function buildShareUrl(token) {
    return `${window.location.origin}/shared/${token}`;
  }

  return (
    <div>
      <h3>Trip sharing</h3>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <button
          onClick={() => handleCreate('view')}
          disabled={loading}
        >
          + View link (VIEW)
        </button>
        <button
          onClick={() => handleCreate('edit')}
          disabled={loading}
        >
          + Edit link (EDIT)
        </button>
      </div>

      {tokens.length === 0 ? (
        <p>No active sharing links.</p>
      ) : (
        <div>
          {tokens.map((token) => (
            <div
              key={token.id}
              style={{
                border: '1px solid #ddd',
                padding: '12px',
                marginBottom: '8px',
                borderRadius: '6px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{
                    background: token.accessType === 'edit'
                      ? '#FFF3CD' : '#D1ECF1',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {token.accessType.toUpperCase()}
                  </span>
                  <span style={{ marginLeft: '10px', fontSize: '13px', color: '#666' }}>
                    Expires: {token.expiresAt?.slice(0, 10)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() =>
                    setSelectedQr(
                      selectedQr?.id === token.id ? null : token
                    )
                  }>
                    {selectedQr?.id === token.id
                      ? 'Hide QR'
                      : 'Show QR'}
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(
                      buildShareUrl(token.token)
                    )}
                  >
                    Copy link
                  </button>
                  <button onClick={() => handleRevoke(token.id)}>
                    Deactivate
                  </button>
                </div>
              </div>

              {/* QR code */}
              {selectedQr?.id === token.id && (
                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                  <QRCodeSVG
                    value={buildShareUrl(token.token)}
                    size={180}
                  />
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>
                    {buildShareUrl(token.token)}
                  </p>
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