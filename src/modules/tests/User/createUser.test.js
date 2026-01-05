import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import httpStatusCodes from 'http-status-codes';

const mockCreateUserService = jest.fn();
const mockValidateStringAndThrow = jest.fn();
const mockValidateEmail = jest.fn();
const mockValidatePassword = jest.fn();
const mockLogError = jest.fn();
const mockHttpErrorHandler = jest.fn(({ res, error }) => {
  return res.status(error.statusCode || 500).json({
    error: error.message,
    code: error.code,
    details: error.details,
  });
});

jest.unstable_mockModule('#services/index.js', () => ({
  createUserService: mockCreateUserService,
}));

jest.unstable_mockModule('#common/validations/index.js', () => ({
  validateEmail: mockValidateEmail,
  validatePassword: mockValidatePassword,
  validateStringAndThrow: mockValidateStringAndThrow,
}));

jest.unstable_mockModule('#common/services/logger/logger.js', () => ({
  logError: mockLogError,
}));

jest.unstable_mockModule('#common/handlers/index.js', () => ({
  httpErrorHandler: mockHttpErrorHandler,
}));

const { createUserHandler } = await import('#handlers/User/createUser.js');
const { UserValidationError, UserCreationError } = await import(
  '#common/errors/index.js'
);
const { EMAIL_ERRORS, PASSWORD_ERRORS } = await import(
  '#common/validations/messages.js'
);

