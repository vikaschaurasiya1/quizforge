import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const medals = ['🥇', '🥈', '🥉'];
const gradeColor = (p) =>
  p >= 90 ? 'var(--accent)' : p >= 75 ? 'var(--accent2)' : p >= 60 ? 'var(--warning)' : 'var(--danger)';

export default function Leaderboard() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leaderboard')
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load leaderboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  const myRank = data.findIndex(s => s.email === user?.email) + 1;
  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>🏆 Leaderboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Top performing students across all quizzes</p>
        {myRank > 0 && (
          <div style={{
            display: 'inline-block', marginTop: '0.75rem',
            background: 'rgba(110,231,183,0.1)', border: '1px solid var(--accent)',
            borderRadius: '100px', padding: '0.4rem 1.2rem',
            color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 600
          }}>
            Your Rank: #{myRank}
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</p>
          <p style={{ color: 'var(--text-muted)' }}>No results yet. Be the first to take a quiz!</p>
        </div>
      ) : (
        <>
          {top3.length >= 1 && (
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
              gap: '1rem', marginBottom: '2rem'
            }}>
              {[top3[1], top3[0], top3[2]].map((s, i) => {
                if (!s) return <div key={i} style={{ flex: 1 }} />;
                const realRank = i === 1 ? 1 : i === 0 ? 2 : 3;
                const heights = { 1: '160px', 2: '130px', 3: '110px' };
                return (
                  <div key={s._id} style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
                  }}>
                    <div style={{ fontSize: '1.5rem' }}>{medals[realRank - 1]}</div>
                    <div style={{
                      width: '52px', height: '52px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: gradeColor(s.averageScore) + '20',
                      border: `2px solid ${gradeColor(s.averageScore)}`,
                      fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.1rem',
                      color: gradeColor(s.averageScore)
                    }}>
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', textAlign: 'center' }}>
                      {s.name.split(' ')[0]}
                    </div>
                    <div style={{ color: gradeColor(s.averageScore), fontWeight: 800, fontFamily: 'Syne,sans-serif' }}>
                      {s.averageScore}%
                    </div>
                    <div style={{
                      width: '100%', background: gradeColor(s.averageScore) + '20',
                      border: `1px solid ${gradeColor(s.averageScore)}33`,
                      borderRadius: '8px 8px 0 0', height: heights[realRank],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.5rem'
                    }}>
                      #{realRank}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '50px 1fr 80px 80px 80px 90px',
              padding: '0.8rem 1.5rem', background: 'var(--bg3)',
              borderBottom: '1px solid var(--border)',
              fontSize: '0.75rem', color: 'var(--text-muted)',
              fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>
              <span>Rank</span>
              <span>Student</span>
              <span style={{ textAlign: 'center' }}>Quizzes</span>
              <span style={{ textAlign: 'center' }}>Avg</span>
              <span style={{ textAlign: 'center' }}>Best</span>
              <span style={{ textAlign: 'center' }}>Points</span>
            </div>

            {data.map((s, i) => {
              const isMe = s.email === user?.email;
              return (
                <div key={s._id} style={{
                  display: 'grid', gridTemplateColumns: '50px 1fr 80px 80px 80px 90px',
                  padding: '1rem 1.5rem', alignItems: 'center',
                  borderBottom: '1px solid var(--border)',
                  background: isMe ? 'rgba(110,231,183,0.04)' : 'transparent',
                  transition: 'background 0.15s', cursor: 'default'
                }}>
                  <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800 }}>
                    {i < 3 ? medals[i] : `#${i + 1}`}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: gradeColor(s.averageScore) + '15',
                      color: gradeColor(s.averageScore),
                      fontWeight: 700, fontSize: '0.85rem'
                    }}>
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      {s.name} {isMe && <span style={{ color: 'var(--accent)', fontSize: '0.75rem' }}>(You)</span>}
                    </div>
                  </div>
                  <span style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{s.totalQuizzes}</span>
                  <span style={{ textAlign: 'center', fontWeight: 700, color: gradeColor(s.averageScore) }}>{s.averageScore}%</span>
                  <span style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{s.bestScore}%</span>
                  <span style={{ textAlign: 'center', color: 'var(--accent2)', fontWeight: 600 }}>{s.totalPoints}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
