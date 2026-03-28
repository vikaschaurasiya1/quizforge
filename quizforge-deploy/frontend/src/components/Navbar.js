import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const linkStyle = { color: 'var(--text-muted)', fontSize: '0.9rem', transition: 'color 0.2s' };
  const hover = { onMouseOver: e => e.target.style.color = 'var(--text)', onMouseOut: e => e.target.style.color = 'var(--text-muted)' };

  return (
    <nav style={{
      background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
      padding: '0 2rem', height: '64px', display: 'flex',
      alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 100
    }}>
      <Link to="/" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.2rem' }}>
        Quiz<span style={{ color: 'var(--accent)' }}>Forge</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {user?.role === 'instructor' ? (
          <>
            <Link to="/instructor" style={linkStyle} {...hover}>Dashboard</Link>
            <Link to="/instructor/create" style={linkStyle} {...hover}>Create Quiz</Link>
            <Link to="/leaderboard" style={linkStyle} {...hover}>🏆 Leaderboard</Link>
          </>
        ) : (
          <>
            <Link to="/student" style={linkStyle} {...hover}>Quizzes</Link>
            <Link to="/student/results" style={linkStyle} {...hover}>My Results</Link>
            <Link to="/leaderboard" style={linkStyle} {...hover}>🏆 Leaderboard</Link>
          </>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{
            background: 'var(--bg3)', border: '1px solid var(--border)',
            borderRadius: '100px', padding: '0.3rem 0.8rem',
            fontSize: '0.8rem', color: 'var(--text-muted)'
          }}>
            {user?.name} · <span style={{ color: user?.role === 'instructor' ? 'var(--accent2)' : 'var(--accent)' }}>
              {user?.role}
            </span>
          </span>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}
// Footer component exported for use in App.js
export function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--bg2)',
      padding: '1.2rem 2rem',
      textAlign: 'center',
      color: 'var(--text-muted)',
      fontSize: '0.82rem',
      marginTop: 'auto'
    }}>
      © 2025 <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Vikas Chaurasiya</span> — QuizForge. All rights reserved. &nbsp;|&nbsp; Built with ❤️ using MERN Stack
    </footer>
  );
}
