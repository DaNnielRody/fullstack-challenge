import {
  EMAIL_REGEX,
  VALID_EMAIL_DOMAINS,
  SUSPICIOUS_DOMAINS,
} from './regex.js';
import { PASSWORD_ERRORS, EMAIL_ERRORS } from './messages.js';

/**
 * Valida se a senha atende aos critérios de segurança.
 *
 * @description
 * Garante que a senha atenda aos requisitos mínimos de segurança.
 * Após essa validação, o restante do fluxo pode assumir que a senha é válida.
 * Esta validação fecha o ciclo de responsabilidade dentro da lógica da aplicação.
 *
 * @param {string} password - Senha a ser validada
 *
 * @returns {Object} Resultado da validação
 * @returns {boolean} returns.valid - true se a senha é válida, false caso contrário
 * @returns {string|null} returns.error - Mensagem de erro se inválida, null se válida
 *
 * @example
 * // Senha válida
 * validatePassword("Senha123!") // { valid: true, error: null }
 *
 * // Senha inválida (muito curta)
 * validatePassword("123") // { valid: false, error: "Password must be at least 8 characters long" }
 */
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

/**
 * Valida se o email está em formato válido e pertence a um domínio permitido.
 *
 * @description
 * Garante que o email esteja em formato válido e não seja de domínios suspeitos.
 * Após essa validação, o restante do fluxo pode assumir que o email é válido.
 * Esta validação fecha o ciclo de responsabilidade dentro da lógica da aplicação.
 *
 * @param {string} email - Email a ser validado
 *
 * @returns {Object} Resultado da validação
 * @returns {boolean} returns.valid - true se o email é válido, false caso contrário
 * @returns {string|null} returns.error - Mensagem de erro se inválido, null se válido
 * @returns {string} [returns.email] - Email normalizado (trim e lowercase) se válido
 *
 * @example
 * // Email válido
 * validateEmail("usuario@gmail.com") // { valid: true, error: null, email: "usuario@gmail.com" }
 *
 * // Email inválido (domínio suspeito)
 * validateEmail("test@tempmail.com") // { valid: false, error: "Email domain is not allowed" }
 */
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
