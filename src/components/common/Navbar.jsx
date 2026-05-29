import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Badge } from './ui';

function Navbar({ backTo, backLabel, title, subtitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(12,12,18,0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      position: 'sticky', top: 0, zIndex: 200,
    }}>
      <div style={{
        maxWidth: '1120px', margin: '0 auto',
        padding: '0 28px', height: '62px',
        display: 'flex', alignItems: 'center', gap: '16px',
      }}>
        {/* Back button or Logo */}
        {backTo ? (
          <button onClick={() => navigate(backTo)} style={{
            background: 'none', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)', padding: '6px 13px',
            color: 'var(--text-secondary)', cursor: 'pointer',
            fontSize: '12px', letterSpacing: '0.04em',
            display: 'flex', alignItems: 'center', gap: '5px',
            transition: 'all var(--transition-fast)', flexShrink: 0,
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            ← {backLabel || 'Back'}
          </button>
        ) : (
          <div
            onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '9px', cursor: 'pointer', flexShrink: 0 }}
          >
            <div style={{
              width: '28px', height: '28px', borderRadius: '6px',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-glow))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', color: '#0c0c12',
            }}>✈</div>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: '20px',
              fontWeight: '400', color: 'var(--accent-primary)',
              letterSpacing: '0.04em',
            }}>Wanderlust</span>
          </div>
        )}

        {/* Center title */}
        {title && (
          <div style={{ flex: 1, overflow: 'hidden', paddingLeft: backTo ? '4px' : '0' }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: '400',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              color: 'var(--text-primary)',
            }}>{title}</div>
            {subtitle && (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>{subtitle}</div>
            )}
          </div>
        )}

        {!title && <div style={{ flex: 1 }} />}

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {user && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: '500', color: 'var(--accent-primary)',
                }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{user.name}</span>
                {user.role === 'admin' && <Badge variant="admin">Admin</Badge>}
              </div>
              {user.role === 'admin' && (
                <Button size="sm" variant="accent" onClick={() => navigate('/admin')}>
                  Admin Panel
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={handleLogout}>Sign Out</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
