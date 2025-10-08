import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

interface SendOtpEmailParams {
  to: string
  otp: string
  userName: string
}

export async function sendOtpEmail({ to, otp, userName }: SendOtpEmailParams) {
  const mailOptions = {
    from: `"Pera App" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Password Reset OTP - Pera",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              border-radius: 10px;
              padding: 30px;
              border: 1px solid #e0e0e0;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #000;
              margin: 0;
              font-size: 28px;
            }
            .otp-box {
              background-color: #fff;
              border: 2px solid #000;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 30px 0;
            }
            .otp-code {
              font-size: 36px;
              font-weight: bold;
              letter-spacing: 8px;
              color: #000;
              margin: 10px 0;
            }
            .content {
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #666;
              margin-top: 30px;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Pera</h1>
              <p>Password Reset Request</p>
            </div>
            
            <div class="content">
              <p>Hi ${userName},</p>
              <p>You requested to reset your password. Use the OTP code below to proceed:</p>
            </div>
            
            <div class="otp-box">
              <p style="margin: 0; font-size: 14px; color: #666;">Your OTP Code</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 0; font-size: 12px; color: #666;">Valid for 10 minutes</p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
            </div>
            
            <div class="footer">
              <p>This is an automated message from Pera. Please do not reply to this email.</p>
              <p>&copy; 2024 Pera. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Hi ${userName},
      
      You requested to reset your password for your Pera account.
      
      Your OTP code is: ${otp}
      
      This code is valid for 10 minutes.
      
      If you didn't request this password reset, please ignore this email.
      
      Best regards,
      The Pera Team
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error("Email sending error:", error)
    return { success: false, error }
  }
}

// Test email configuration
export async function verifyEmailConfig() {
  try {
    await transporter.verify()
    return true
  } catch (error) {
    console.error("Email configuration error:", error)
    return false
  }
}