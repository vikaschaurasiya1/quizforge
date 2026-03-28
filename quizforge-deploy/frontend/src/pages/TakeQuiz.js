import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const startTime = useRef(Date.now());

  const submitQuiz = useCallback(async (finalAnswers) => {
    if (submitting) return;
    setSubmitting(true);
    const timeTaken = Math.floor((Date.now() - startTime.current) / 1000);
    try {
      const answerArray = quiz.questions.map((_, i) =>
        finalAnswers[i] !== undefined ? finalAnswers[i] : -1
      );
      const { data } = await api.post('/results', { quizId: id, answers: answerArray, timeTaken });
      toast.success('Quiz submitted!');
      navigate(`/student/result/${data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
      setSubmitting(false);
    }
  }, [submitting, quiz, id, navigate]);

  useEffect(() => {
    api.get(`/quizzes/${id}`).then(({ data }) => {
      setQuiz(data.data);
      if (data.data.timeLimit > 0) setTimeLeft(data.data.timeLimit * 60);
      setLoading(false);
    }).catch(() => { toast.error('Quiz not found'); navigate('/student'); });
  }, [id, navigate]);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) { submitQuiz(answers); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, answers, submitQuiz]);

  const selectAnswer = (qi, oi) => setAnswers(a => ({ ...a, [qi]: oi }));

  const handleSubmit = () => {
    const unanswered = quiz.questions.length - Object.keys(answers).length;
    if (unanswered > 0) {
      if (!window.confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
    }
    submitQuiz(answers);
  };

  if (loading || !quiz) return <div className="spinner" />;

  const q = quiz.questions[current];
  const progress = ((current + 1) / quiz.questions.length) * 100;
  const answered = Object.keys(answers).length;
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem' }}>{quiz.title}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{answered}/{quiz.questions.length} answered</p>
        </div>
        {timeLeft !== null && (
          <div style={{
            background: timeLeft < 60 ? 'rgba(248,113,113,0.15)' : 'var(--bg3)',
            border: `1px solid ${timeLeft < 60 ? 'var(--danger)' : 'var(--border)'}`,
            borderRadius: '8px', padding: '0.5rem 1rem',
            fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '1.1rem',
            color: timeLeft < 60 ? 'var(--danger)' : 'var(--accent)'
          }}>
            ⏱ {fmt(timeLeft)}
          </div>
        )}
      </div>

      <div style={{ height: '4px', background: 'var(--bg3)', borderRadius: '2px', marginBottom: '2rem' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent)', borderRadius: '2px', transition: 'width 0.3s ease' }} />
      </div>

      <div className="card fade-up" key={current} style={{ marginBottom: '1.5rem', padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{ color: 'var(--accent)', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '0.85rem' }}>
            Question {current + 1} of {quiz.questions.length}
          </span>
          <p style={{ fontSize: '1.1rem', marginTop: '0.5rem', lineHeight: 1.5 }}>{q.questionText}</p>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{q.points} point{q.points !== 1 ? 's' : ''}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {q.options.map((opt, oi) => {
            const selected = answers[current] === oi;
            return (
              <button key={oi} onClick={() => selectAnswer(current, oi)} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.9rem 1.2rem',
                background: selected ? 'rgba(110,231,183,0.1)' : 'var(--bg3)',
                border: `2px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '10px', color: selected ? 'var(--accent)' : 'var(--text)',
                textAlign: 'left', fontSize: '0.95rem', transition: 'all 0.15s', cursor: 'pointer'
              }}>
                <span style={{
                  width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: selected ? 'var(--accent)' : 'var(--bg2)',
                  color: selected ? '#0d0f14' : 'var(--text-muted)',
                  fontSize: '0.8rem', fontWeight: 700
                }}>
                  {String.fromCharCode(65 + oi)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-secondary" onClick={() => setCurrent(c => c - 1)} disabled={current === 0}>← Previous</button>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {quiz.questions.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: i === current ? 'var(--accent)' : answers[i] !== undefined ? 'rgba(110,231,183,0.2)' : 'var(--bg3)',
              border: `1px solid ${i === current ? 'var(--accent)' : answers[i] !== undefined ? 'var(--accent)' : 'var(--border)'}`,
              color: i === current ? '#0d0f14' : 'var(--text)',
              fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.15s', cursor: 'pointer'
            }}>
              {i + 1}
            </button>
          ))}
        </div>
        {current < quiz.questions.length - 1 ? (
          <button className="btn btn-secondary" onClick={() => setCurrent(c => c + 1)}>Next →</button>
        ) : (
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>
    </div>
  );
}
