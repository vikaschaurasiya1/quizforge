const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

exports.sendQuizPublishedEmail = async (students, quiz, instructorName) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️  Email not configured — skipping notifications');
    return;
  }

  const transporter = createTransporter();

  const emailPromises = students.map(student => {
    return transporter.sendMail({
      from: `"QuizForge" <${process.env.EMAIL_USER}>`,
      to: student.email,
      subject: `📝 New Quiz Available: ${quiz.title}`,
      html: `
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
            .quiz-card { background: #f8fffe; border: 2px solid #6ee7b7; border-radius: 10px; padding: 20px; margin: 20px 0; }
            .quiz-card h3 { margin: 0 0 8px; color: #0d0f14; font-size: 18px; }
            .tag { display: inline-block; background: #e8faf3; color: #059669; padding: 4px 12px; border-radius: 100px; font-size: 13px; font-weight: 600; margin: 4px 4px 0 0; }
            .tag-orange { background: #fff3e0; color: #e65100; }
            .btn { display: inline-block; background: #6ee7b7; color: #0d0f14; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; margin-top: 16px; }
            .footer { background: #f8f8f8; padding: 20px 32px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>QuizForge</h1>
            </div>
            <div class="body">
              <h2 style="color:#0d0f14; margin-top:0;">Hi ${student.name}! 👋</h2>
              <p>A new quiz has just been published by <strong>${instructorName}</strong> and is ready for you!</p>
              <div class="quiz-card">
                <h3>${quiz.title}</h3>
                ${quiz.description ? `<p style="margin:6px 0 12px; color:#666; font-size:14px;">${quiz.description}</p>` : ''}
                <span class="tag">📝 ${quiz.questions?.length || 0} Questions</span>
                <span class="tag">⭐ ${quiz.totalPoints} Points</span>
                ${quiz.timeLimit > 0 ? `<span class="tag tag-orange">⏱ ${quiz.timeLimit} min</span>` : '<span class="tag">⏱ No Time Limit</span>'}
              </div>
              <p>Log in to your account and take the quiz now:</p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/student" class="btn">Take Quiz Now →</a>
            </div>
            <div class="footer">
              <p>You received this because you are registered as a student on QuizForge.</p>
              <p>© ${new Date().getFullYear()} QuizForge</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
  });

  try {
    await Promise.allSettled(emailPromises);
    console.log(`✅ Quiz notifications sent to ${students.length} students`);
  } catch (err) {
    console.error('Email error:', err.message);
  }
};