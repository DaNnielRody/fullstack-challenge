const PASSWORD_REGEX =
  /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{7,}$/;

const PASSWORD_REGEX_STRONG =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{7,}$/;

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const VALID_EMAIL_DOMAINS = [
  'gmail.com',
  'outlook.com',
  'hotmail.com',
  'yahoo.com',
  'icloud.com',
  'live.com',
  'msn.com',
  'yahoo.com.br',
  'ymail.com',
  'protonmail.com',
  'aol.com',
  'zoho.com',
  'mail.com',
  'uol.com.br',
  'bol.com.br',
  'terra.com.br',
  'ig.com.br',
  'edu',
  'edu.br',
  'ac.uk',
];

const SUSPICIOUS_DOMAINS = [
  /^@gmai\.com$/i,
  /^@gmial\.com$/i,
  /^@gmaill\.com$/i,
  /^@gmeil\.com$/i,
  /^@gnail\.com$/i,
  /^@gamil\.com$/i,
  /^@outlok\.com$/i,
  /^@hotmial\.com$/i,
  /^@yaho\.com$/i,
  /^@teste\.com$/i,
  /^@test\.com$/i,
  /^@example\.com$/i,
  /^@email\.com$/i,
];

export {
  PASSWORD_REGEX,
  PASSWORD_REGEX_STRONG,
  EMAIL_REGEX,
  VALID_EMAIL_DOMAINS,
  SUSPICIOUS_DOMAINS,
};
