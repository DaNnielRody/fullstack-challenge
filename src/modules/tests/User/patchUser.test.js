import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import httpStatusCodes from 'http-status-codes';

const mockPatchUserService = jest.fn();
const mockValidateStringAndThrow = jest.fn();
const mockValidatePositiveIntegerAndThrow = jest.fn();
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
  patchUserService: mockPatchUserService,
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

jest.unstable_mockModule('#common/handlers/index.js', () => ({
  httpErrorHandler: mockHttpErrorHandler,
}));

const { patchUserHandler } = await import('#handlers/User/patchUser.js');
const {
  UserValidationError,
  UserUpdateError,
  UserNotFoundError,
  UserEmailAlreadyExistsError,
} = await import('#common/errors/index.js');
const { EMAIL_ERRORS, PASSWORD_ERRORS } = await import(
  '#common/validations/messages.js'
);

describe('patchUserHandler', () => {
  let req, res, next;

  const setupValidValidations = (userId, email) => {
    mockValidatePositiveIntegerAndThrow.mockReturnValue(userId);
    mockValidateStringAndThrow.mockImplementation(() => {});
    if (email) {
      mockValidateEmail.mockReturnValue({
        valid: true,
        error: null,
        email: email?.toLowerCase().trim(),
      });
    }
    if (email) {
      mockValidatePassword.mockReturnValue({
        valid: true,
        error: null,
      });
    }
  };

  const setupInvalidEmail = (userId, errorMessage) => {
    mockValidatePositiveIntegerAndThrow.mockReturnValue(userId);
    mockValidateStringAndThrow.mockImplementation(() => {});
    mockValidateEmail.mockReturnValue({
      valid: false,
      error: errorMessage,
    });
  };

  const setupInvalidPassword = (userId, errorMessage) => {
    mockValidatePositiveIntegerAndThrow.mockReturnValue(userId);
    mockValidateStringAndThrow.mockImplementation(() => {});
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
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    next = jest.fn();
  });

  describe('Cenários de sucesso', () => {
    it('deve atualizar apenas o email do usuário', async () => {
      const userId = 1;
      const newEmail = 'novoemail@gmail.com';

      req.params.id = userId.toString();
      req.body = {
        user_email: newEmail,
      };

      setupValidValidations(userId, newEmail);

      const mockUpdatedUser = {
        user_id: userId,
        user_email: newEmail,
        full_name: 'João Silva',
      };

      mockPatchUserService.mockResolvedValue(mockUpdatedUser);

      await patchUserHandler(req, res, next);

      expect(mockValidatePositiveIntegerAndThrow).toHaveBeenCalledWith(
        userId.toString(),
        'user id',
        UserValidationError,
        mockLogError,
        'PATCH',
        'USER'
      );
      expect(mockValidateStringAndThrow).toHaveBeenCalledWith(
        newEmail,
        'user_email',
        UserValidationError,
        mockLogError,
        'PATCH',
        'USER',
        { user_id: userId }
      );
      expect(mockValidateEmail).toHaveBeenCalledWith(newEmail);
      expect(mockPatchUserService).toHaveBeenCalledWith({
        user_id: userId,
        user_email: newEmail,
        user_password: undefined,
        full_name: undefined,
      });
      expect(res.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(res.send).toHaveBeenCalledWith(mockUpdatedUser);
    });

    it('deve atualizar apenas a senha do usuário', async () => {
      const userId = 1;
      const newPassword = 'NovaSenha123!';

      req.params.id = userId.toString();
      req.body = {
        user_password: newPassword,
      };

      setupValidValidations(userId);

      mockValidatePassword.mockReturnValue({
        valid: true,
        error: null,
      });

      const mockUpdatedUser = {
        user_id: userId,
        user_email: 'usuario@gmail.com',
        full_name: 'João Silva',
      };

      mockPatchUserService.mockResolvedValue(mockUpdatedUser);

      await patchUserHandler(req, res, next);

      expect(mockValidateStringAndThrow).toHaveBeenCalledWith(
        newPassword,
        'user_password',
        UserValidationError,
        mockLogError,
        'PATCH',
        'USER',
        { user_id: userId }
      );
      expect(mockValidatePassword).toHaveBeenCalledWith(newPassword);
      expect(mockPatchUserService).toHaveBeenCalledWith({
        user_id: userId,
        user_email: undefined,
        user_password: newPassword,
        full_name: undefined,
      });
      expect(res.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(res.send).toHaveBeenCalledWith(mockUpdatedUser);
    });

    it('deve atualizar apenas o full_name do usuário', async () => {
      const userId = 1;
      const newFullName = 'João Silva Santos';

      req.params.id = userId.toString();
      req.body = {
        full_name: newFullName,
      };

      mockValidatePositiveIntegerAndThrow.mockReturnValue(userId);

      const mockUpdatedUser = {
        user_id: userId,
        user_email: 'usuario@gmail.com',
        full_name: newFullName,
      };

      mockPatchUserService.mockResolvedValue(mockUpdatedUser);

      await patchUserHandler(req, res, next);

      expect(mockPatchUserService).toHaveBeenCalledWith({
        user_id: userId,
        user_email: undefined,
        user_password: undefined,
        full_name: newFullName,
      });
      expect(res.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(res.send).toHaveBeenCalledWith(mockUpdatedUser);
    });

    it('deve atualizar múltiplos campos do usuário', async () => {
      const userId = 1;
      const newEmail = 'novoemail@gmail.com';
      const newPassword = 'NovaSenha123!';
      const newFullName = 'João Silva Santos';

      req.params.id = userId.toString();
      req.body = {
        user_email: newEmail,
        user_password: newPassword,
        full_name: newFullName,
      };

      setupValidValidations(userId, newEmail);
      mockValidatePassword.mockReturnValue({
        valid: true,
        error: null,
      });

      const mockUpdatedUser = {
        user_id: userId,
        user_email: newEmail,
        full_name: newFullName,
      };

      mockPatchUserService.mockResolvedValue(mockUpdatedUser);

      await patchUserHandler(req, res, next);

      expect(mockValidateEmail).toHaveBeenCalledWith(newEmail);
      expect(mockValidatePassword).toHaveBeenCalledWith(newPassword);
      expect(mockPatchUserService).toHaveBeenCalledWith({
        user_id: userId,
        user_email: newEmail,
        user_password: newPassword,
        full_name: newFullName,
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

      await patchUserHandler(req, res, next);

      expect(mockValidatePositiveIntegerAndThrow).toHaveBeenCalledWith(
        '0',
        'user id',
        UserValidationError,
        mockLogError,
        'PATCH',
        'USER'
      );
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: validationError,
      });
      expect(mockPatchUserService).not.toHaveBeenCalled();
    });
  });

  describe('Cenários de erro - Validação de campos', () => {
    it('deve retornar erro quando nenhum campo é fornecido', async () => {
      const userId = 1;

      req.params.id = userId.toString();
      req.body = {};

      mockValidatePositiveIntegerAndThrow.mockReturnValue(userId);

      await patchUserHandler(req, res, next);

      expect(mockLogError).toHaveBeenCalledWith(
        'PATCH',
        'USER',
        expect.any(UserValidationError),
        { user_id: userId }
      );
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: expect.any(UserValidationError),
      });
      expect(mockPatchUserService).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando user_email está vazio', async () => {
      const userId = 1;

      req.params.id = userId.toString();
      req.body = {
        user_email: '',
      };

      mockValidatePositiveIntegerAndThrow.mockReturnValue(userId);

      await patchUserHandler(req, res, next);

      expect(mockLogError).toHaveBeenCalledWith(
        'PATCH',
        'USER',
        expect.any(UserValidationError),
        { user_id: userId }
      );
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: expect.any(UserValidationError),
      });
      expect(mockValidateStringAndThrow).not.toHaveBeenCalled();
      expect(mockValidateEmail).not.toHaveBeenCalled();
      expect(mockPatchUserService).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando user_password está vazio', async () => {
      const userId = 1;

      req.params.id = userId.toString();
      req.body = {
        user_password: '',
      };

      mockValidatePositiveIntegerAndThrow.mockReturnValue(userId);

      await patchUserHandler(req, res, next);

      expect(mockLogError).toHaveBeenCalledWith(
        'PATCH',
        'USER',
        expect.any(UserValidationError),
        { user_id: userId }
      );
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: expect.any(UserValidationError),
      });
      expect(mockValidateStringAndThrow).not.toHaveBeenCalled();
      expect(mockValidatePassword).not.toHaveBeenCalled();
      expect(mockPatchUserService).not.toHaveBeenCalled();
    });
  });

  describe('Cenários de erro - Validação de email', () => {
    it('deve retornar erro quando email tem formato inválido', async () => {
      const userId = 1;
      const invalidEmail = 'email-invalido';

      req.params.id = userId.toString();
      req.body = {
        user_email: invalidEmail,
      };

      setupInvalidEmail(userId, EMAIL_ERRORS.INVALID_FORMAT);

      await patchUserHandler(req, res, next);

      expect(mockValidateEmail).toHaveBeenCalledWith(invalidEmail);
      expect(mockLogError).toHaveBeenCalledWith(
        'PATCH',
        'USER',
        expect.any(UserValidationError),
        { user_id: userId, user_email: invalidEmail }
      );
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: expect.any(UserValidationError),
      });
      expect(mockPatchUserService).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando email tem domínio inválido', async () => {
      const userId = 1;
      const invalidEmail = 'usuario@dominioinvalido.com';

      req.params.id = userId.toString();
      req.body = {
        user_email: invalidEmail,
      };

      setupInvalidEmail(userId, EMAIL_ERRORS.INVALID_DOMAIN);

      await patchUserHandler(req, res, next);

      expect(mockValidateEmail).toHaveBeenCalledWith(invalidEmail);
      expect(mockHttpErrorHandler).toHaveBeenCalled();
      expect(mockPatchUserService).not.toHaveBeenCalled();
    });
  });

  describe('Cenários de erro - Validação de senha', () => {
    it('deve retornar erro quando senha é muito curta', async () => {
      const userId = 1;
      const invalidPassword = 'Senh1!';

      req.params.id = userId.toString();
      req.body = {
        user_password: invalidPassword,
      };

      setupInvalidPassword(userId, PASSWORD_ERRORS.MIN_LENGTH);

      mockValidateStringAndThrow.mockImplementation(() => {});

      await patchUserHandler(req, res, next);

      expect(mockValidatePassword).toHaveBeenCalledWith(invalidPassword);
      expect(mockLogError).toHaveBeenCalledWith(
        'PATCH',
        'USER',
        expect.any(UserValidationError),
        { user_id: userId }
      );
      expect(mockHttpErrorHandler).toHaveBeenCalled();
      expect(mockPatchUserService).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando senha não contém número', async () => {
      const userId = 1;
      const invalidPassword = 'SenhaSemNumero!';

      req.params.id = userId.toString();
      req.body = {
        user_password: invalidPassword,
      };

      setupInvalidPassword(userId, PASSWORD_ERRORS.NO_NUMBER);

      mockValidateStringAndThrow.mockImplementation(() => {});

      await patchUserHandler(req, res, next);

      expect(mockValidatePassword).toHaveBeenCalledWith(invalidPassword);
      expect(mockHttpErrorHandler).toHaveBeenCalled();
      expect(mockPatchUserService).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando senha não contém caractere especial', async () => {
      const userId = 1;
      const invalidPassword = 'Senha123';

      req.params.id = userId.toString();
      req.body = {
        user_password: invalidPassword,
      };

      setupInvalidPassword(userId, PASSWORD_ERRORS.NO_SPECIAL_CHAR);

      mockValidateStringAndThrow.mockImplementation(() => {});

      await patchUserHandler(req, res, next);

      expect(mockValidatePassword).toHaveBeenCalledWith(invalidPassword);
      expect(mockHttpErrorHandler).toHaveBeenCalled();
      expect(mockPatchUserService).not.toHaveBeenCalled();
    });
  });

  describe('Cenários de erro - Service', () => {
    it('deve retornar erro quando usuário não é encontrado', async () => {
      const userId = 999;
      const newEmail = 'usuario@gmail.com';

      req.params.id = userId.toString();
      req.body = {
        user_email: newEmail,
      };

      setupValidValidations(userId, newEmail);

      const notFoundError = new UserNotFoundError(userId);
      mockPatchUserService.mockRejectedValue(notFoundError);

      await patchUserHandler(req, res, next);

      expect(mockPatchUserService).toHaveBeenCalledWith({
        user_id: userId,
        user_email: newEmail,
        user_password: undefined,
        full_name: undefined,
      });
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: notFoundError,
      });
      expect(res.status).not.toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(res.send).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando email já existe', async () => {
      const userId = 1;
      const existingEmail = 'usuario@gmail.com';

      req.params.id = userId.toString();
      req.body = {
        user_email: existingEmail,
      };

      setupValidValidations(userId, existingEmail);

      const emailExistsError = new UserEmailAlreadyExistsError(existingEmail);
      mockPatchUserService.mockRejectedValue(emailExistsError);

      await patchUserHandler(req, res, next);

      expect(mockPatchUserService).toHaveBeenCalledWith({
        user_id: userId,
        user_email: existingEmail,
        user_password: undefined,
        full_name: undefined,
      });
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: emailExistsError,
      });
      expect(res.status).not.toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(res.send).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando service lança exceção genérica', async () => {
      const userId = 1;
      const newFullName = 'João Silva';

      req.params.id = userId.toString();
      req.body = {
        full_name: newFullName,
      };

      mockValidatePositiveIntegerAndThrow.mockReturnValue(userId);

      const serviceError = new UserUpdateError(userId, 'Failed to update user');
      mockPatchUserService.mockRejectedValue(serviceError);

      await patchUserHandler(req, res, next);

      expect(mockPatchUserService).toHaveBeenCalledWith({
        user_id: userId,
        user_email: undefined,
        user_password: undefined,
        full_name: newFullName,
      });
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: serviceError,
      });
      expect(res.status).not.toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(res.send).not.toHaveBeenCalled();
    });
  });
});

