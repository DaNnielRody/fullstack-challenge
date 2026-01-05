import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  validateEmail,
  validatePassword,
  validateUserCredentials,
} from '#common/validations/index.js';
import { EMAIL_ERRORS, PASSWORD_ERRORS } from '#common/validations/messages.js';

describe('validateEmail', () => {
  describe('Cenários de sucesso', () => {
    it('deve validar email com domínio gmail.com', () => {
      const result = validateEmail('usuario@gmail.com');

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
      expect(result.email).toBe('usuario@gmail.com');
    });

    it('deve validar email com domínio outlook.com', () => {
      const result = validateEmail('usuario@outlook.com');

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
      expect(result.email).toBe('usuario@outlook.com');
    });

    it('deve validar email com domínio yahoo.com', () => {
      const result = validateEmail('usuario@yahoo.com');

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
      expect(result.email).toBe('usuario@yahoo.com');
    });

    it('deve validar email com subdomínio válido', () => {
      const result = validateEmail('usuario@mail.gmail.com');

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
      expect(result.email).toBe('usuario@mail.gmail.com');
    });

    it('deve normalizar email (trim e lowercase)', () => {
      const result = validateEmail('  Usuario@Gmail.COM  ');

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
      expect(result.email).toBe('usuario@gmail.com');
    });

    it('deve validar email com domínio .edu', () => {
      const result = validateEmail('aluno@universidade.edu');

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
      expect(result.email).toBe('aluno@universidade.edu');
    });

    it('deve validar email com domínio .edu.br', () => {
      const result = validateEmail('aluno@universidade.edu.br');

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
      expect(result.email).toBe('aluno@universidade.edu.br');
    });
  });

  describe('Cenários de erro', () => {
    it('deve retornar erro quando email é vazio', () => {
      const result = validateEmail('');

      expect(result.valid).toBe(false);
      expect(result.error).toBe(EMAIL_ERRORS.REQUIRED);
    });

    it('deve retornar erro quando email é null', () => {
      const result = validateEmail(null);

      expect(result.valid).toBe(false);
      expect(result.error).toBe(EMAIL_ERRORS.REQUIRED);
    });

    it('deve retornar erro quando email é undefined', () => {
      const result = validateEmail(undefined);

      expect(result.valid).toBe(false);
      expect(result.error).toBe(EMAIL_ERRORS.REQUIRED);
    });

    it('deve retornar erro quando formato de email é inválido', () => {
      const result = validateEmail('email-invalido');

      expect(result.valid).toBe(false);
      expect(result.error).toBe(EMAIL_ERRORS.INVALID_FORMAT);
    });

    it('deve retornar erro quando email não tem @', () => {
      const result = validateEmail('usuario.gmail.com');

      expect(result.valid).toBe(false);
      expect(result.error).toBe(EMAIL_ERRORS.INVALID_FORMAT);
    });

    it('deve retornar erro quando email não tem domínio', () => {
      const result = validateEmail('usuario@');

      expect(result.valid).toBe(false);
      expect(result.error).toBe(EMAIL_ERRORS.INVALID_FORMAT);
    });

    it('deve retornar erro quando domínio é suspeito (gmai.com)', () => {
      const result = validateEmail('usuario@gmai.com');

      expect(result.valid).toBe(false);
      expect(result.error).toBe(EMAIL_ERRORS.SUSPICIOUS_DOMAIN);
    });

    it('deve retornar erro quando domínio é suspeito (test.com)', () => {
      const result = validateEmail('usuario@test.com');

      expect(result.valid).toBe(false);
      expect(result.error).toBe(EMAIL_ERRORS.SUSPICIOUS_DOMAIN);
    });

    it('deve retornar erro quando domínio é suspeito (example.com)', () => {
      const result = validateEmail('usuario@example.com');

      expect(result.valid).toBe(false);
      expect(result.error).toBe(EMAIL_ERRORS.SUSPICIOUS_DOMAIN);
    });

    it('deve retornar erro quando domínio não é reconhecido', () => {
      const result = validateEmail('usuario@dominioinvalido.com');

      expect(result.valid).toBe(false);
      expect(result.error).toBe(EMAIL_ERRORS.INVALID_DOMAIN);
    });

    it('deve retornar erro quando domínio não está na lista de válidos', () => {
      const result = validateEmail('usuario@empresa.com');

      expect(result.valid).toBe(false);
      expect(result.error).toBe(EMAIL_ERRORS.INVALID_DOMAIN);
    });
  });
});

