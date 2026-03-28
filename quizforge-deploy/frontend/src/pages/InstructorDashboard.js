import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuizzes } from '../hooks/useQuizzes';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const { quizzes, loading, deleteQuiz, togglePublish } = useQuizzes();
  const [analyticsMap, setAnalyticsMap] = useState({});
  const [loadingAnalytics, setLoadingAnalytics] = useState({});

  const fetchAnalytics = async (quizId) => {
    if (analyticsMap[quizId]) return;
    setLoadingAnalytics(p => ({ ...p, [quizId]: true }));
    try {
      const { data } = await api.get(`/results/quiz/${quizId}`);
      setAnalyticsMap(p => ({ ...p, [quizId]: data.analytics }));
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoadingAnalytics(p => ({ ...p, [quizId]: false }));
    }
  };

  if (loading) return <div className="spinner" />;

  const published = quizzes.filter(q => q.isPublished).length;
  const totalQ = quizzes.reduce((s, q) => s + (q.questions?.length || 0), 0);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>
            Welcome back, {user?.name.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your quizzes and track student performance</p>
        </div>
        <Link to="/instructor/create" className="btn btn-primary">+ New Quiz</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Total Quizzes', value: quizzes.length, color: 'var(--accent2)' },
          { label: 'Published', value: published, color: 'var(--accent)' },
          { label: 'Total Questions', value: totalQ, color: 'var(--warning)' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.2rem', fontFamily: 'Syne,sans-serif', fontWeight: 800, color: stat.color }}>
              {stat.value}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        Your Quizzes
      </h2>

      {quizzes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No quizzes yet</p>
          <Link to="/instructor/create" className="btn btn-primary">Create your first quiz</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {quizzes.map(quiz => (
            <div key={quiz._id} className="card" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                    <h3 style={{ fontSize: '1.05rem' }}>{quiz.title}</h3>
                    <span className={`badge ${quiz.isPublished ? 'badge-green' : 'badge-yellow'}`}>
                      {quiz.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  {quiz.description && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '0.5rem' }}>{quiz.description}</p>
                  )}
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <span>📝 {quiz.questions?.length || 0} questions</span>
                    <span>⭐ {quiz.totalPoints} pts</span>
                    {quiz.timeLimit > 0 && <span>⏱ {quiz.timeLimit} min</span>}
                    <span>📅 {new Date(quiz.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => fetchAnalytics(quiz._id)}>
                    {loadingAnalytics[quiz._id] ? '...' : '📊 Analytics'}
                  </button>
                  <Link to={`/instructor/edit/${quiz._id}`} className="btn btn-secondary btn-sm">✏️ Edit</Link>
                  <button className="btn btn-secondary btn-sm" onClick={() => togglePublish(quiz._id)}>
                    {quiz.isPublished ? '⬇️ Unpublish' : '🚀 Publish'}
                  </button>
                  <button className="btn btn-danger btn-sm"
                    onClick={() => { if (window.confirm('Delete this quiz?')) deleteQuiz(quiz._id); }}>
                    🗑️
                  </button>
                </div>
              </div>

              {analyticsMap[quiz._id] && (
                <div style={{
                  marginTop: '1rem', paddingTop: '1rem',
                  borderTop: '1px solid var(--border)',
                  display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem'
                }}>
                  {[
                    { label: 'Submissions', value: analyticsMap[quiz._id].totalSubmissions },
                    { label: 'Avg Score', value: `${analyticsMap[quiz._id].averageScore}%` },
                    { label: 'Highest', value: `${analyticsMap[quiz._id].highestScore}%` },
                    { label: 'Lowest', value: `${analyticsMap[quiz._id].lowestScore}%` },
                    { label: 'Pass Rate', value: `${analyticsMap[quiz._id].passingRate}%` },
                  ].map(s => (
                    <div key={s.label} style={{
                      background: 'var(--bg3)', borderRadius: '8px',
                      padding: '0.6rem 0.8rem', textAlign: 'center'
                    }}>
                      <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent)' }}>
                        {s.value}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
