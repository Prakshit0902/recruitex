export const forgotPasswordTemplate = (resetLink: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password - Recruitex</title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 0;
      font-family: Arial, Helvetica, sans-serif;
      background: #eef2ff;
      color: #1f2937;
    }

    table {
      border-spacing: 0;
      border-collapse: collapse;
    }

    img {
      border: 0;
      display: block;
    }

    a {
      text-decoration: none;
    }

    .email-wrapper {
      width: 100%;
      min-height: 100vh;
      background:
        radial-gradient(circle at top left, rgba(99, 102, 241, 0.22), transparent 35%),
        radial-gradient(circle at bottom right, rgba(168, 85, 247, 0.2), transparent 35%),
        #eef2ff;
      padding: 40px 16px;
    }

    .email-container {
      width: 100%;
      max-width: 640px;
      background: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 24px 70px rgba(79, 70, 229, 0.18);
    }

    .hero {
      background:
        linear-gradient(135deg, rgba(79, 70, 229, 0.95), rgba(124, 58, 237, 0.95)),
        linear-gradient(45deg, #4f46e5, #7c3aed);
      padding: 44px 36px 38px;
      text-align: center;
      position: relative;
    }

    .brand-pill {
      display: inline-block;
      padding: 9px 16px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.16);
      color: #ffffff;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.4px;
      margin-bottom: 26px;
      border: 1px solid rgba(255, 255, 255, 0.22);
    }

    .hero-icon {
      width: 76px;
      height: 76px;
      margin: 0 auto 22px;
      border-radius: 22px;
      background: rgba(255, 255, 255, 0.18);
      border: 1px solid rgba(255, 255, 255, 0.28);
      color: #ffffff;
      font-size: 36px;
      line-height: 76px;
      text-align: center;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.24);
    }

    .hero h1 {
      margin: 0;
      color: #ffffff;
      font-size: 32px;
      line-height: 1.25;
      font-weight: 800;
      letter-spacing: -0.6px;
    }

    .hero p {
      margin: 14px auto 0;
      max-width: 440px;
      color: rgba(255, 255, 255, 0.86);
      font-size: 15px;
      line-height: 1.7;
    }

    .content {
      padding: 42px 38px 34px;
    }

    .greeting {
      margin: 0 0 18px;
      color: #111827;
      font-size: 20px;
      line-height: 1.5;
      font-weight: 700;
    }

    .text {
      margin: 0 0 18px;
      color: #4b5563;
      font-size: 16px;
      line-height: 1.75;
    }

    .highlight-card {
      margin: 28px 0;
      padding: 22px;
      border-radius: 18px;
      background: linear-gradient(135deg, #f5f7ff, #faf5ff);
      border: 1px solid #e5e7eb;
    }

    .highlight-title {
      margin: 0 0 8px;
      color: #312e81;
      font-size: 15px;
      font-weight: 800;
    }

    .highlight-text {
      margin: 0;
      color: #6b7280;
      font-size: 14px;
      line-height: 1.7;
    }

    .button-wrapper {
      margin: 34px 0 30px;
      text-align: center;
    }

    .button {
      display: inline-block;
      padding: 16px 42px;
      border-radius: 14px;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: #ffffff !important;
      font-size: 16px;
      font-weight: 800;
      letter-spacing: 0.2px;
      box-shadow: 0 14px 30px rgba(79, 70, 229, 0.34);
    }

    .button:hover {
      opacity: 0.94;
    }

    .divider {
      height: 1px;
      background: #e5e7eb;
      margin: 32px 0;
    }

    .small-title {
      margin: 0 0 10px;
      color: #111827;
      font-size: 14px;
      font-weight: 800;
    }

    .link-box {
      margin: 0 0 24px;
      padding: 16px;
      border-radius: 14px;
      background: #f9fafb;
      border: 1px dashed #a5b4fc;
      color: #4f46e5;
      font-size: 13px;
      line-height: 1.6;
      word-break: break-all;
    }

    .security-box {
      margin: 24px 0 0;
      padding: 18px 18px;
      border-radius: 16px;
      background: #fff7ed;
      border: 1px solid #fed7aa;
    }

    .security-box p {
      margin: 0;
      color: #9a3412;
      font-size: 14px;
      line-height: 1.7;
    }

    .security-box strong {
      color: #7c2d12;
    }

    .help-text {
      margin: 24px 0 0;
      color: #6b7280;
      font-size: 14px;
      line-height: 1.7;
    }

    .footer {
      padding: 30px 36px 36px;
      text-align: center;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
    }

    .footer-brand {
      margin: 0 0 10px;
      color: #4f46e5;
      font-size: 18px;
      font-weight: 900;
      letter-spacing: -0.3px;
    }

    .footer-text {
      margin: 0 0 8px;
      color: #9ca3af;
      font-size: 12px;
      line-height: 1.6;
    }

    .footer-text:last-child {
      margin-bottom: 0;
    }

    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 24px 12px;
      }

      .hero {
        padding: 36px 24px 32px;
      }

      .hero h1 {
        font-size: 26px;
      }

      .content {
        padding: 32px 24px 28px;
      }

      .button {
        display: block;
        width: 100%;
        padding: 16px 20px;
      }

      .footer {
        padding: 26px 24px 30px;
      }
    }
  </style>
</head>

<body>
  <table role="presentation" class="email-wrapper" width="100%">
    <tr>
      <td align="center">
        <table role="presentation" class="email-container" width="640">

          <!-- Hero Section -->
          <tr>
            <td class="hero">
              <div class="brand-pill">Recruitex</div>
              <div class="hero-icon">🔐</div>

              <h1>Reset Your Password</h1>
              <p>
                We received a secure request to help you regain access to your Recruitex account.
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td class="content">
              <p class="greeting">Hi there,</p>

              <p class="text">
                No worries — it happens. Click the button below to create a new password and get back into your account.
              </p>

              <div class="highlight-card">
                <p class="highlight-title">Your account security matters</p>
                <p class="highlight-text">
                  This password reset link is unique to your account and can only be used for a limited time.
                </p>
              </div>

              <!-- CTA Button -->
              <div class="button-wrapper">
                <a href="${resetLink}" class="button">
                  Reset My Password
                </a>
              </div>

              <div class="divider"></div>

              <p class="small-title">Having trouble with the button?</p>

              <p class="text">
                Copy and paste the secure link below into your browser:
              </p>

              <p class="link-box">
                ${resetLink}
              </p>

              <div class="security-box">
                <p>
                  <strong>⏰ This link expires in 15 minutes.</strong>
                  For your protection, please reset your password before the link becomes inactive.
                </p>
              </div>

              <p class="help-text">
                If you did not request a password reset, you can safely ignore this email.
                Your Recruitex account will remain secure.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer">
              <p class="footer-brand">Recruitex</p>

              <p class="footer-text">
                Helping companies and candidates connect smarter.
              </p>

              <p class="footer-text">
                © 2025 Recruitex. All rights reserved.
              </p>

              <p class="footer-text">
                This is an automated message, please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};
