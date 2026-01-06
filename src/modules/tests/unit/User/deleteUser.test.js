import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import httpStatusCodes from 'http-status-codes';

const mockDeleteUserService = jest.fn();
const mockValidatePositiveIntegerAndThrow = jest.fn();
const mockLogError = jest.fn();

jest.unstable_mockModule('#services/index.js', () => ({
  deleteUserService: mockDeleteUserService,
}));

jest.unstable_mockModule('#common/validations/index.js', () => ({
  validatePositiveIntegerAndThrow: mockValidatePositiveIntegerAndThrow,
}));

jest.unstable_mockModule('#common/services/logger/logger.js', () => ({
  logError: mockLogError,
}));

const { deleteUserHandler } = await import('#handlers/User/deleteUser.js');
const {
  UserValidationError,
  UserDeletionError,
  UserNotFoundError,
} = await import('#common/errors/index.js');

describe('deleteUserHandler', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: {},
      headers: {},
      method: 'DELETE',
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
    it('deve deletar um usuário com user_id válido', async () => {
      const userId = 1;

      req.params.id = userId.toString();

      mockValidatePositiveIntegerAndThrow.mockReturnValue(userId);
      mockDeleteUserService.mockResolvedValue({
        deletedUser: {
          user_id: userId,
          user_email: 'usuario@gmail.com',
          full_name: 'João Silva',
        },
      });

      await deleteUserHandler(req, res, next);

      expect(mockValidatePositiveIntegerAndThrow).toHaveBeenCalledWith(
        userId.toString(),
        'user id',
        UserValidationError,
        mockLogError,
        'DELETE',
        'USER'
      );
      expect(mockDeleteUserService).toHaveBeenCalledWith({
        user_id: userId,
      });
      expect(res.status).toHaveBeenCalledWith(httpStatusCodes.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('Cenários de erro - Validação de user_id', () => {
    it('deve retornar erro quando user_id é inválido', async () => {
      req.params.id = '0';

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

      await deleteUserHandler(req, res, next);

      expect(res.status).toHaveBeenCalledWith(validationError.statusCode);
      expect(res.json).toHaveBeenCalledWith({
        code: validationError.code,
        message: validationError.message,
      });
      expect(res.end).toHaveBeenCalled();
      expect(mockDeleteUserService).not.toHaveBeenCalled();
    });
  });

  describe('Cenários de erro - Service', () => {
    it('deve retornar erro quando usuário não é encontrado', async () => {
      const userId = 999;

      req.params.id = userId.toString();

      mockValidatePositiveIntegerAndThrow.mockReturnValue(userId);

      const notFoundError = new UserNotFoundError(userId);
      mockDeleteUserService.mockRejectedValue(notFoundError);

      await deleteUserHandler(req, res, next);

      expect(mockDeleteUserService).toHaveBeenCalledWith({
        user_id: userId,
      });
      expect(res.status).toHaveBeenCalledWith(notFoundError.statusCode);
      expect(res.json).toHaveBeenCalledWith({
        code: notFoundError.code,
        message: notFoundError.message,
      });
      expect(res.end).toHaveBeenCalled();
    });

    it('deve retornar erro quando service lança exceção genérica', async () => {
      const userId = 1;

      req.params.id = userId.toString();

      mockValidatePositiveIntegerAndThrow.mockReturnValue(userId);

      const serviceError = new UserDeletionError(userId, 'Failed to delete user');
      mockDeleteUserService.mockRejectedValue(serviceError);

      await deleteUserHandler(req, res, next);

      expect(mockDeleteUserService).toHaveBeenCalledWith({
        user_id: userId,
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

