const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,72}$/;
const OTP_PATTERN = /^\d{6}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function isStrongEnoughPassword(value: string): boolean {
  return PASSWORD_PATTERN.test(value);
}

export function isValidOtp(value: string): boolean {
  return OTP_PATTERN.test(value.trim());
}
