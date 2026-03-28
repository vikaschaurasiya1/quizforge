import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [attempted, setAttempted] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [quizRes, resultRes] = await Promise.all([
          api.get('/quizzes'),
          api.get('/results/my')
        ]);
        setQuizzes(quizRes.data.data);
        setAttempted(new Set(resultRes.data.data.map(r => r.quiz._id)));
      } catch {
        toast.error('Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="spinner" />;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>Available Quizzes</h1>
        <p style={{ color: 'var(--text-muted)' }}>Hi {user?.name.split(' ')[0]}, choose a quiz to get started</p>
      </div>

      {quizzes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No quizzes published yet. Check back soon!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {quizzes.map(quiz => {
            const done = attempted.has(quiz._id);
            return (
              <div key={quiz._id} className="card fade-up" style={{
                display: 'flex', flexDirection: 'column',
                borderColor: done ? 'rgba(110,231,183,0.2)' : undefined
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                    <h3 style={{ fontSize: '1.05rem', lineHeight: 1.3 }}>{quiz.title}</h3>
                    {done && <span className="badge badge-green">✓ Done</span>}
                  </div>
                  {quiz.description && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '0.8rem' }}>
                      {quiz.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    <span>📝 {quiz.questions?.length || 0} questions</span>
                    <span>⭐ {quiz.totalPoints} pts</span>
                    {quiz.timeLimit > 0 && <span>⏱ {quiz.timeLimit} min</span>}
                    {quiz.instructor && <span>👤 {quiz.instructor.name}</span>}
                  </div>
                </div>
                <Link
                  to={done ? '/student/results' : `/student/quiz/${quiz._id}`}
                  className={`btn ${done ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ justifyContent: 'center' }}
                >
                  {done ? 'View Result' : 'Start Quiz →'}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}