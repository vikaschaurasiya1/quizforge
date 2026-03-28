import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ResultDetail() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/results/${id}`)
      .then(({ data }) => setResult(data.data))
      .catch(() => toast.error('Result not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner" />;
  if (!result) return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Result not found</div>;

  const pct = result.percentage;
  const grade = pct >= 90 ? { label: 'Excellent', color: 'var(--accent)' }
    : pct >= 75 ? { label: 'Good', color: 'var(--accent2)' }
    : pct >= 60 ? { label: 'Pass', color: 'var(--warning)' }
    : { label: 'Fail', color: 'var(--danger)' };

  const fmtTime = (s) => s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/student/results" className="btn btn-secondary btn-sm">← My Results</Link>
        <h1 style={{ fontSize: '1.4rem' }}>Quiz Results</h1>
      </div>

      <div className="card fade-up" style={{
        textAlign: 'center', padding: '2.5rem', marginBottom: '2rem',
        background: 'linear-gradient(135deg, var(--bg2), var(--bg3))',
        borderColor: grade.color + '33'
      }}>
        <div style={{ fontSize: '4rem', fontFamily: 'Syne,sans-serif', fontWeight: 800, color: grade.color, marginBottom: '0.5rem' }}>
          {pct}%
        </div>
        <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{result.quiz?.title}</div>
        <span style={{
          display: 'inline-block', padding: '0.3rem 1rem', borderRadius: '100px',
          background: grade.color + '20', color: grade.color,
          fontWeight: 700, fontSize: '0.9rem', marginBottom: '1.5rem'
        }}>
          {grade.label}
        </span>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Score', value: `${result.score} / ${result.totalPoints}` },
            { label: 'Correct', value: result.answers?.filter(a => a.isCorrect).length || 0 },
            { label: 'Time Taken', value: fmtTime(result.timeTaken) },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: '1.3rem', fontFamily: 'Syne,sans-serif', fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {result.quiz?.questions?.length > 0 && (
        <>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Question Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {result.quiz.questions.map((q, i) => {
              const ans = result.answers?.[i];
              const correct = ans?.isCorrect;
              return (
                <div key={i} className="card" style={{
                  padding: '1.2rem 1.5rem',
                  borderColor: correct ? 'rgba(110,231,183,0.2)' : 'rgba(248,113,113,0.2)'
                }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <span style={{
                      width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: correct ? 'rgba(110,231,183,0.15)' : 'rgba(248,113,113,0.15)',
                      color: correct ? 'var(--accent)' : 'var(--danger)',
                      fontSize: '0.85rem', fontWeight: 700
                    }}>
                      {correct ? '✓' : '✗'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <p style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>{q.questionText}</p>
                      <div style={{ fontSize: '0.82rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <span style={{ color: 'var(--text-muted)' }}>
                          Your answer: <span style={{ color: ans?.selectedAnswer >= 0 ? 'var(--text)' : 'var(--danger)' }}>
                            {ans?.selectedAnswer >= 0 ? q.options[ans.selectedAnswer] : 'Not answered'}
                          </span>
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          Correct: <span style={{ color: 'var(--accent)' }}>{q.options[q.correctAnswer]}</span>
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>+{ans?.pointsEarned || 0}/{q.points} pts</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link to="/student" className="btn btn-secondary">Browse More Quizzes</Link>
        <Link to="/student/results" className="btn btn-primary">All My Results</Link>
      </div>
    </div>
  );
}