describe('validatePassword', () => {
  describe('Cenários de sucesso', () => {
    it('deve validar senha com todos os requisitos', () => {
      const result = validatePassword('Senha123!');

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('deve validar senha com 7 caracteres (mínimo)', () => {
      const result = validatePassword('Senh1!@');

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('deve validar senha com múltiplos caracteres especiais', () => {
      const result = validatePassword('Senha123!@#$%');

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('deve validar senha com números no meio', () => {
      const result = validatePassword('Senha123!Teste');

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe('Cenários de erro', () => {
    it('deve retornar erro quando senha é vazia', () => {
      const result = validatePassword('');

      expect(result.valid).toBe(false);
      expect(result.error).toBe(PASSWORD_ERRORS.REQUIRED);
    });

    it('deve retornar erro quando senha é null', () => {
      const result = validatePassword(null);

      expect(result.valid).toBe(false);
      expect(result.error).toBe(PASSWORD_ERRORS.REQUIRED);
    });

    it('deve retornar erro quando senha é undefined', () => {
      const result = validatePassword(undefined);

      expect(result.valid).toBe(false);
      expect(result.error).toBe(PASSWORD_ERRORS.REQUIRED);
    });

    it('deve retornar erro quando senha tem menos de 7 caracteres', () => {
      const result = validatePassword('Senh1!');

      expect(result.valid).toBe(false);
      expect(result.error).toBe(PASSWORD_ERRORS.MIN_LENGTH);
    });

    it('deve retornar erro quando senha não contém número', () => {
      const result = validatePassword('SenhaSemNumero!');

      expect(result.valid).toBe(false);
      expect(result.error).toBe(PASSWORD_ERRORS.NO_NUMBER);
    });

    it('deve retornar erro quando senha não contém caractere especial', () => {
      const result = validatePassword('Senha123');

      expect(result.valid).toBe(false);
      expect(result.error).toBe(PASSWORD_ERRORS.NO_SPECIAL_CHAR);
    });

    it('deve retornar erro quando senha não contém letra', () => {
      const result = validatePassword('1234567!');

      expect(result.valid).toBe(false);
      expect(result.error).toBe(PASSWORD_ERRORS.NO_LETTER);
    });

    it('deve retornar erro quando senha tem apenas números e caracteres especiais', () => {
      const result = validatePassword('1234567!@#');

      expect(result.valid).toBe(false);
      expect(result.error).toBe(PASSWORD_ERRORS.NO_LETTER);
    });

    it('deve retornar erro quando senha tem apenas letras e números', () => {
      const result = validatePassword('Senha123');

      expect(result.valid).toBe(false);
      expect(result.error).toBe(PASSWORD_ERRORS.NO_SPECIAL_CHAR);
    });
  });
});

describe('validateUserCredentials', () => {
  describe('Cenários de sucesso', () => {
    it('deve validar credenciais válidas', () => {
      const result = validateUserCredentials(
        'usuario@gmail.com',
        'Senha123!'
      );

      expect(result.valid).toBe(true);
      expect(result.email.valid).toBe(true);
      expect(result.password.valid).toBe(true);
    });
  });

  describe('Cenários de erro', () => {
    it('deve retornar inválido quando email é inválido', () => {
      const result = validateUserCredentials('email-invalido', 'Senha123!');

      expect(result.valid).toBe(false);
      expect(result.email.valid).toBe(false);
      expect(result.password.valid).toBe(true);
    });

    it('deve retornar inválido quando senha é inválida', () => {
      const result = validateUserCredentials(
        'usuario@gmail.com',
        'Senha123'
      );

      expect(result.valid).toBe(false);
      expect(result.email.valid).toBe(true);
      expect(result.password.valid).toBe(false);
    });

    it('deve retornar inválido quando ambos são inválidos', () => {
      const result = validateUserCredentials('email-invalido', 'Senha123');

      expect(result.valid).toBe(false);
      expect(result.email.valid).toBe(false);
      expect(result.password.valid).toBe(false);
    });
  });
});

