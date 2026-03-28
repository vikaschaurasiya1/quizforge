import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function MyResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/results/my')
      .then(({ data }) => setResults(data.data))
      .catch(() => toast.error('Failed to load results'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  const avg = results.length ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length) : 0;
  const best = results.length ? Math.max(...results.map(r => r.percentage)) : 0;
  const passed = results.filter(r => r.percentage >= 60).length;

  const gradeColor = (p) =>
    p >= 90 ? 'var(--accent)' : p >= 75 ? 'var(--accent2)' : p >= 60 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>My Results</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Your quiz history and performance</p>

      {results.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Attempted', value: results.length },
            { label: 'Avg Score', value: `${avg}%` },
            { label: 'Best Score', value: `${best}%` },
            { label: 'Passed', value: passed },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontFamily: 'Syne,sans-serif', fontWeight: 800, color: 'var(--accent)' }}>
                {s.value}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.2rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No quizzes attempted yet</p>
          <Link to="/student" className="btn btn-primary">Browse Quizzes</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {results.map(r => (
            <div key={r._id} className="card fade-up" style={{
              display: 'flex', alignItems: 'center', gap: '1.5rem',
              padding: '1.2rem 1.5rem', flexWrap: 'wrap'
            }}>
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: gradeColor(r.percentage) + '15',
                border: `2px solid ${gradeColor(r.percentage)}`,
                fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1rem',
                color: gradeColor(r.percentage)
              }}>
                {r.percentage}%
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.3rem' }}>{r.quiz?.title || 'Quiz'}</h3>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  <span>Score: {r.score}/{r.totalPoints}</span>
                  <span>📅 {new Date(r.submittedAt).toLocaleDateString()}</span>
                  {r.timeTaken > 0 && <span>⏱ {Math.floor(r.timeTaken / 60)}m {r.timeTaken % 60}s</span>}
                </div>
              </div>
              <Link to={`/student/result/${r._id}`} className="btn btn-secondary btn-sm">View Details →</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
