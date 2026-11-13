// bcrypt transforme le mot de passe en une empreinte difficile à retrouver.
import bcrypt from "bcrypt"

// Hache le mot de passe avant son enregistrement en base.
export async function hashPassword(password) {
  return bcrypt.hash(password, 12)
}

// Compare le mot de passe saisi avec l'empreinte stockée en base.
export async function comparePassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash)
}