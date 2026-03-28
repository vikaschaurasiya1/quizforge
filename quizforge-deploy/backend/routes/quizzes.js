const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createQuiz, getQuizzes, getQuiz,
  updateQuiz, deleteQuiz, togglePublish
} = require('../controllers/quizController');

router.use(protect);

router.route('/')
  .get(getQuizzes)
  .post(authorize('instructor'), createQuiz);

router.route('/:id')
  .get(getQuiz)
  .put(authorize('instructor'), updateQuiz)
  .delete(authorize('instructor'), deleteQuiz);

router.patch('/:id/publish', authorize('instructor'), togglePublish);

module.exports = router;