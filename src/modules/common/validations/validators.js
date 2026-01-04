import {
  EMAIL_REGEX,
  VALID_EMAIL_DOMAINS,
  SUSPICIOUS_DOMAINS,
} from './regex.js';
import { PASSWORD_ERRORS, EMAIL_ERRORS } from './messages.js';

const validatePassword = (password) => {
  if (!password) {
    return {
      valid: false,
      error: PASSWORD_ERRORS.REQUIRED,
    };
  }

  if (password.length < 7) {
    return {
      valid: false,
      error: PASSWORD_ERRORS.MIN_LENGTH,
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      error: PASSWORD_ERRORS.NO_NUMBER,
    };
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      valid: false,
      error: PASSWORD_ERRORS.NO_SPECIAL_CHAR,
    };
  }

  if (!/[a-zA-Z]/.test(password)) {
    return {
      valid: false,
      error: PASSWORD_ERRORS.NO_LETTER,
    };
  }

  return {
    valid: true,
    error: null,
  };
};

const validateEmail = (email) => {
  if (!email) {
    return {
      valid: false,
      error: EMAIL_ERRORS.REQUIRED,
    };
  }

  email = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(email)) {
    return {
      valid: false,
      error: EMAIL_ERRORS.INVALID_FORMAT,
    };
  }

  const domain = email.split('@')[1];

  for (const suspiciousPattern of SUSPICIOUS_DOMAINS) {
    if (suspiciousPattern.test(`@${domain}`)) {
      return {
        valid: false,
        error: EMAIL_ERRORS.SUSPICIOUS_DOMAIN,
      };
    }
  }

  const isValidDomain = VALID_EMAIL_DOMAINS.some(
    (validDomain) =>
      domain === validDomain || domain.endsWith(`.${validDomain}`)
  );

  if (!isValidDomain) {
    return {
      valid: false,
      error: EMAIL_ERRORS.INVALID_DOMAIN,
    };
  }

  return {
    valid: true,
    error: null,
    email: email,
  };
};

const validateUserCredentials = (email, password) => {
  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password);

  return {
    valid: emailValidation.valid && passwordValidation.valid,
    email: emailValidation,
    password: passwordValidation,
  };
};

export { validatePassword, validateEmail, validateUserCredentials };
