import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/ui';

function RegisterPage() {
  const { register }   = useAuth();
  const navigate       = useNavigate();
  const [formData, setFormData]       = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors]           = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  }

  function validate() {
    const e = {};
    if (!formData.name.trim())  e.name = 'Name is required.';
    if (!formData.email.trim()) e.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Invalid email address.';
    if (!formData.password) e.password = 'Password is required.';
    else if (formData.password.length < 6) e.password = 'Password must be at least 6 characters.';
    if (formData.password !== formData.confirmPassword) e.confirmPassword = "Passwords don't match.";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    const ve = validate();
    if (Object.keys(ve).length > 0) { setErrors(ve); return; }
    setErrors({}); setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1800);
    } catch {
      setServerError('Registration failed. The email may already be in use.');
    } finally { setLoading(false); }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      background: `
        radial-gradient(ellipse 70% 50% at 85% 0%, rgba(201,168,76,0.07) 0%, transparent 60%),
        radial-gradient(ellipse 50% 40% at 15% 100%, rgba(91,156,246,0.04) 0%, transparent 60%)
      `,
    }}>
      <div style={{
        width: '100%', maxWidth: '420px',
        background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-2xl)', padding: '44px 40px',
        boxShadow: 'var(--shadow-lg)', animation: 'fadeIn 0.4s ease',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-glow))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', color: '#0c0c12', margin: '0 auto 14px',
            boxShadow: 'var(--shadow-accent)',
          }}>✈</div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: '300',
            letterSpacing: '0.06em', color: 'var(--accent-primary)',
          }}>Wanderlust</h1>
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '400', marginBottom: '24px' }}>
          Create account
        </h2>

        {serverError && (
          <div style={{
            background: 'rgba(240,112,112,0.08)', border: '1px solid rgba(240,112,112,0.22)',
            borderRadius: 'var(--radius-md)', padding: '11px 14px',
            fontSize: '13px', color: 'var(--status-cancelled)', marginBottom: '18px',
          }}>
            ⚠ {serverError}
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(78,201,148,0.08)', border: '1px solid rgba(78,201,148,0.22)',
            borderRadius: 'var(--radius-md)', padding: '11px 14px',
            fontSize: '13px', color: 'var(--status-completed)', marginBottom: '18px',
          }}>
            ✓ Account created! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="Your name" error={errors.name} />
          <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" error={errors.email} />
          <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="At least 6 characters" error={errors.password} />
          <Input label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat your password" error={errors.confirmPassword} />
          <Button type="submit" variant="primary" disabled={loading || success} style={{ width: '100%', marginTop: '6px', padding: '12px' }}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: '500' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
