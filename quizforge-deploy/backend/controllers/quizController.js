const Quiz = require('../models/Quiz');
const User = require('../models/User');
const { sendQuizPublishedEmail } = require('../utils/emailService');

exports.createQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.create({ ...req.body, instructor: req.user._id });
    res.status(201).json({ success: true, data: quiz });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getQuizzes = async (req, res) => {
  try {
    let query;
    if (req.user.role === 'instructor') {
      query = Quiz.find({ instructor: req.user._id }).sort('-createdAt');
    } else {
      query = Quiz.find({ isPublished: true })
        .select('-questions.correctAnswer')
        .populate('instructor', 'name')
        .sort('-createdAt');
    }
    const quizzes = await query;
    res.json({ success: true, count: quizzes.length, data: quizzes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('instructor', 'name email');
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    if (req.user.role === 'student') {
      const quizObj = quiz.toObject();
      quizObj.questions = quizObj.questions.map(q => {
        const { correctAnswer, ...rest } = q;
        return rest;
      });
      return res.json({ success: true, data: quizObj });
    }
    res.json({ success: true, data: quiz });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    let quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    if (quiz.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this quiz' });
    }
    quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: quiz });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    if (quiz.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this quiz' });
    }
    await quiz.deleteOne();
    res.json({ success: true, message: 'Quiz deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.togglePublish = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    if (quiz.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const wasUnpublished = !quiz.isPublished;
    quiz.isPublished = !quiz.isPublished;
    await quiz.save();

    // Send email notifications only when publishing (not unpublishing)
    if (wasUnpublished && quiz.isPublished) {
      const students = await User.find({ role: 'student' }).select('name email');
      if (students.length > 0) {
        sendQuizPublishedEmail(students, quiz, req.user.name);
      }
    }

    res.json({
      success: true,
      data: quiz,
      message: `Quiz ${quiz.isPublished ? 'published — students notified!' : 'unpublished'}`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};