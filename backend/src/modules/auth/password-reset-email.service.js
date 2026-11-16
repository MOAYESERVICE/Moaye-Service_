import nodemailer from "nodemailer"
import { env } from "../../config/env.js"

let transporter

export function getMissingPasswordResetEmailConfig() {
  return [
    ["SMTP_HOST", env.SMTP_HOST],
    ["SMTP_PORT", env.SMTP_PORT],
    ["SMTP_USER", env.SMTP_USER],
    ["SMTP_PASSWORD", env.SMTP_PASSWORD],
    ["SMTP_FROM", env.SMTP_FROM],
  ]
    .filter(([, value]) => value === undefined || value === "")
    .map(([name]) => name)
}

export function isPasswordResetEmailConfigured() {
  return getMissingPasswordResetEmailConfig().length === 0
}

function getTransporter() {
  if (!isPasswordResetEmailConfigured()) {
    throw new Error("La configuration SMTP n’est pas complète.")
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
    })
  }

  return transporter
}

export function sendPasswordResetEmail(to, code) {
  return getTransporter().sendMail({
    from: { name: "MOAYE SERVICE", address: env.SMTP_FROM },
    to,
    subject: "Réinitialisation de votre mot de passe — MOAYE SERVICE",
    text: [
      "Bonjour,",
      "",
      "Une demande de réinitialisation du mot de passe de votre compte MOAYE SERVICE a été effectuée.",
      "Saisissez ce code sur le site pour choisir un nouveau mot de passe à 4 chiffres :",
      code,
      "",
      "Ce code expire dans 10 minutes et ne peut être utilisé qu’une seule fois.",
      "",
      "Si vous n’êtes pas à l’origine de cette demande, ignorez ce message.",
    ].join("\n"),
    html: `
      <div style="margin:0;background:#f4f7f4;padding:32px 16px;font-family:Arial,sans-serif;color:#0e2a26">
        <div style="max-width:560px;margin:0 auto;border:1px solid #d5e1d9;border-radius:16px;background:#fff;padding:32px">
          <p style="margin:0 0 12px;color:#1b6b57;font-weight:700;letter-spacing:.08em">MOAYE SERVICE</p>
          <h1 style="margin:0 0 16px;font-size:24px">Réinitialisation du mot de passe</h1>
          <p style="line-height:1.6">Une demande de réinitialisation du mot de passe de votre compte a été effectuée.</p>
          <p style="line-height:1.6">Saisissez ce code sur le site pour choisir un nouveau mot de passe à 4 chiffres :</p>
          <p style="margin:24px 0;padding:18px;border-radius:12px;background:#edf5f0;text-align:center;font-size:32px;font-weight:700;letter-spacing:8px;color:#1b6b57">${code}</p>
          <p style="line-height:1.6">Ce code expire dans 10 minutes et ne peut être utilisé qu’une seule fois.</p>
          <p style="font-size:13px;line-height:1.6;color:#4a625b">Si vous n’êtes pas à l’origine de cette demande, ignorez ce message. Votre code ne changera pas.</p>
        </div>
      </div>
    `,
  })
}

export function sendPasswordChangedEmail(to) {
  return getTransporter().sendMail({
    from: { name: "MOAYE SERVICE", address: env.SMTP_FROM },
    to,
    subject: "Votre mot de passe a été modifié — MOAYE SERVICE",
    text: "Le mot de passe de votre compte MOAYE SERVICE vient d’être modifié. Si vous n’êtes pas à l’origine de cette modification, contactez l’équipe MOAYE SERVICE.",
    html: `
      <div style="margin:0;background:#f4f7f4;padding:32px 16px;font-family:Arial,sans-serif;color:#0e2a26">
        <div style="max-width:560px;margin:0 auto;border:1px solid #d5e1d9;border-radius:16px;background:#fff;padding:32px">
          <p style="margin:0 0 12px;color:#1b6b57;font-weight:700;letter-spacing:.08em">MOAYE SERVICE</p>
          <h1 style="margin:0 0 16px;font-size:24px">Mot de passe modifié</h1>
          <p style="line-height:1.6">Le mot de passe de votre compte MOAYE SERVICE vient d’être modifié.</p>
          <p style="line-height:1.6">Si vous n’êtes pas à l’origine de cette modification, contactez l’équipe MOAYE SERVICE.</p>
        </div>
      </div>
    `,
  })
}
