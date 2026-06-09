const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationCode = async (toEmail, code) => {
  try {
    const info = await transporter.sendMail({
      from: `"TopTalk" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Восстановление пароля TopTalk',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #5F2DBB;">🔐 Код подтверждения</h2>
          <p>Ваш код для восстановления пароля:</p>
          <div style="font-size: 32px; font-weight: bold; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 8px; letter-spacing: 4px;">
            ${code}
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">Код действителен 10 минут.</p>
        </div>
      `,
    });
    console.log('Письмо отправлено:', info.messageId);
    return true;
  } catch (error) {
    console.error('Ошибка отправки письма:', error);
    return false;
  }
};

module.exports = { sendVerificationCode };