import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import httpStatusCodes from 'http-status-codes';

const mockUpdateUserService = jest.fn();
const mockValidateStringAndThrow = jest.fn();
const mockValidatePositiveIntegerAndThrow = jest.fn();
const mockValidateEmail = jest.fn();
const mockValidatePassword = jest.fn();
const mockLogError = jest.fn();

jest.unstable_mockModule('#services/index.js', () => ({
  updateUserService: mockUpdateUserService,
}));

jest.unstable_mockModule('#common/validations/index.js', () => ({
  validateEmail: mockValidateEmail,
  validatePassword: mockValidatePassword,
  validateStringAndThrow: mockValidateStringAndThrow,
  validatePositiveIntegerAndThrow: mockValidatePositiveIntegerAndThrow,
}));

jest.unstable_mockModule('#common/services/logger/logger.js', () => ({
  logError: mockLogError,
}));

const { updateUserHandler } = await import('#handlers/User/updateUser.js');
const {
  UserValidationError,
  UserUpdateError,
  UserNotFoundError,
  UserEmailAlreadyExistsError,
} = await import('#common/errors/index.js');
const { EMAIL_ERRORS, PASSWORD_ERRORS } = await import(
  '#common/validations/messages.js'
);

describe('updateUserHandler', () => {
  let req, res, next;

  const setupValidValidations = (userId, email) => {
    mockValidatePositiveIntegerAndThrow.mockReturnValue(userId);
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

  const setupInvalidEmail = (userId, errorMessage) => {
    mockValidatePositiveIntegerAndThrow.mockReturnValue(userId);
    mockValidateStringAndThrow.mockImplementation(() => {});
    mockValidateEmail.mockReturnValue({
      valid: false,
      error: errorMessage,
    });
  };

  const setupInvalidPassword = (userId, errorMessage, email) => {
    mockValidatePositiveIntegerAndThrow.mockReturnValue(userId);
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
      params: {},
      body: {},
      headers: {},
      method: 'PUT',
      path: '/api/users/:id',
      ip: '127.0.0.1',
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
    };

    next = jest.fn();
  });

  describe('Cenários de sucesso', () => {
    it('deve atualizar um usuário com email e senha válidos', async () => {
      const userId = 1;
      const validEmail = 'usuario@gmail.com';
      const validPassword = 'Senha123!';
      const fullName = 'João Silva';

      req.params.id = userId.toString();
      req.body = {
        user_email: validEmail,
        user_password: validPassword,
        full_name: fullName,
      };

      setupValidValidations(userId, validEmail);

      const mockUpdatedUser = {
        user_id: userId,
        user_email: validEmail,
        full_name: fullName,
      };

      mockUpdateUserService.mockResolvedValue(mockUpdatedUser);

      await updateUserHandler(req, res, next);

      expect(mockValidatePositiveIntegerAndThrow).toHaveBeenCalledWith(
        userId.toString(),
        'user id',
        UserValidationError,
        mockLogError,
        'UPDATE',
        'USER'
      );
      expect(mockValidateStringAndThrow).toHaveBeenCalledTimes(3);
      expect(mockValidateEmail).toHaveBeenCalledWith(validEmail);
      expect(mockValidatePassword).toHaveBeenCalledWith(validPassword);
      expect(mockUpdateUserService).toHaveBeenCalledWith({
        user_id: userId,
        user_email: validEmail,
        user_password: validPassword,
        full_name: fullName,
      });
      expect(res.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(res.send).toHaveBeenCalledWith(mockUpdatedUser);
    });
  });

  describe('Cenários de erro - Validação de user_id', () => {
    it('deve retornar erro quando user_id não é um inteiro positivo', async () => {
      req.params.id = '0';
      req.body = {
        user_email: 'usuario@gmail.com',
        user_password: 'Senha123!',
        full_name: 'João Silva',
      };

      const validationError = new UserValidationError(
        'Invalid user id: must be a positive integer',
        { 'user id': '0' }
      );

      mockValidatePositiveIntegerAndThrow.mockImplementation(
        (value, fieldName, ErrorClass, logErrorFn, action, entity) => {
          logErrorFn(action, entity, validationError, { [fieldName]: value });
          throw validationError;
        }
      );

      await updateUserHandler(req, res, next);

      expect(mockValidatePositiveIntegerAndThrow).toHaveBeenCalledWith(
        '0',
        'user id',
        UserValidationError,
        mockLogError,
        'UPDATE',
        'USER'
      );
      expect(mockLogError).toHaveBeenCalledWith(
        'UPDATE',
        'USER',
        validationError,
        { 'user id': '0' }
      );
      expect(res.status).toHaveBeenCalledWith(validationError.statusCode);
      expect(res.json).toHaveBeenCalledWith({
        code: validationError.code,
        message: validationError.message,
      });
      expect(res.end).toHaveBeenCalled();
      expect(mockValidateStringAndThrow).not.toHaveBeenCalled();
      expect(mockUpdateUserService).not.toHaveBeenCalled();
    });
  });

  describe('Cenários de erro - Validação de string', () => {
    it('deve retornar erro quando user_email está vazio', async () => {
      req.params.id = '1';
      req.body = {
        user_email: '',
        user_password: 'Senha123!',
        full_name: 'João Silva',
      };

      const validationError = new UserValidationError(
        'Invalid user_email: must be a non-empty string',
        { user_email: '' }
      );

      mockValidatePositiveIntegerAndThrow.mockReturnValue(1);
      mockValidateStringAndThrow.mockImplementation(
        (value, fieldName, ErrorClass, logErrorFn, action, entity, context) => {
          logErrorFn(action, entity, validationError, {
            ...context,
            [fieldName]: value,
          });
          throw validationError;
        }
      );

      await updateUserHandler(req, res, next);

      expect(mockValidateStringAndThrow).toHaveBeenCalledWith(
        '',
        'user_email',
        UserValidationError,
        mockLogError,
        'UPDATE',
        'USER',
        { user_id: 1 }
      );
      expect(mockLogError).toHaveBeenCalledWith(
        'UPDATE',
        'USER',
        validationError,
        { user_id: 1, user_email: '' }
      );
      expect(res.status).toHaveBeenCalledWith(validationError.statusCode);
      expect(res.json).toHaveBeenCalledWith({
        code: validationError.code,
        message: validationError.message,
      });
      expect(res.end).toHaveBeenCalled();
      expect(mockValidateEmail).not.toHaveBeenCalled();
      expect(mockUpdateUserService).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando user_password está vazio', async () => {
      req.params.id = '1';
      req.body = {
        user_email: 'usuario@gmail.com',
        user_password: '',
        full_name: 'João Silva',
      };

      const validationError = new UserValidationError(
        'Invalid user_password: must be a non-empty string',
        { user_password: '' }
      );

      mockValidatePositiveIntegerAndThrow.mockReturnValue(1);
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

      await updateUserHandler(req, res, next);

      expect(mockValidateStringAndThrow).toHaveBeenCalledTimes(2);
      expect(mockLogError).toHaveBeenCalledWith(
        'UPDATE',
        'USER',
        validationError,
        { user_id: 1, user_email: 'usuario@gmail.com', user_password: '' }
      );
      expect(res.status).toHaveBeenCalledWith(validationError.statusCode);
      expect(res.json).toHaveBeenCalledWith({
        code: validationError.code,
        message: validationError.message,
      });
      expect(res.end).toHaveBeenCalled();
      expect(mockValidatePassword).not.toHaveBeenCalled();
      expect(mockUpdateUserService).not.toHaveBeenCalled();
    });
  });

  describe('Cenários de erro - Validação de email', () => {
    it('deve retornar erro quando email tem formato inválido', async () => {
      const invalidEmail = 'email-invalido';
      const validPassword = 'Senha123!';
      const fullName = 'João Silva';

      req.params.id = '1';
      req.body = {
        user_email: invalidEmail,
        user_password: validPassword,
        full_name: fullName,
      };

      setupInvalidEmail(1, EMAIL_ERRORS.INVALID_FORMAT);

      await updateUserHandler(req, res, next);

      expect(mockValidateEmail).toHaveBeenCalledWith(invalidEmail);
      expect(mockLogError).toHaveBeenCalledWith(
        'UPDATE',
        'USER',
        expect.any(UserValidationError),
        { user_id: 1, user_email: invalidEmail }
      );
      expect(res.status).toHaveBeenCalledWith(expect.any(Number));
      expect(res.json).toHaveBeenCalled();
      expect(res.end).toHaveBeenCalled();
      expect(mockUpdateUserService).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando email tem domínio inválido', async () => {
      const invalidEmail = 'usuario@dominioinvalido.com';
      const validPassword = 'Senha123!';
      const fullName = 'João Silva';

      req.params.id = '1';
      req.body = {
        user_email: invalidEmail,
        user_password: validPassword,
        full_name: fullName,
      };

      setupInvalidEmail(1, EMAIL_ERRORS.INVALID_DOMAIN);

      await updateUserHandler(req, res, next);

      expect(mockValidateEmail).toHaveBeenCalledWith(invalidEmail);
      expect(mockLogError).toHaveBeenCalledWith(
        'UPDATE',
        'USER',
        expect.any(UserValidationError),
        { user_id: 1, user_email: invalidEmail }
      );
      expect(res.status).toHaveBeenCalledWith(expect.any(Number));
      expect(res.json).toHaveBeenCalled();
      expect(res.end).toHaveBeenCalled();
      expect(mockUpdateUserService).not.toHaveBeenCalled();
    });
  });

  describe('Cenários de erro - Validação de senha', () => {
    it('deve retornar erro quando senha é muito curta', async () => {
      const validEmail = 'usuario@gmail.com';
      const invalidPassword = 'Senh1!';
      const fullName = 'João Silva';

      req.params.id = '1';
      req.body = {
        user_email: validEmail,
        user_password: invalidPassword,
        full_name: fullName,
      };

      setupInvalidPassword(1, PASSWORD_ERRORS.MIN_LENGTH, validEmail);

      await updateUserHandler(req, res, next);

      expect(mockValidatePassword).toHaveBeenCalledWith(invalidPassword);
      expect(mockLogError).toHaveBeenCalledWith(
        'UPDATE',
        'USER',
        expect.any(UserValidationError),
        { user_id: 1, user_email: validEmail }
      );
      expect(res.status).toHaveBeenCalledWith(expect.any(Number));
      expect(res.json).toHaveBeenCalled();
      expect(res.end).toHaveBeenCalled();
      expect(mockUpdateUserService).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando senha não contém número', async () => {
      const validEmail = 'usuario@gmail.com';
      const invalidPassword = 'SenhaSemNumero!';
      const fullName = 'João Silva';

      req.params.id = '1';
      req.body = {
        user_email: validEmail,
        user_password: invalidPassword,
        full_name: fullName,
      };

      setupInvalidPassword(1, PASSWORD_ERRORS.NO_NUMBER, validEmail);

      await updateUserHandler(req, res, next);

      expect(mockValidatePassword).toHaveBeenCalledWith(invalidPassword);
      expect(mockLogError).toHaveBeenCalledWith(
        'UPDATE',
        'USER',
        expect.any(UserValidationError),
        { user_id: 1, user_email: validEmail }
      );
      expect(res.status).toHaveBeenCalledWith(expect.any(Number));
      expect(res.json).toHaveBeenCalled();
      expect(res.end).toHaveBeenCalled();
      expect(mockUpdateUserService).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando senha não contém caractere especial', async () => {
      const validEmail = 'usuario@gmail.com';
      const invalidPassword = 'Senha123';
      const fullName = 'João Silva';

      req.params.id = '1';
      req.body = {
        user_email: validEmail,
        user_password: invalidPassword,
        full_name: fullName,
      };

      setupInvalidPassword(1, PASSWORD_ERRORS.NO_SPECIAL_CHAR, validEmail);

      await updateUserHandler(req, res, next);

      expect(mockValidatePassword).toHaveBeenCalledWith(invalidPassword);
      expect(mockLogError).toHaveBeenCalledWith(
        'UPDATE',
        'USER',
        expect.any(UserValidationError),
        { user_id: 1, user_email: validEmail }
      );
      expect(res.status).toHaveBeenCalledWith(expect.any(Number));
      expect(res.json).toHaveBeenCalled();
      expect(res.end).toHaveBeenCalled();
      expect(mockUpdateUserService).not.toHaveBeenCalled();
    });
  });

  describe('Cenários de erro - Service', () => {
    it('deve retornar erro quando usuário não é encontrado', async () => {
      const userId = 999;
      const validEmail = 'usuario@gmail.com';
      const validPassword = 'Senha123!';
      const fullName = 'João Silva';

      req.params.id = userId.toString();
      req.body = {
        user_email: validEmail,
        user_password: validPassword,
        full_name: fullName,
      };

      setupValidValidations(userId, validEmail);

      const notFoundError = new UserNotFoundError(userId);
      mockUpdateUserService.mockRejectedValue(notFoundError);

      await updateUserHandler(req, res, next);

      expect(mockUpdateUserService).toHaveBeenCalledWith({
        user_id: userId,
        user_email: validEmail,
        user_password: validPassword,
        full_name: fullName,
      });
      expect(res.status).toHaveBeenCalledWith(notFoundError.statusCode);
      expect(res.json).toHaveBeenCalledWith({
        code: notFoundError.code,
        message: notFoundError.message,
      });
      expect(res.end).toHaveBeenCalled();
      
    });

    it('deve retornar erro quando email já existe', async () => {
      const userId = 1;
      const validEmail = 'usuario@gmail.com';
      const validPassword = 'Senha123!';
      const fullName = 'João Silva';

      req.params.id = userId.toString();
      req.body = {
        user_email: validEmail,
        user_password: validPassword,
        full_name: fullName,
      };

      setupValidValidations(userId, validEmail);

      const emailExistsError = new UserEmailAlreadyExistsError(validEmail);
      mockUpdateUserService.mockRejectedValue(emailExistsError);

      await updateUserHandler(req, res, next);

      expect(mockUpdateUserService).toHaveBeenCalledWith({
        user_id: userId,
        user_email: validEmail,
        user_password: validPassword,
        full_name: fullName,
      });
      expect(res.status).toHaveBeenCalledWith(emailExistsError.statusCode);
      expect(res.json).toHaveBeenCalledWith({
        code: emailExistsError.code,
        message: emailExistsError.message,
      });
      expect(res.end).toHaveBeenCalled();
      
    });

    it('deve retornar erro quando service lança exceção genérica', async () => {
      const userId = 1;
      const validEmail = 'usuario@gmail.com';
      const validPassword = 'Senha123!';
      const fullName = 'João Silva';

      req.params.id = userId.toString();
      req.body = {
        user_email: validEmail,
        user_password: validPassword,
        full_name: fullName,
      };

      setupValidValidations(userId, validEmail);

      const serviceError = new UserUpdateError(userId, 'Failed to update user');
      mockUpdateUserService.mockRejectedValue(serviceError);

      await updateUserHandler(req, res, next);

      expect(mockUpdateUserService).toHaveBeenCalledWith({
        user_id: userId,
        user_email: validEmail,
        user_password: validPassword,
        full_name: fullName,
      });
      expect(res.status).toHaveBeenCalledWith(serviceError.statusCode);
      expect(res.json).toHaveBeenCalledWith({
        code: serviceError.code,
        message: serviceError.message,
      });
      expect(res.end).toHaveBeenCalled();
      
    });
  });
});

