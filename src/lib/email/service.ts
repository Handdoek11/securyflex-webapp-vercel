import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using Resend
 */
export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "SecuryFlex <noreply@securyflex.nl>",
      to,
      subject,
      html,
      text
    });

    if (error) {
      console.error("Error sending email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Verifieer je email</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          h1 {
            color: #1f2937;
            font-size: 24px;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #2563eb;
            color: white !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #1d4ed8;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
          }
          .link {
            color: #2563eb;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🛡️ SecuryFlex</div>
          </div>

          <h1>Hallo ${name},</h1>

          <p>Bedankt voor je registratie bij SecuryFlex! Klik op de onderstaande knop om je e-mailadres te verifiëren:</p>

          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verifieer E-mailadres</a>
          </div>

          <p>Of kopieer en plak deze link in je browser:</p>
          <p class="link">${verificationUrl}</p>

          <p><strong>Deze link is 24 uur geldig.</strong></p>

          <p>Als je geen account hebt aangemaakt bij SecuryFlex, kun je deze e-mail negeren.</p>

          <div class="footer">
            <p>Met vriendelijke groet,<br>Het SecuryFlex Team</p>
            <p>© ${new Date().getFullYear()} SecuryFlex. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Hallo ${name},

    Bedankt voor je registratie bij SecuryFlex!

    Verifieer je e-mailadres door op de volgende link te klikken:
    ${verificationUrl}

    Deze link is 24 uur geldig.

    Als je geen account hebt aangemaakt bij SecuryFlex, kun je deze e-mail negeren.

    Met vriendelijke groet,
    Het SecuryFlex Team
  `;

  return sendEmail({
    to: email,
    subject: "Verifieer je SecuryFlex account",
    html,
    text
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Wachtwoord resetten</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          h1 {
            color: #1f2937;
            font-size: 24px;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #2563eb;
            color: white !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #1d4ed8;
          }
          .warning {
            background-color: #fef3c7;
            border: 1px solid #fbbf24;
            padding: 12px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
          }
          .link {
            color: #2563eb;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🛡️ SecuryFlex</div>
          </div>

          <h1>Hallo ${name},</h1>

          <p>We hebben een verzoek ontvangen om het wachtwoord voor je SecuryFlex account te resetten.</p>

          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Wachtwoord</a>
          </div>

          <p>Of kopieer en plak deze link in je browser:</p>
          <p class="link">${resetUrl}</p>

          <div class="warning">
            <strong>⚠️ Let op:</strong> Deze link is slechts 1 uur geldig om veiligheidsredenen.
          </div>

          <p>Als je geen wachtwoord reset hebt aangevraagd, kun je deze e-mail veilig negeren. Je wachtwoord blijft ongewijzigd.</p>

          <p>Voor extra beveiliging raden we aan om:</p>
          <ul>
            <li>Een sterk, uniek wachtwoord te gebruiken</li>
            <li>Regelmatig je wachtwoord te wijzigen</li>
            <li>Nooit je wachtwoord met anderen te delen</li>
          </ul>

          <div class="footer">
            <p>Met vriendelijke groet,<br>Het SecuryFlex Team</p>
            <p>© ${new Date().getFullYear()} SecuryFlex. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Hallo ${name},

    We hebben een verzoek ontvangen om het wachtwoord voor je SecuryFlex account te resetten.

    Reset je wachtwoord door op de volgende link te klikken:
    ${resetUrl}

    Let op: Deze link is slechts 1 uur geldig om veiligheidsredenen.

    Als je geen wachtwoord reset hebt aangevraagd, kun je deze e-mail veilig negeren.

    Met vriendelijke groet,
    Het SecuryFlex Team
  `;

  return sendEmail({
    to: email,
    subject: "Reset je SecuryFlex wachtwoord",
    html,
    text
  });
}

/**
 * Send team invitation email
 */
export async function sendTeamInvitationEmail(
  email: string,
  name: string,
  companyName: string,
  inviterName: string
) {
  const loginUrl = `${process.env.NEXTAUTH_URL}/auth/login`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Uitnodiging voor team</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          h1 {
            color: #1f2937;
            font-size: 24px;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #2563eb;
            color: white !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
          }
          .info-box {
            background-color: #eff6ff;
            border: 1px solid #3b82f6;
            padding: 12px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🛡️ SecuryFlex</div>
          </div>

          <h1>Hallo ${name},</h1>

          <p><strong>${inviterName}</strong> van <strong>${companyName}</strong> heeft je uitgenodigd om lid te worden van hun beveiligingsteam op SecuryFlex.</p>

          <div class="info-box">
            <strong>Wat betekent dit voor jou?</strong>
            <ul>
              <li>Je wordt onderdeel van het ${companyName} team</li>
              <li>Je kunt worden ingepland voor opdrachten van ${companyName}</li>
              <li>Je werkuren worden automatisch bijgehouden</li>
              <li>Je betalingen worden via ${companyName} verwerkt</li>
            </ul>
          </div>

          <div style="text-align: center;">
            <a href="${loginUrl}" class="button">Accepteer Uitnodiging</a>
          </div>

          <p>Log in op je SecuryFlex account om de uitnodiging te accepteren of af te wijzen.</p>

          <div class="footer">
            <p>Met vriendelijke groet,<br>Het SecuryFlex Team</p>
            <p>© ${new Date().getFullYear()} SecuryFlex. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Hallo ${name},

    ${inviterName} van ${companyName} heeft je uitgenodigd om lid te worden van hun beveiligingsteam op SecuryFlex.

    Wat betekent dit voor jou?
    - Je wordt onderdeel van het ${companyName} team
    - Je kunt worden ingepland voor opdrachten van ${companyName}
    - Je werkuren worden automatisch bijgehouden
    - Je betalingen worden via ${companyName} verwerkt

    Log in op je SecuryFlex account om de uitnodiging te accepteren of af te wijzen:
    ${loginUrl}

    Met vriendelijke groet,
    Het SecuryFlex Team
  `;

  return sendEmail({
    to: email,
    subject: `Uitnodiging voor ${companyName} team op SecuryFlex`,
    html,
    text
  });
}