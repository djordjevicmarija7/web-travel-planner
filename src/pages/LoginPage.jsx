import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/ui';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const e = {};
    if (!formData.email.trim()) e.email = 'Email is required.';
    if (!formData.password) e.password = 'Password is required.';
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
      if (loggedUser?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch { setServerError('Incorrect email or password.'); } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '40px', boxShadow: 'var(--shadow-lg)', animation: 'fadeIn 0.4s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>✈</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '34px', fontWeight: '300', letterSpacing: '0.06em', color: 'var(--accent-primary)' }}>
            Wanderlust
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Travel Planning</p>
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '400', marginBottom: '24px' }}>Welcome back</h2>

        {serverError && (
          <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '13px', color: 'var(--status-cancelled)', marginBottom: '16px' }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange}
            placeholder="you@example.com" error={errors.email} />
          <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange}
            placeholder="••••••••" error={errors.password} />
          <Button type="submit" variant="primary" disabled={loading} style={{ width: '100%', marginTop: '8px', padding: '12px' }}>
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