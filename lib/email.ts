import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM ?? "noreply@resend.dev";
const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

function layout(content: string) {
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #2A1A1A;">
        <tr><td style="height:3px;background:linear-gradient(90deg,#6B0000,#8B0000,#B8860B,#8B0000,#6B0000);"></td></tr>
        <tr><td style="padding:32px 36px;">
          ${content}
        </td></tr>
        <tr><td style="height:1px;background:linear-gradient(90deg,transparent,#2A1A1A,transparent);"></td></tr>
        <tr><td style="padding:16px 36px;text-align:center;">
          <p style="color:#4A4A4A;font-size:11px;margin:0;">Diese E-Mail wurde automatisch generiert · Bitte nicht antworten</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;background:#6B0000;color:#F5EDD6;font-family:'Cinzel',serif;font-size:13px;letter-spacing:0.1em;padding:12px 28px;text-decoration:none;border:1px solid #8B0000;margin-top:20px;">${label}</a>`;
}

function heading(text: string) {
  return `<p style="color:#B8860B;font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 16px;">✦ ${text} ✦</p>`;
}

// ── Email Verification ─────────────────────────────────────

export async function sendVerificationEmail(to: string, token: string) {
  const link = `${BASE_URL}/api/auth/email-bestaetigen?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to,
    subject: "E-Mail-Adresse bestätigen",
    html: layout(`
      ${heading("E-Mail bestätigen")}
      <h1 style="color:#F5EDD6;font-family:'Cinzel',serif;font-size:22px;margin:0 0 12px;">Willkommen!</h1>
      <p style="color:#C8B8A8;font-size:14px;line-height:1.6;margin:0 0 8px;">
        Bitte bestätige deine E-Mail-Adresse, um deinen Account zu aktivieren.
      </p>
      <p style="color:#6A6A6A;font-size:12px;margin:0;">Der Link ist 24 Stunden gültig.</p>
      ${btn(link, "E-Mail bestätigen")}
      <p style="color:#4A4A4A;font-size:11px;margin-top:20px;">
        Falls du diesen Account nicht erstellt hast, kannst du diese E-Mail ignorieren.
      </p>
    `),
  });
}

// ── Password Reset ─────────────────────────────────────────

export async function sendPasswordResetEmail(to: string, token: string) {
  const link = `${BASE_URL}/passwort-zuruecksetzen?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Passwort zurücksetzen",
    html: layout(`
      ${heading("Passwort zurücksetzen")}
      <h1 style="color:#F5EDD6;font-family:'Cinzel',serif;font-size:22px;margin:0 0 12px;">Passwort vergessen?</h1>
      <p style="color:#C8B8A8;font-size:14px;line-height:1.6;margin:0 0 8px;">
        Klicke auf den Button, um ein neues Passwort zu setzen.
      </p>
      <p style="color:#6A6A6A;font-size:12px;margin:0;">Der Link ist 1 Stunde gültig.</p>
      ${btn(link, "Passwort zurücksetzen")}
      <p style="color:#4A4A4A;font-size:11px;margin-top:20px;">
        Falls du kein neues Passwort angefordert hast, kannst du diese E-Mail ignorieren.
      </p>
    `),
  });
}
