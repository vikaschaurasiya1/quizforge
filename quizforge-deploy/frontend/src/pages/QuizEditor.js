import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const emptyQuestion = () => ({
  questionText: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
  points: 1
});

export default function QuizEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: '', description: '', timeLimit: 0, isPublished: false, questions: [emptyQuestion()]
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/quizzes/${id}`).then(({ data }) => {
      setForm({
        title: data.data.title,
        description: data.data.description || '',
        timeLimit: data.data.timeLimit || 0,
        isPublished: data.data.isPublished,
        questions: data.data.questions.length ? data.data.questions : [emptyQuestion()]
      });
      setLoading(false);
    }).catch(() => { toast.error('Quiz not found'); navigate('/instructor'); });
  }, [id, isEdit, navigate]);

  const handleField = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleQuestion = (qi, field, value) => {
    setForm(f => {
      const qs = [...f.questions];
      qs[qi] = { ...qs[qi], [field]: value };
      return { ...f, questions: qs };
    });
  };

  const handleOption = (qi, oi, value) => {
    setForm(f => {
      const qs = [...f.questions];
      const opts = [...qs[qi].options];
      opts[oi] = value;
      qs[qi] = { ...qs[qi], options: opts };
      return { ...f, questions: qs };
    });
  };

  const addQuestion = () => setForm(f => ({ ...f, questions: [...f.questions, emptyQuestion()] }));
  const removeQuestion = (qi) => {
    if (form.questions.length === 1) return toast.error('Need at least 1 question');
    setForm(f => ({ ...f, questions: f.questions.filter((_, i) => i !== qi) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation
    for (let i = 0; i < form.questions.length; i++) {
      const q = form.questions[i];
      if (!q.questionText.trim()) return toast.error(`Question ${i + 1} needs text`);
      if (q.options.some(o => !o.trim())) return toast.error(`All options in Q${i + 1} are required`);
    }
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/quizzes/${id}`, form);
        toast.success('Quiz updated!');
      } else {
        await api.post('/quizzes', form);
        toast.success('Quiz created!');
      }
      navigate('/instructor');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/instructor')}>← Back</button>
        <h1 style={{ fontSize: '1.6rem' }}>{isEdit ? 'Edit Quiz' : 'Create New Quiz'}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Meta */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.2rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quiz Details</h3>
          <div className="form-group">
            <label>Title *</label>
            <input value={form.title} onChange={e => handleField('title', e.target.value)}
              placeholder="e.g. JavaScript Fundamentals" required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={e => handleField('description', e.target.value)}
              placeholder="Brief description of this quiz..." rows={2}
              style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Time Limit (minutes, 0 = no limit)</label>
              <input type="number" min={0} value={form.timeLimit}
                onChange={e => handleField('timeLimit', parseInt(e.target.value) || 0)} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '1.2rem' }}>
              <input type="checkbox" checked={form.isPublished}
                onChange={e => handleField('isPublished', e.target.checked)}
                style={{ width: 'auto', accentColor: 'var(--accent)' }} />
              <span style={{ fontSize: '0.9rem' }}>Publish immediately</span>
            </label>
          </div>
        </div>

        {/* Questions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          {form.questions.map((q, qi) => (
            <div key={qi} className="card fade-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, color: 'var(--accent)', fontSize: '0.85rem' }}>
                  Q{qi + 1}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    Points:
                    <input type="number" min={1} value={q.points}
                      onChange={e => handleQuestion(qi, 'points', parseInt(e.target.value) || 1)}
                      style={{ width: '60px' }} />
                  </label>
                  <button type="button" className="btn btn-danger btn-sm"
                    onClick={() => removeQuestion(qi)}>Remove</button>
                </div>
              </div>

              <div className="form-group">
                <label>Question</label>
                <textarea value={q.questionText}
                  onChange={e => handleQuestion(qi, 'questionText', e.target.value)}
                  placeholder="Enter your question..." rows={2}
                  style={{ resize: 'vertical' }} required />
              </div>

              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Options (select the correct answer)
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {q.options.map((opt, oi) => (
                  <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input type="radio" name={`correct-${qi}`} checked={q.correctAnswer === oi}
                      onChange={() => handleQuestion(qi, 'correctAnswer', oi)}
                      style={{ width: 'auto', accentColor: 'var(--accent)', cursor: 'pointer' }} />
                    <input value={opt} onChange={e => handleOption(qi, oi, e.target.value)}
                      placeholder={`Option ${oi + 1}`} required
                      style={{ borderColor: q.correctAnswer === oi ? 'var(--accent)' : undefined }} />
                    {q.correctAnswer === oi && (
                      <span style={{ color: 'var(--accent)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>✓ Correct</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
          <button type="button" className="btn btn-secondary" onClick={addQuestion}>
            + Add Question
          </button>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/instructor')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Quiz'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}