describe('createUserHandler', () => {
  let req, res, next;

  const setupValidValidations = (email) => {
    mockValidateStringAndThrow.mockImplementation(() => {});
    mockValidateEmail.mockReturnValue({
      valid: true,
      error: null,
      email: email?.toLowerCase().trim(),
    });
    mockValidatePassword.mockReturnValue({
      valid: true,
      error: null,
    });
  };

  const setupInvalidEmail = (errorMessage) => {
    mockValidateStringAndThrow.mockImplementation(() => {});
    mockValidateEmail.mockReturnValue({
      valid: false,
      error: errorMessage,
    });
  };

  const setupInvalidPassword = (errorMessage, email) => {
    mockValidateStringAndThrow.mockImplementation(() => {});
    mockValidateEmail.mockReturnValue({
      valid: true,
      error: null,
      email: email?.toLowerCase().trim(),
    });
    mockValidatePassword.mockReturnValue({
      valid: false,
      error: errorMessage,
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    next = jest.fn();
  });

  describe('Cenários de sucesso', () => {
    it('deve criar um usuário com email e senha válidos', async () => {
      const validEmail = 'usuario@gmail.com';
      const validPassword = 'Senha123!';
      const fullName = 'João Silva';

      req.body = {
        user_email: validEmail,
        user_password: validPassword,
        full_name: fullName,
      };

      setupValidValidations(validEmail);

      const mockCreatedUser = {
        user_id: 1,
        user_email: validEmail,
        full_name: fullName,
      };

      mockCreateUserService.mockResolvedValue(mockCreatedUser);

      await createUserHandler(req, res, next);

      expect(mockValidateStringAndThrow).toHaveBeenCalledTimes(3);
      expect(mockValidateEmail).toHaveBeenCalledWith(validEmail);
      expect(mockValidatePassword).toHaveBeenCalledWith(validPassword);
      expect(mockCreateUserService).toHaveBeenCalledWith({
        user_email: validEmail,
        user_password: validPassword,
        full_name: fullName,
      });
      expect(res.status).toHaveBeenCalledWith(httpStatusCodes.CREATED);
      expect(res.send).toHaveBeenCalledWith(mockCreatedUser);
    });
  });

  describe('Cenários de erro - Validação de string', () => {
    it('deve retornar erro quando user_email está vazio', async () => {
      req.body = {
        user_email: '',
        user_password: 'Senha123!',
        full_name: 'João Silva',
      };

      const validationError = new UserValidationError(
        'Invalid user_email: must be a non-empty string',
        { user_email: '' }
      );

      mockValidateStringAndThrow.mockImplementation(
        (value, fieldName, ErrorClass, logErrorFn, action, entity, context) => {
          logErrorFn(action, entity, validationError, { [fieldName]: value });
          throw validationError;
        }
      );

      await createUserHandler(req, res, next);

      expect(mockValidateStringAndThrow).toHaveBeenCalledWith(
        '',
        'user_email',
        UserValidationError,
        mockLogError,
        'CREATE',
        'USER'
      );
      expect(mockLogError).toHaveBeenCalledWith(
        'CREATE',
        'USER',
        validationError,
        { user_email: '' }
      );
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: validationError,
      });
      expect(mockValidateEmail).not.toHaveBeenCalled();
      expect(mockCreateUserService).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando user_password está vazio', async () => {
      req.body = {
        user_email: 'usuario@gmail.com',
        user_password: '',
        full_name: 'João Silva',
      };

      const validationError = new UserValidationError(
        'Invalid user_password: must be a non-empty string',
        { user_password: '' }
      );

      mockValidateStringAndThrow
        .mockImplementationOnce(() => {})
        .mockImplementationOnce(
          (value, fieldName, ErrorClass, logErrorFn, action, entity, context) => {
            logErrorFn(action, entity, validationError, {
              ...context,
              [fieldName]: value,
            });
            throw validationError; 
          }
        );

      mockValidateEmail.mockReturnValue({
        valid: true,
        error: null,
        email: 'usuario@gmail.com',
      });

      await createUserHandler(req, res, next);

      expect(mockValidateStringAndThrow).toHaveBeenCalledTimes(2);
      expect(mockLogError).toHaveBeenCalledWith(
        'CREATE',
        'USER',
        validationError,
        { user_email: 'usuario@gmail.com', user_password: '' }
      );
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: validationError,
      });
      expect(mockValidatePassword).not.toHaveBeenCalled();
      expect(mockCreateUserService).not.toHaveBeenCalled();
    });
  });

  describe('Cenários de erro - Validação de email', () => {
    it('deve retornar erro quando email tem formato inválido', async () => {
      const invalidEmail = 'email-invalido';
      const validPassword = 'Senha123!';
      const fullName = 'João Silva';

      req.body = {
        user_email: invalidEmail,
        user_password: validPassword,
        full_name: fullName,
      };

      setupInvalidEmail(EMAIL_ERRORS.INVALID_FORMAT);

      await createUserHandler(req, res, next);

      expect(mockValidateEmail).toHaveBeenCalledWith(invalidEmail);
      expect(mockLogError).toHaveBeenCalledWith(
        'CREATE',
        'USER',
        expect.any(UserValidationError),
        { user_email: invalidEmail }
      );
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: expect.any(UserValidationError),
      });
      expect(mockCreateUserService).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando email tem domínio inválido', async () => {
      const invalidEmail = 'usuario@dominioinvalido.com';
      const validPassword = 'Senha123!';
      const fullName = 'João Silva';

      req.body = {
        user_email: invalidEmail,
        user_password: validPassword,
        full_name: fullName,
      };

      setupInvalidEmail(EMAIL_ERRORS.INVALID_DOMAIN);

      await createUserHandler(req, res, next);

      expect(mockValidateEmail).toHaveBeenCalledWith(invalidEmail);
      expect(mockLogError).toHaveBeenCalledWith(
        'CREATE',
        'USER',
        expect.any(UserValidationError),
        { user_email: invalidEmail }
      );
      expect(mockHttpErrorHandler).toHaveBeenCalled();
      expect(mockCreateUserService).not.toHaveBeenCalled();
    });
  });

  describe('Cenários de erro - Validação de senha', () => {
    it('deve retornar erro quando senha é muito curta', async () => {
      const validEmail = 'usuario@gmail.com';
      const invalidPassword = 'Senh1!';
      const fullName = 'João Silva';

      req.body = {
        user_email: validEmail,
        user_password: invalidPassword,
        full_name: fullName,
      };

      setupInvalidPassword(PASSWORD_ERRORS.MIN_LENGTH, validEmail);

      await createUserHandler(req, res, next);

      expect(mockValidatePassword).toHaveBeenCalledWith(invalidPassword);
      expect(mockLogError).toHaveBeenCalledWith(
        'CREATE',
        'USER',
        expect.any(UserValidationError),
        { user_email: validEmail }
      );
      expect(mockHttpErrorHandler).toHaveBeenCalled();
      expect(mockCreateUserService).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando senha não contém número', async () => {
      const validEmail = 'usuario@gmail.com';
      const invalidPassword = 'SenhaSemNumero!';
      const fullName = 'João Silva';

      req.body = {
        user_email: validEmail,
        user_password: invalidPassword,
        full_name: fullName,
      };

      setupInvalidPassword(PASSWORD_ERRORS.NO_NUMBER, validEmail);

      await createUserHandler(req, res, next);

      expect(mockValidatePassword).toHaveBeenCalledWith(invalidPassword);
      expect(mockLogError).toHaveBeenCalledWith(
        'CREATE',
        'USER',
        expect.any(UserValidationError),
        { user_email: validEmail }
      );
      expect(mockHttpErrorHandler).toHaveBeenCalled();
      expect(mockCreateUserService).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando senha não contém caractere especial', async () => {
      const validEmail = 'usuario@gmail.com';
      const invalidPassword = 'Senha123';
      const fullName = 'João Silva';

      req.body = {
        user_email: validEmail,
        user_password: invalidPassword,
        full_name: fullName,
      };

      setupInvalidPassword(PASSWORD_ERRORS.NO_SPECIAL_CHAR, validEmail);

      await createUserHandler(req, res, next);

      expect(mockValidatePassword).toHaveBeenCalledWith(invalidPassword);
      expect(mockLogError).toHaveBeenCalledWith(
        'CREATE',
        'USER',
        expect.any(UserValidationError),
        { user_email: validEmail }
      );
      expect(mockHttpErrorHandler).toHaveBeenCalled();
      expect(mockCreateUserService).not.toHaveBeenCalled();
    });
  });

  describe('Cenários de erro - Service', () => {
    it('deve retornar erro quando service lança exceção', async () => {
      const validEmail = 'usuario@gmail.com';
      const validPassword = 'Senha123!';
      const fullName = 'João Silva';

      req.body = {
        user_email: validEmail,
        user_password: validPassword,
        full_name: fullName,
      };

      setupValidValidations(validEmail);

      const serviceError = new UserCreationError('Failed to create user');
      mockCreateUserService.mockRejectedValue(serviceError);

      await createUserHandler(req, res, next);

      expect(mockCreateUserService).toHaveBeenCalledWith({
        user_email: validEmail,
        user_password: validPassword,
        full_name: fullName,
      });
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: serviceError,
      });
      expect(res.status).not.toHaveBeenCalledWith(httpStatusCodes.CREATED);
      expect(res.send).not.toHaveBeenCalled();
    });
  });
});
