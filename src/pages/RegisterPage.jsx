import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/ui';

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const e = {};
    if (!formData.name.trim()) e.name = 'Name is required.';
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
      setSuccessMessage('Account created! Redirecting...');
      setTimeout(() => navigate('/login'), 1500);
    } catch { setServerError('Registration failed. Please try again.'); } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '40px', boxShadow: 'var(--shadow-lg)', animation: 'fadeIn 0.4s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>✈</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '34px', fontWeight: '300', letterSpacing: '0.06em', color: 'var(--accent-primary)' }}>Wanderlust</h1>
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '400', marginBottom: '24px' }}>Create account</h2>

        {serverError && (
          <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '13px', color: 'var(--status-cancelled)', marginBottom: '16px' }}>
            {serverError}
          </div>
        )}
        {successMessage && (
          <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '13px', color: 'var(--status-completed)', marginBottom: '16px' }}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="Your name" error={errors.name} />
          <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" error={errors.email} />
          <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="At least 6 characters" error={errors.password} />
          <Input label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat your password" error={errors.confirmPassword} />
          <Button type="submit" variant="primary" disabled={loading} style={{ width: '100%', marginTop: '8px', padding: '12px' }}>
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