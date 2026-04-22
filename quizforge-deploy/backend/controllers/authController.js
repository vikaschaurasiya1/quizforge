const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  await transporter.sendMail({
    from: `"QuizForge" <${process.env.EMAIL_USER}>`,
    to, subject, html
  });
};

// @desc Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, instructorCode } = req.body;

    if (role === 'instructor') {
      const correctCode = process.env.INSTRUCTOR_CODE;
      if (!instructorCode || instructorCode !== correctCode) {
        return res.status(403).json({
          success: false,
          message: 'Invalid instructor code. Please contact the administrator.'
        });
      }
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, role: role || 'student' });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get current user
exports.getMe = async (req, res) => {
  res.json({
    success: true,
    user: { _id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role }
  });
};

// @desc Forgot password - send reset email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with that email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          .header { background: #0d0f14; padding: 32px; text-align: center; }
          .header h1 { color: #6ee7b7; margin: 0; font-size: 24px; }
          .body { padding: 32px; }
          .body p { color: #555; line-height: 1.6; }
          .btn { display: inline-block; background: #6ee7b7; color: #0d0f14; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; margin-top: 16px; }
          .warning { background: #fff3e0; border-left: 4px solid #fbbf24; padding: 12px 16px; border-radius: 4px; margin-top: 16px; font-size: 14px; color: #555; }
          .footer { background: #f8f8f8; padding: 20px 32px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>QuizForge</h1></div>
          <div class="body">
            <h2 style="color:#0d0f14; margin-top:0;">Reset Your Password 🔐</h2>
            <p>Hi ${user.name},</p>
            <p>You requested a password reset for your QuizForge account. Click the button below to set a new password:</p>
            <a href="${resetUrl}" class="btn">Reset Password →</a>
            <div class="warning">
              ⚠️ This link expires in <strong>15 minutes</strong>. If you didn't request this, please ignore this email.
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} QuizForge. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail(user.email, '🔐 Reset Your QuizForge Password', html);

    res.json({ success: true, message: 'Password reset email sent!' });
  } catch (err) {
    // Clear token on error
    if (err.code !== 'ECONNREFUSED') {
      await User.updateOne(
        { email: req.body.email },
        { $unset: { resetPasswordToken: 1, resetPasswordExpire: 1 } }
      );
    }
    res.status(500).json({ success: false, message: 'Email could not be sent. Try again later.' });
  }
};

// @desc Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful! You can now login.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
