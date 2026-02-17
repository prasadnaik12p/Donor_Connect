const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, htmlContent) => {
  try {
    // Create transporter )
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: `"Donor Connect" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    };

    // Send email
    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", to);
    return result;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Failed to send email");
  }
};

// Simple email templates used by controllers
const emailTemplates = {
  verificationEmail: (name, verificationLink) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .button { background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
          .footer { text-align: center; padding: 20px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Donor Connect</h1>
            <p>Verify Your Email Address</p>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Thank you for registering with Donor Connect. Please verify your email address to activate your account.</p>
            <p style="text-align: center;">
              <a href="${verificationLink}" class="button">Verify Email Address</a>
            </p>
            <p>Or copy this link to your browser:</p>
            <p>${verificationLink}</p>
            <p>This link will expire in 1 hour.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Donor Connect. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },
  resetPasswordEmail: (name, resetLink) => {
    return `
      <p>Hello ${name},</p>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetLink}">Reset password</a></p>
    `;
  }
};

module.exports = { sendEmail, emailTemplates };