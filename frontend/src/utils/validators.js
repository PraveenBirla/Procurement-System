/**
 * Validation utilities for form fields.
 */

/** Email regex pattern */
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Individual password requirement checks.
 * Each returns true when the requirement is met.
 */
export const PASSWORD_REQUIREMENTS = [
  { key: 'minLength', label: 'Minimum 8 characters', test: (v) => v.length >= 8 },
  { key: 'uppercase', label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { key: 'lowercase', label: 'One lowercase letter', test: (v) => /[a-z]/.test(v) },
  { key: 'number', label: 'One number', test: (v) => /\d/.test(v) },
  { key: 'special', label: 'One special character', test: (v) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(v) },
];

/**
 * Calculate password strength based on how many requirements are met.
 * @param {string} password
 * @returns {{ score: number, level: 'weak'|'medium'|'strong', percentage: number }}
 */
export function getPasswordStrength(password) {
  if (!password) return { score: 0, level: 'weak', percentage: 0 };

  const passed = PASSWORD_REQUIREMENTS.filter((r) => r.test(password)).length;
  const percentage = (passed / PASSWORD_REQUIREMENTS.length) * 100;

  if (passed <= 2) return { score: passed, level: 'weak', percentage };
  if (passed <= 4) return { score: passed, level: 'medium', percentage };
  return { score: passed, level: 'strong', percentage };
}

/**
 * Strength level → colour mapping for the strength bar.
 */
export const STRENGTH_COLORS = {
  weak: { bar: 'bg-red-500', text: 'text-red-600' },
  medium: { bar: 'bg-amber-500', text: 'text-amber-600' },
  strong: { bar: 'bg-emerald-500', text: 'text-emerald-600' },
};

/**
 * Validate that the full name is not empty.
 */
export function validateName(value) {
  if (!value || !value.trim()) return 'Full name is required';
  if (value.trim().length < 2) return 'Name must be at least 2 characters';
  return true;
}

/**
 * Validate email format.
 */
export function validateEmail(value) {
  if (!value || !value.trim()) return 'Email is required';
  if (!EMAIL_REGEX.test(value)) return 'Please enter a valid email address';
  return true;
}

/**
 * Validate password against all requirements.
 */
export function validatePassword(value) {
  if (!value) return 'Password is required';
  const failed = PASSWORD_REQUIREMENTS.filter((r) => !r.test(value));
  if (failed.length > 0) return `Password must have: ${failed.map((r) => r.label.toLowerCase()).join(', ')}`;
  return true;
}
