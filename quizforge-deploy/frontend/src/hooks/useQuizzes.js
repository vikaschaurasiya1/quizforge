import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export const useQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/quizzes');
      setQuizzes(data.data);
    } catch (err) {
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuizzes(); }, []);

  const createQuiz = async (quizData) => {
    const { data } = await api.post('/quizzes', quizData);
    setQuizzes(prev => [data.data, ...prev]);
    toast.success('Quiz created!');
    return data.data;
  };

  const updateQuiz = async (id, quizData) => {
    const { data } = await api.put(`/quizzes/${id}`, quizData);
    setQuizzes(prev => prev.map(q => q._id === id ? data.data : q));
    toast.success('Quiz updated!');
    return data.data;
  };

  const deleteQuiz = async (id) => {
    await api.delete(`/quizzes/${id}`);
    setQuizzes(prev => prev.filter(q => q._id !== id));
    toast.success('Quiz deleted');
  };

  const togglePublish = async (id) => {
    const { data } = await api.patch(`/quizzes/${id}/publish`);
    setQuizzes(prev => prev.map(q => q._id === id ? data.data : q));
    toast.success(data.message);
    return data.data;
  };

  return { quizzes, loading, fetchQuizzes, createQuiz, updateQuiz, deleteQuiz, togglePublish };
};