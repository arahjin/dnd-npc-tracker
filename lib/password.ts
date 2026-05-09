export type PasswordError = string | null;

export function validatePassword(password: string): PasswordError {
  if (password.length < 8) return "Mindestens 8 Zeichen.";
  if (!/[A-Z]/.test(password)) return "Mindestens ein Großbuchstabe.";
  if (!/[a-z]/.test(password)) return "Mindestens ein Kleinbuchstabe.";
  if (!/[0-9]/.test(password)) return "Mindestens eine Zahl.";
  return null;
}

export const PASSWORD_HINT = "Mindestens 8 Zeichen, ein Groß- und Kleinbuchstabe sowie eine Zahl.";
