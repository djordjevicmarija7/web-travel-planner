import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/ui';
import {UserRole} from '../enums/user/UserRole';

function LoginPage() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData]     = useState({ email: '', password: '' });
  const [errors, setErrors]         = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading]       = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  }

  function validate() {
    const e = {};
    if (!formData.email.trim()) e.email = 'Email is required.';
    if (!formData.password)     e.password = 'Password is required.';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    const ve = validate();
    if (Object.keys(ve).length > 0) { setErrors(ve); return; }
    setErrors({}); setLoading(true);
    try {
      const loggedUser = await login(formData.email, formData.password);
      const redirect = searchParams.get('redirect');
      if (redirect) {
        navigate(redirect);
      } else {
        navigate(loggedUser?.role === UserRole.admin ? '/admin' : '/dashboard');
      }
    } catch {
      setServerError('Incorrect email or password.');
    } finally { setLoading(false); }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      background: `
        radial-gradient(ellipse 70% 50% at 15% 0%, rgba(201,168,76,0.08) 0%, transparent 60%),
        radial-gradient(ellipse 60% 40% at 85% 100%, rgba(91,156,246,0.05) 0%, transparent 60%)
      `,
    }}>
      <div style={{
        width: '100%', maxWidth: '400px',
        background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-2xl)', padding: '44px 40px',
        boxShadow: 'var(--shadow-lg)', animation: 'fadeIn 0.4s ease',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-glow))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', color: '#0c0c12', margin: '0 auto 14px',
            boxShadow: 'var(--shadow-accent)',
          }}>✈</div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: '300',
            letterSpacing: '0.06em', color: 'var(--accent-primary)', lineHeight: 1,
          }}>Wanderlust</h1>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Travel Planning
          </p>
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '400', marginBottom: '24px' }}>
          Welcome back
        </h2>

        {serverError && (
          <div style={{
            background: 'rgba(240,112,112,0.08)', border: '1px solid rgba(240,112,112,0.22)',
            borderRadius: 'var(--radius-md)', padding: '11px 14px',
            fontSize: '13px', color: 'var(--status-cancelled)', marginBottom: '18px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span>⚠</span> {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            error={errors.email}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            error={errors.password}
          />
          <Button type="submit" variant="primary" disabled={loading} style={{ width: '100%', marginTop: '6px', padding: '12px' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
          New here?{' '}
          <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: '500' }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;