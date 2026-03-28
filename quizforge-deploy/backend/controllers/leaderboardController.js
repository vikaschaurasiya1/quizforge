const Result = require('../models/Result');

// @desc    Get global leaderboard (top students by avg score)
// @route   GET /api/leaderboard
// @access  Private
exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Result.aggregate([
      {
        $group: {
          _id: '$student',
          totalQuizzes: { $sum: 1 },
          averageScore: { $avg: '$percentage' },
          totalPoints: { $sum: '$score' },
          bestScore: { $max: '$percentage' }
        }
      },
      { $sort: { averageScore: -1, totalPoints: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $project: {
          _id: 1,
          name: '$student.name',
          email: '$student.email',
          totalQuizzes: 1,
          averageScore: { $round: ['$averageScore', 1] },
          totalPoints: 1,
          bestScore: { $round: ['$bestScore', 1] }
        }
      }
    ]);

    res.json({ success: true, count: leaderboard.length, data: leaderboard });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get leaderboard for a specific quiz
// @route   GET /api/leaderboard/quiz/:quizId
// @access  Private
exports.getQuizLeaderboard = async (req, res) => {
  try {
    const results = await Result.find({ quiz: req.params.quizId })
      .populate('student', 'name email')
      .sort('-percentage -score')
      .limit(20);

    const leaderboard = results.map((r, index) => ({
      rank: index + 1,
      name: r.student.name,
      email: r.student.email,
      score: r.score,
      totalPoints: r.totalPoints,
      percentage: r.percentage,
      timeTaken: r.timeTaken,
      submittedAt: r.submittedAt
    }));

    res.json({ success: true, count: leaderboard.length, data: leaderboard });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};