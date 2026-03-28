const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  submitQuiz, getMyResults, getQuizResults, getResult
} = require('../controllers/resultController');

router.use(protect);

router.post('/', authorize('student'), submitQuiz);
router.get('/my', authorize('student'), getMyResults);
router.get('/quiz/:quizId', authorize('instructor'), getQuizResults);
router.get('/:id', getResult);

module.exports = router;