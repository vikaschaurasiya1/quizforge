const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getLeaderboard, getQuizLeaderboard } = require('../controllers/leaderboardController');

router.use(protect);
router.get('/', getLeaderboard);
router.get('/quiz/:quizId', getQuizLeaderboard);

module.exports = router;