const Result = require('../models/Result');
const Quiz = require('../models/Quiz');

// @desc    Submit quiz answers
// @route   POST /api/results
// @access  Private/Student
exports.submitQuiz = async (req, res) => {
  try {
    const { quizId, answers, timeTaken } = req.body;

    // Check if already submitted
    const existing = await Result.findOne({ student: req.user._id, quiz: quizId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already submitted this quiz' });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    if (!quiz.isPublished) return res.status(400).json({ success: false, message: 'This quiz is not available' });

    // Grade the quiz
    let score = 0;
    const gradedAnswers = quiz.questions.map((question, index) => {
      const selectedAnswer = answers[index] !== undefined ? answers[index] : -1;
      const isCorrect = selectedAnswer === question.correctAnswer;
      const pointsEarned = isCorrect ? (question.points || 1) : 0;
      score += pointsEarned;
      return {
        questionId: question._id,
        selectedAnswer,
        isCorrect,
        pointsEarned
      };
    });

    const percentage = quiz.totalPoints > 0
      ? Math.round((score / quiz.totalPoints) * 100)
      : 0;

    const result = await Result.create({
      student: req.user._id,
      quiz: quizId,
      answers: gradedAnswers,
      score,
      totalPoints: quiz.totalPoints,
      percentage,
      timeTaken: timeTaken || 0
    });

    await result.populate([
      { path: 'quiz', select: 'title questions' },
      { path: 'student', select: 'name email' }
    ]);

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get student's results
// @route   GET /api/results/my
// @access  Private/Student
exports.getMyResults = async (req, res) => {
  try {
    const results = await Result.find({ student: req.user._id })
      .populate('quiz', 'title totalPoints')
      .sort('-submittedAt');
    res.json({ success: true, count: results.length, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get results for a quiz (instructor analytics)
// @route   GET /api/results/quiz/:quizId
// @access  Private/Instructor
exports.getQuizResults = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    if (quiz.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const results = await Result.find({ quiz: req.params.quizId })
      .populate('student', 'name email')
      .sort('-submittedAt');

    // Analytics
    const analytics = {
      totalSubmissions: results.length,
      averageScore: results.length
        ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
        : 0,
      highestScore: results.length ? Math.max(...results.map(r => r.percentage)) : 0,
      lowestScore: results.length ? Math.min(...results.map(r => r.percentage)) : 0,
      passingRate: results.length
        ? Math.round(results.filter(r => r.percentage >= 60).length / results.length * 100)
        : 0
    };

    res.json({ success: true, analytics, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single result detail
// @route   GET /api/results/:id
// @access  Private
exports.getResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('student', 'name email')
      .populate('quiz', 'title questions totalPoints');

    if (!result) return res.status(404).json({ success: false, message: 'Result not found' });

    // Only the student or quiz instructor can view
    const quiz = await Quiz.findById(result.quiz._id);
    const isOwner = result.student._id.toString() === req.user._id.toString();
    const isInstructor = quiz.instructor.toString() === req.user._id.toString();

    if (!isOwner && !isInstructor) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};