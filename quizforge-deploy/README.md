# QuizForge — Full-Stack MERN Quiz Management System

A production-ready quiz platform with role-based access for instructors and students, built with MongoDB, Express, React, and Node.js.

---

## Features

### Authentication (JWT)
- Register as **Student** or **Instructor**
- Secure JWT tokens stored in localStorage
- Protected routes with role-based access control
- Token verification on every request via Axios interceptors

### Instructor
- Create quizzes with multiple-choice questions (custom points per question)
- Edit and delete quizzes
- Publish / unpublish quizzes (only published quizzes are visible to students)
- Set optional time limits
- View per-quiz analytics: submissions, average score, highest/lowest, pass rate

### Student
- Browse all published quizzes
- Take quizzes with a live countdown timer (if time limit is set)
- Navigate between questions freely, dot-indicator shows answered status
- Auto-submit on timer expiry
- View detailed result breakdown with correct answers highlighted
- Personal results history with performance stats

---

## Project Structure

```
quiz-app/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── quizController.js
│   │   └── resultController.js
│   ├── middleware/
│   │   └── auth.js            # JWT protect + role authorize
│   ├── models/
│   │   ├── User.js
│   │   ├── Quiz.js
│   │   └── Result.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── quizzes.js
│   │   └── results.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   └── PrivateRoute.js
    │   ├── context/
    │   │   └── AuthContext.js  # Global auth state (React Context + Hooks)
    │   ├── hooks/
    │   │   └── useQuizzes.js   # Custom hook for quiz CRUD
    │   ├── pages/
    │   │   ├── AuthPage.js           # Login + Register
    │   │   ├── InstructorDashboard.js
    │   │   ├── QuizEditor.js         # Create + Edit
    │   │   ├── StudentDashboard.js
    │   │   ├── TakeQuiz.js
    │   │   ├── ResultDetail.js
    │   │   └── MyResults.js
    │   ├── utils/
    │   │   └── api.js          # Axios instance with JWT interceptor
    │   ├── App.js              # React Router setup
    │   ├── index.js
    │   └── index.css           # Design system (CSS variables + utilities)
    └── package.json
```

---

## Setup & Run

### Prerequisites
- Node.js v18+
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com))

### 1. Backend

```bash
cd backend
npm install

# Copy env file and fill in values
cp .env.example .env
# Edit .env:
#   MONGO_URI=mongodb://localhost:27017/quizapp
#   JWT_SECRET=your_strong_secret_here
#   JWT_EXPIRE=7d
#   PORT=5000

npm run dev   # uses nodemon for hot reload
# or
npm start
```

### 2. Frontend

```bash
cd frontend
npm install
npm start     # runs on http://localhost:3000
```

The frontend is configured with `"proxy": "http://localhost:5000"` in `package.json`, so all `/api/*` calls are proxied to the backend automatically in development.

---

## API Reference

### Auth
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Private | Get current user |

### Quizzes
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/quizzes` | Private | Get quizzes (role-aware) |
| POST | `/api/quizzes` | Instructor | Create quiz |
| GET | `/api/quizzes/:id` | Private | Get single quiz |
| PUT | `/api/quizzes/:id` | Instructor | Update quiz |
| DELETE | `/api/quizzes/:id` | Instructor | Delete quiz |
| PATCH | `/api/quizzes/:id/publish` | Instructor | Toggle publish |

### Results
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/results` | Student | Submit quiz answers |
| GET | `/api/results/my` | Student | Get my results |
| GET | `/api/results/quiz/:quizId` | Instructor | Get all results + analytics for a quiz |
| GET | `/api/results/:id` | Private | Get result detail |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Database | MongoDB + Mongoose ODM |
| Backend | Node.js + Express.js |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Frontend | React 18 + React Router v6 |
| State | React Context API + Custom Hooks |
| HTTP Client | Axios (with interceptors) |
| Notifications | react-hot-toast |

---

## Deployment

### Backend (Railway / Render / Heroku)
1. Set environment variables: `MONGO_URI`, `JWT_SECRET`, `PORT`
2. Use MongoDB Atlas for the hosted database
3. `npm start`

### Frontend (Vercel / Netlify)
1. Set `REACT_APP_API_URL=https://your-backend.com/api`
2. Update `api.js` baseURL to use `process.env.REACT_APP_API_URL`
3. `npm run build` → deploy the `build/` folder

---

## License & Copyright

© 2025 Vikas Chaurasiya — QuizForge. All rights reserved.

This project and its source code are the intellectual property of Vikas Chaurasiya.
Unauthorized copying, distribution, or use of this project without explicit permission
from the author is strictly prohibited.

Built with ❤️ using the MERN Stack (MongoDB, Express.js, React.js, Node.js)
