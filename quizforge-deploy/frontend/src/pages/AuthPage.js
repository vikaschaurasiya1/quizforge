import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', instructorCode: '' });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      let user;
      if (mode === 'login') {
        user = await login(form.email, form.password);
      } else {
        user = await register(form.name, form.email, form.password, form.role, form.instructorCode);
      }
      toast.success(`Welcome, ${user.name}!`);
      navigate(user.role === 'instructor' ? '/instructor' : '/student');
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
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {mode === 'login' ? 'Sign in to continue' : 'Create your account'}
          </p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', background: 'var(--bg3)', borderRadius: '8px', padding: '4px', marginBottom: '1.8rem' }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: '0.5rem', borderRadius: '6px', border: 'none',
                background: mode === m ? 'var(--accent)' : 'transparent',
                color: mode === m ? '#0d0f14' : 'var(--text-muted)',
                fontWeight: mode === m ? 700 : 400,
                fontSize: '0.88rem', textTransform: 'capitalize',
                transition: 'all 0.2s', cursor: 'pointer'
              }}>{m}</button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="form-group">
                <label>Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
              </div>
            )}

            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="minimum 6 characters" required minLength={6} />
            </div>

            {mode === 'login' && (
              <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '1rem' }}>
                <Link to="/forgot-password" style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>
                  Forgot password?
                </Link>
              </div>
            )}

            {mode === 'register' && (
              <>
                <div className="form-group">
                  <label>I am a</label>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {['student', 'instructor'].map(r => (
                      <label key={r} style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '0.5rem', padding: '0.7rem',
                        background: form.role === r ? 'rgba(110,231,183,0.08)' : 'var(--bg3)',
                        border: `1px solid ${form.role === r ? 'var(--accent)' : 'var(--border)'}`,
                        borderRadius: '8px', cursor: 'pointer',
                        fontSize: '0.9rem', textTransform: 'capitalize',
                        color: form.role === r ? 'var(--accent)' : 'var(--text-muted)',
                        transition: 'all 0.2s'
                      }}>
                        <input type="radio" name="role" value={r}
                          checked={form.role === r} onChange={handleChange}
                          style={{ width: 'auto', accentColor: 'var(--accent)' }} />
                        {r}
                      </label>
                    ))}
                  </div>
                </div>

                {form.role === 'instructor' && (
                  <div className="form-group fade-up">
                    <label>Instructor Code 🔐</label>
                    <input name="instructorCode" type="password" value={form.instructorCode}
                      onChange={handleChange} placeholder="Enter secret instructor code" required />
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                      Contact the administrator to get the instructor code.
                    </p>
                  </div>
                )}
              </>
            )}

            <button type="submit" className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.85rem' }}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>
            {mode === 'login' ? 'Register' : 'Sign In'}
          </span>
        </p>
      </div>
    </div>
  );
}
