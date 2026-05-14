import { Resend } from "resend";

// Lazily initialized so the build doesn't fail when env vars are absent
let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM = () => process.env.RESEND_FROM ?? "onboarding@resend.dev";
const BASE_URL = () => process.env.NEXTAUTH_URL ?? "http://localhost:3000";

const DISCORD_URL = "https://discord.gg/z5P4wJT4W";

function layout(content: string) {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Raleway:wght@400;500&display=swap" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Raleway:wght@400;500&display=swap');
    body { margin:0; padding:0; background:#0A0A0A; font-family:'Raleway','Segoe UI',sans-serif; }
    h1,h2,p.cinzel { font-family:'Cinzel',Georgia,serif; }
  </style>
</head>
<body style="margin:0;padding:0;background:#0A0A0A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#111111;border:1px solid #2A1A1A;">
        <tr><td style="height:3px;background:linear-gradient(90deg,#6B0000,#8B0000,#B8860B,#8B0000,#6B0000);"></td></tr>
        <tr><td style="padding:36px 40px;">
          ${content}
        </td></tr>
        <tr><td style="height:1px;background:linear-gradient(90deg,transparent,#2A1A1A,transparent);"></td></tr>
        <tr><td style="padding:20px 40px;text-align:center;">
          <a href="${DISCORD_URL}" style="font-family:'Cinzel',Georgia,serif;color:#5865F2;font-size:12px;letter-spacing:0.08em;text-decoration:none;">
            ✦ Discord beitreten ✦
          </a>
          <p style="color:#3A3A3A;font-size:11px;margin:12px 0 0;font-family:'Raleway','Segoe UI',sans-serif;">
            Diese E-Mail wurde automatisch generiert · Bitte nicht antworten
          </p>
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

// ── Welcome / Registration Confirmation ───────────────────

export async function sendWelcomeEmail(to: string, name: string) {
  const link = `${BASE_URL()}/login`;
  await getResend().emails.send({
    from: FROM(),
    to,
    subject: "Willkommen bei Lorehub",
    html: layout(`
      ${heading("Registrierung erfolgreich")}
      <h1 style="color:#F5EDD6;font-family:'Cinzel',serif;font-size:22px;margin:0 0 12px;">Willkommen, ${name}!</h1>
      <p style="color:#C8B8A8;font-size:14px;line-height:1.6;margin:0 0 8px;">
        Dein Account bei Lorehub wurde erfolgreich erstellt. Du kannst dich ab sofort einloggen und deine Kampagnen verwalten.
      </p>
      ${btn(link, "Zu Lorehub")}
      <p style="color:#4A4A4A;font-size:11px;margin-top:20px;">
        Falls du diesen Account nicht erstellt hast, kannst du diese E-Mail ignorieren.
      </p>
    `),
  });
}

// ── Password Reset ─────────────────────────────────────────

export async function sendPasswordResetEmail(to: string, token: string) {
  const link = `${BASE_URL()}/passwort-zuruecksetzen?token=${token}`;
  await getResend().emails.send({
    from: FROM(),
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
