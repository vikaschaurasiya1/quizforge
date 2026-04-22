import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '40px 40px', pointerEvents: 'none'
      }} />

      <div className="fade-up" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px', padding: '1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>
            Quiz<span style={{ color: 'var(--accent)' }}>Forge</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Reset your password</p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
              <h3 style={{ marginBottom: '0.75rem' }}>Check your email!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                We sent a password reset link to <strong style={{ color: 'var(--text)' }}>{email}</strong>.
                It expires in 15 minutes.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Check your spam folder if you don't see it.
              </p>
            </div>
          ) : (
            <>
              <h3 style={{ marginBottom: '0.5rem' }}>Forgot Password?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Enter your email and we'll send you a reset link.
              </p>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary"
                  disabled={loading}
                  style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Remember your password?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
