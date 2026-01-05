import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import httpStatusCodes from 'http-status-codes';

const mockGetPostByUserIdService = jest.fn();
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
  getPostByUserIdService: mockGetPostByUserIdService,
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

const { listPostByIdHandler } = await import('#handlers/Posts/listPostById.js');
const {
  PostValidationError,
  AuthorNotFoundError,
} = await import('#common/errors/index.js');

describe('listPostByIdHandler', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      query: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    next = jest.fn();
  });

  describe('Cenários de sucesso', () => {
    it('deve retornar lista de posts quando encontrados para o user_id', async () => {
      const userId = 1;
      const mockPosts = [
        {
          post_id: 1,
          author_id: userId,
          post_text: 'Primeiro post do usuário',
        },
        {
          post_id: 2,
          author_id: userId,
          post_text: 'Segundo post do usuário',
        },
      ];

      req.query.user_id = userId.toString();

      mockValidatePositiveIntegerAndThrow.mockReturnValue(userId);
      mockGetPostByUserIdService.mockResolvedValue({
        posts: mockPosts,
      });

      await listPostByIdHandler(req, res, next);

      expect(mockValidatePositiveIntegerAndThrow).toHaveBeenCalledWith(
        userId.toString(),
        'user_id',
        PostValidationError,
        mockLogError,
        'LIST',
        'POST'
      );
      expect(mockGetPostByUserIdService).toHaveBeenCalledWith({
        user_id: userId,
      });
      expect(res.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(res.send).toHaveBeenCalledWith({ posts: mockPosts });
    });

    it('deve retornar lista vazia quando usuário não tem posts', async () => {
      const userId = 1;

      req.query.user_id = userId.toString();

      mockValidatePositiveIntegerAndThrow.mockReturnValue(userId);
      mockGetPostByUserIdService.mockResolvedValue({
        posts: [],
      });

      await listPostByIdHandler(req, res, next);

      expect(mockGetPostByUserIdService).toHaveBeenCalledWith({
        user_id: userId,
      });
      expect(res.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(res.send).toHaveBeenCalledWith({ posts: [] });
    });
  });

  describe('Cenários de erro - Validação de user_id', () => {
    it('deve retornar erro quando user_id não é um inteiro positivo', async () => {
      req.query.user_id = '0';

      const validationError = new PostValidationError(
        'Invalid user_id: must be a positive integer',
        { user_id: '0' }
      );

      mockValidatePositiveIntegerAndThrow.mockImplementation(
        (value, fieldName, ErrorClass, logErrorFn, action, entity) => {
          logErrorFn(action, entity, validationError, { [fieldName]: value });
          throw validationError;
        }
      );

      await listPostByIdHandler(req, res, next);

      expect(mockValidatePositiveIntegerAndThrow).toHaveBeenCalledWith(
        '0',
        'user_id',
        PostValidationError,
        mockLogError,
        'LIST',
        'POST'
      );
      expect(mockLogError).toHaveBeenCalledWith(
        'LIST',
        'POST',
        validationError,
        { user_id: '0' }
      );
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: validationError,
      });
      expect(mockGetPostByUserIdService).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando user_id é negativo', async () => {
      req.query.user_id = '-1';

      const validationError = new PostValidationError(
        'Invalid user_id: must be a positive integer',
        { user_id: '-1' }
      );

      mockValidatePositiveIntegerAndThrow.mockImplementation(
        (value, fieldName, ErrorClass, logErrorFn, action, entity) => {
          logErrorFn(action, entity, validationError, { [fieldName]: value });
          throw validationError;
        }
      );

      await listPostByIdHandler(req, res, next);

      expect(mockValidatePositiveIntegerAndThrow).toHaveBeenCalledWith(
        '-1',
        'user_id',
        PostValidationError,
        mockLogError,
        'LIST',
        'POST'
      );
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: validationError,
      });
      expect(mockGetPostByUserIdService).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando user_id não é um número', async () => {
      req.query.user_id = 'abc';

      const validationError = new PostValidationError(
        'Invalid user_id: must be a positive integer',
        { user_id: 'abc' }
      );

      mockValidatePositiveIntegerAndThrow.mockImplementation(
        (value, fieldName, ErrorClass, logErrorFn, action, entity) => {
          logErrorFn(action, entity, validationError, { [fieldName]: value });
          throw validationError;
        }
      );

      await listPostByIdHandler(req, res, next);

      expect(mockValidatePositiveIntegerAndThrow).toHaveBeenCalledWith(
        'abc',
        'user_id',
        PostValidationError,
        mockLogError,
        'LIST',
        'POST'
      );
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: validationError,
      });
      expect(mockGetPostByUserIdService).not.toHaveBeenCalled();
    });
  });

  describe('Cenários de erro - Service', () => {
    it('deve retornar erro quando autor não é encontrado', async () => {
      const userId = 999;

      req.query.user_id = userId.toString();

      mockValidatePositiveIntegerAndThrow.mockReturnValue(userId);

      const notFoundError = new AuthorNotFoundError(userId);
      mockGetPostByUserIdService.mockRejectedValue(notFoundError);

      await listPostByIdHandler(req, res, next);

      expect(mockGetPostByUserIdService).toHaveBeenCalledWith({
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

      req.query.user_id = userId.toString();

      mockValidatePositiveIntegerAndThrow.mockReturnValue(userId);

      const serviceError = new Error('Database connection failed');
      mockGetPostByUserIdService.mockRejectedValue(serviceError);

      await listPostByIdHandler(req, res, next);

      expect(mockGetPostByUserIdService).toHaveBeenCalledWith({
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

