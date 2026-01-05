import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import httpStatusCodes from 'http-status-codes';

const mockGetPostByUserIdService = jest.fn();
const mockValidatePositiveIntegerAndThrow = jest.fn();
const mockLogError = jest.fn();

jest.unstable_mockModule('#services/index.js', () => ({
  getPostByUserIdService: mockGetPostByUserIdService,
}));

jest.unstable_mockModule('#common/validations/index.js', () => ({
  validatePositiveIntegerAndThrow: mockValidatePositiveIntegerAndThrow,
}));

jest.unstable_mockModule('#common/services/logger/logger.js', () => ({
  logError: mockLogError,
}));

const { listPostByUserIdHandler } = await import(
  '#handlers/Posts/listPostByUserId.js'
);
const { PostValidationError, AuthorNotFoundError } = await import(
  '#common/errors/index.js'
);

describe('listPostByUserIdHandler', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: {},
      headers: {},
      method: 'GET',
      path: '/api/posts/user/:id',
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

      req.params.id = userId.toString();

      mockValidatePositiveIntegerAndThrow.mockReturnValue(userId);
      mockGetPostByUserIdService.mockResolvedValue({
        posts: mockPosts,
      });

      await listPostByUserIdHandler(req, res, next);

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
      expect(res.send).toHaveBeenCalledWith(mockPosts);
    });

    it('deve retornar lista vazia quando usuário não tem posts', async () => {
      const userId = 1;

      req.params.id = userId.toString();

      mockValidatePositiveIntegerAndThrow.mockReturnValue(userId);
      mockGetPostByUserIdService.mockResolvedValue({
        posts: [],
      });

      await listPostByUserIdHandler(req, res, next);

      expect(mockGetPostByUserIdService).toHaveBeenCalledWith({
        user_id: userId,
      });
      expect(res.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(res.send).toHaveBeenCalledWith([]);
    });
  });

  describe('Cenários de erro - Validação de user_id', () => {
    it('deve retornar erro quando user_id é inválido', async () => {
      req.params.id = '0';

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

      await listPostByUserIdHandler(req, res, next);

      expect(res.status).toHaveBeenCalledWith(validationError.statusCode);
      expect(res.json).toHaveBeenCalledWith({
        code: validationError.code,
        message: validationError.message,
      });
      expect(res.end).toHaveBeenCalled();
      expect(mockGetPostByUserIdService).not.toHaveBeenCalled();
    });
  });

  describe('Cenários de erro - Service', () => {
    it('deve retornar erro quando autor não é encontrado', async () => {
      const userId = 999;

      req.params.id = userId.toString();

      mockValidatePositiveIntegerAndThrow.mockReturnValue(userId);

      const notFoundError = new AuthorNotFoundError(userId);
      mockGetPostByUserIdService.mockRejectedValue(notFoundError);

      await listPostByUserIdHandler(req, res, next);

      expect(mockGetPostByUserIdService).toHaveBeenCalledWith({
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

      const serviceError = new Error('Database connection failed');
      mockGetPostByUserIdService.mockRejectedValue(serviceError);

      await listPostByUserIdHandler(req, res, next);

      expect(mockGetPostByUserIdService).toHaveBeenCalledWith({
        user_id: userId,
      });
      expect(res.status).toHaveBeenCalledWith(httpStatusCodes.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        code: 'INTERNAL_ERROR'
      });
      expect(res.end).toHaveBeenCalled();
    });
  });
});

