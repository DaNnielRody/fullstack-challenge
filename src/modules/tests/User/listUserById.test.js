import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import httpStatusCodes from 'http-status-codes';

const mockGetUserByIdService = jest.fn();
const mockValidatePositiveIntegerAndThrow = jest.fn();
const mockLogError = jest.fn();
const mockHttpErrorHandler = jest.fn(({ res, error }) => {
  return res.status(error.statusCode || 500).json({
    error: error.message,
    code: error.code,
    details: error.details,
  });
});

jest.unstable_mockModule('#services/index.js', () => ({
  getUserByIdService: mockGetUserByIdService,
}));

jest.unstable_mockModule('#common/validations/index.js', () => ({
  validatePositiveIntegerAndThrow: mockValidatePositiveIntegerAndThrow,
}));

jest.unstable_mockModule('#common/services/logger/logger.js', () => ({
  logError: mockLogError,
}));

jest.unstable_mockModule('#common/handlers/index.js', () => ({
  httpErrorHandler: mockHttpErrorHandler,
}));

const { listUserByIdHandler } = await import('#handlers/User/listUserById.js');
const {
  UserValidationError,
  UserNotFoundError,
} = await import('#common/errors/index.js');

describe('listUserByIdHandler', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    next = jest.fn();
  });

  describe('Cenários de sucesso', () => {
    it('deve retornar usuário quando encontrado', async () => {
      const userId = 1;
      const mockUser = [
        {
          user_id: userId,
          user_email: 'usuario@gmail.com',
          full_name: 'João Silva',
        },
      ];

      req.params.id = userId.toString();

      mockValidatePositiveIntegerAndThrow.mockReturnValue(userId);
      mockGetUserByIdService.mockResolvedValue({
        user: mockUser,
      });

      await listUserByIdHandler(req, res, next);

      expect(mockValidatePositiveIntegerAndThrow).toHaveBeenCalledWith(
        userId.toString(),
        'user id',
        UserValidationError,
        mockLogError,
        'READ',
        'USER'
      );
      expect(mockGetUserByIdService).toHaveBeenCalledWith({
        user_id: userId,
      });
      expect(res.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(res.send).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('Cenários de erro - Validação de user_id', () => {
    it('deve retornar erro quando user_id não é um inteiro positivo', async () => {
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

      await listUserByIdHandler(req, res, next);

      expect(mockValidatePositiveIntegerAndThrow).toHaveBeenCalledWith(
        '0',
        'user id',
        UserValidationError,
        mockLogError,
        'READ',
        'USER'
      );
      expect(mockLogError).toHaveBeenCalledWith(
        'READ',
        'USER',
        validationError,
        { 'user id': '0' }
      );
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: validationError,
      });
      expect(mockGetUserByIdService).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando user_id é negativo', async () => {
      req.params.id = '-1';

      const validationError = new UserValidationError(
        'Invalid user id: must be a positive integer',
        { 'user id': '-1' }
      );

      mockValidatePositiveIntegerAndThrow.mockImplementation(
        (value, fieldName, ErrorClass, logErrorFn, action, entity) => {
          logErrorFn(action, entity, validationError, { [fieldName]: value });
          throw validationError;
        }
      );

      await listUserByIdHandler(req, res, next);

      expect(mockValidatePositiveIntegerAndThrow).toHaveBeenCalledWith(
        '-1',
        'user id',
        UserValidationError,
        mockLogError,
        'READ',
        'USER'
      );
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: validationError,
      });
      expect(mockGetUserByIdService).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando user_id não é um número', async () => {
      req.params.id = 'abc';

      const validationError = new UserValidationError(
        'Invalid user id: must be a positive integer',
        { 'user id': 'abc' }
      );

      mockValidatePositiveIntegerAndThrow.mockImplementation(
        (value, fieldName, ErrorClass, logErrorFn, action, entity) => {
          logErrorFn(action, entity, validationError, { [fieldName]: value });
          throw validationError;
        }
      );

      await listUserByIdHandler(req, res, next);

      expect(mockValidatePositiveIntegerAndThrow).toHaveBeenCalledWith(
        'abc',
        'user id',
        UserValidationError,
        mockLogError,
        'READ',
        'USER'
      );
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: validationError,
      });
      expect(mockGetUserByIdService).not.toHaveBeenCalled();
    });
  });

  describe('Cenários de erro - Service', () => {
    it('deve retornar erro quando usuário não é encontrado', async () => {
      const userId = 999;

      req.params.id = userId.toString();

      mockValidatePositiveIntegerAndThrow.mockReturnValue(userId);

      const notFoundError = new UserNotFoundError(userId);
      mockGetUserByIdService.mockRejectedValue(notFoundError);

      await listUserByIdHandler(req, res, next);

      expect(mockGetUserByIdService).toHaveBeenCalledWith({
        user_id: userId,
      });
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: notFoundError,
      });
      expect(res.status).not.toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(res.send).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando service lança exceção genérica', async () => {
      const userId = 1;

      req.params.id = userId.toString();

      mockValidatePositiveIntegerAndThrow.mockReturnValue(userId);

      const serviceError = new Error('Database connection failed');
      mockGetUserByIdService.mockRejectedValue(serviceError);

      await listUserByIdHandler(req, res, next);

      expect(mockGetUserByIdService).toHaveBeenCalledWith({
        user_id: userId,
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

