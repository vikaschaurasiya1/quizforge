const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  questionId: mongoose.Schema.Types.ObjectId,
  selectedAnswer: Number, // index selected by student
  isCorrect: Boolean,
  pointsEarned: { type: Number, default: 0 }
});

const ResultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  answers: [AnswerSchema],
  score: {
    type: Number,
    required: true,
    default: 0
  },
  totalPoints: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  timeTaken: {
    type: Number, // seconds
    default: 0
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Prevent duplicate submissions
ResultSchema.index({ student: 1, quiz: 1 }, { unique: true });

module.exports = mongoose.model('Result', ResultSchema);