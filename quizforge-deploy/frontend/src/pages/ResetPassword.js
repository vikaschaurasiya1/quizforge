import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (password !== confirm) {
      return toast.error('Passwords do not match');
    }
    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setDone(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.');
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
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Set your new password</p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {done ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <h3 style={{ marginBottom: '0.75rem' }}>Password Reset!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Your password has been updated successfully. Redirecting to login...
              </p>
            </div>
          ) : (
            <>
              <h3 style={{ marginBottom: '0.5rem' }}>New Password</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Enter your new password below.
              </p>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="minimum 6 characters"
                    required
                    minLength={6}
                  />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="re-enter your password"
                    required
                  />
                  {confirm && password !== confirm && (
                    <p className="error-msg">Passwords do not match</p>
                  )}
                </div>
                <button type="submit" className="btn btn-primary"
                  disabled={loading}
                  style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
