// emailService.js
const nodemailer = require("nodemailer");
require("dotenv").config();

// Set up Nodemailer transporter using Gmail (or another email provider if needed)
const transporter = nodemailer.createTransport({
  service: "gmail", // Use your preferred email service
  auth: {
    user: process.env.EMAIL_USER || "bufoodapp@gmail.com", // Your Gmail address
    pass: process.env.EMAIL_PASSWORD || "khjqiklykeibearc", // Your Gmail app-specific password (NOT your regular Gmail password)
  },
});

// Verify transporter connection
transporter.verify(function (error, success) {
  if (error) {
    console.error("Email service error:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Function to send verification email
const sendVerificationEmail = async (email, verificationLink) => {
  if (!email || !verificationLink) {
    throw new Error("Email and verification link are required");
  }

  // HTML body with a button
  const htmlContent = `
    <p>Hello,</p>
    <p>Thank you for registering! Please verify your email by clicking the button below:</p>
    <a href="${verificationLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 15px 25px; font-size: 16px; text-align: center; border-radius: 5px; text-decoration: none;">
      Verify Email
    </a>
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p>${verificationLink}</p>
    <p>Best regards,<br>BuFood Admin</p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER || "bufoodapp@gmail.com", // Your email address
    to: email, // Recipient's email address
    subject: "Email Verification - BuFood", // Subject of the email
    html: htmlContent, // HTML content with the button
  };

  try {
    // Send the email and return the result
    const info = await transporter.sendMail(mailOptions);
    console.log(
      "Verification email sent to",
      email,
      "Message ID:",
      info.messageId
    );
    return info;
  } catch (error) {
    console.error("Error sending email to", email, "Error:", error);
    throw error; // Re-throw the error so the caller can handle it
  }
};

module.exports = {
  sendVerificationEmail, // Export the function
};
