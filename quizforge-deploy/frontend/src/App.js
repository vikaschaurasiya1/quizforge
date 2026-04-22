import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar, { Footer } from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

import AuthPage from './pages/AuthPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import InstructorDashboard from './pages/InstructorDashboard';
import QuizEditor from './pages/QuizEditor';
import StudentDashboard from './pages/StudentDashboard';
import TakeQuiz from './pages/TakeQuiz';
import ResultDetail from './pages/ResultDetail';
import MyResults from './pages/MyResults';
import Leaderboard from './pages/Leaderboard';

function AppRoutes() {
  const { user } = useAuth();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {user && <Navbar />}
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/login" element={user
            ? <Navigate to={user.role === 'instructor' ? '/instructor' : '/student'} replace />
            : <AuthPage />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route path="/instructor" element={<PrivateRoute role="instructor"><InstructorDashboard /></PrivateRoute>} />
          <Route path="/instructor/create" element={<PrivateRoute role="instructor"><QuizEditor /></PrivateRoute>} />
          <Route path="/instructor/edit/:id" element={<PrivateRoute role="instructor"><QuizEditor /></PrivateRoute>} />

          <Route path="/student" element={<PrivateRoute role="student"><StudentDashboard /></PrivateRoute>} />
          <Route path="/student/quiz/:id" element={<PrivateRoute role="student"><TakeQuiz /></PrivateRoute>} />
          <Route path="/student/results" element={<PrivateRoute role="student"><MyResults /></PrivateRoute>} />
          <Route path="/student/result/:id" element={<PrivateRoute><ResultDetail /></PrivateRoute>} />

          <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />

          <Route path="/" element={user
            ? <Navigate to={user.role === 'instructor' ? '/instructor' : '/student'} replace />
            : <Navigate to="/login" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {user && <Footer />}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1e28', color: '#e8eaf0',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '10px', fontSize: '0.9rem'
          },
          success: { iconTheme: { primary: '#6ee7b7', secondary: '#0d0f14' } },
          error: { iconTheme: { primary: '#f87171', secondary: '#0d0f14' } }
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
