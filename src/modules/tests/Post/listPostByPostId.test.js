import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import httpStatusCodes from 'http-status-codes';

const mockGetPostByPostIdService = jest.fn();
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
  getPostByPostIdService: mockGetPostByPostIdService,
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

const { listPostByPostIdHandler } = await import(
  '#handlers/Posts/listPostByPostId.js'
);
const { PostValidationError, PostNotFoundError } = await import(
  '#common/errors/index.js'
);

describe('listPostByPostIdHandler', () => {
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
    it('deve retornar post quando encontrado pelo post_id', async () => {
      const postId = 1;
      const mockPost = {
        post_id: postId,
        author_id: 1,
        post_text: 'Post encontrado',
      };

      req.params.id = postId.toString();

      mockValidatePositiveIntegerAndThrow.mockReturnValue(postId);
      mockGetPostByPostIdService.mockResolvedValue({
        post: mockPost,
      });

      await listPostByPostIdHandler(req, res, next);

      expect(mockValidatePositiveIntegerAndThrow).toHaveBeenCalledWith(
        postId.toString(),
        'post_id',
        PostValidationError,
        mockLogError,
        'READ',
        'POST'
      );
      expect(mockGetPostByPostIdService).toHaveBeenCalledWith({
        post_id: postId,
      });
      expect(res.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(res.send).toHaveBeenCalledWith(mockPost);
    });
  });

  describe('Cenários de erro - Validação de post_id', () => {
    it('deve retornar erro quando post_id não é um inteiro positivo', async () => {
      req.params.id = '0';

      const validationError = new PostValidationError(
        'Invalid post_id: must be a positive integer',
        { post_id: '0' }
      );

      mockValidatePositiveIntegerAndThrow.mockImplementation(
        (value, fieldName, ErrorClass, logErrorFn, action, entity) => {
          logErrorFn(action, entity, validationError, { [fieldName]: value });
          throw validationError;
        }
      );

      await listPostByPostIdHandler(req, res, next);

      expect(mockValidatePositiveIntegerAndThrow).toHaveBeenCalledWith(
        '0',
        'post_id',
        PostValidationError,
        mockLogError,
        'READ',
        'POST'
      );
      expect(mockLogError).toHaveBeenCalledWith(
        'READ',
        'POST',
        validationError,
        { post_id: '0' }
      );
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: validationError,
      });
      expect(mockGetPostByPostIdService).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando post_id é negativo', async () => {
      req.params.id = '-1';

      const validationError = new PostValidationError(
        'Invalid post_id: must be a positive integer',
        { post_id: '-1' }
      );

      mockValidatePositiveIntegerAndThrow.mockImplementation(
        (value, fieldName, ErrorClass, logErrorFn, action, entity) => {
          logErrorFn(action, entity, validationError, { [fieldName]: value });
          throw validationError;
        }
      );

      await listPostByPostIdHandler(req, res, next);

      expect(mockValidatePositiveIntegerAndThrow).toHaveBeenCalledWith(
        '-1',
        'post_id',
        PostValidationError,
        mockLogError,
        'READ',
        'POST'
      );
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: validationError,
      });
      expect(mockGetPostByPostIdService).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando post_id não é um número', async () => {
      req.params.id = 'abc';

      const validationError = new PostValidationError(
        'Invalid post_id: must be a positive integer',
        { post_id: 'abc' }
      );

      mockValidatePositiveIntegerAndThrow.mockImplementation(
        (value, fieldName, ErrorClass, logErrorFn, action, entity) => {
          logErrorFn(action, entity, validationError, { [fieldName]: value });
          throw validationError;
        }
      );

      await listPostByPostIdHandler(req, res, next);

      expect(mockValidatePositiveIntegerAndThrow).toHaveBeenCalledWith(
        'abc',
        'post_id',
        PostValidationError,
        mockLogError,
        'READ',
        'POST'
      );
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: validationError,
      });
      expect(mockGetPostByPostIdService).not.toHaveBeenCalled();
    });
  });

  describe('Cenários de erro - Service', () => {
    it('deve retornar erro quando post não é encontrado', async () => {
      const postId = 999;

      req.params.id = postId.toString();

      mockValidatePositiveIntegerAndThrow.mockReturnValue(postId);

      const notFoundError = new PostNotFoundError(postId);
      mockGetPostByPostIdService.mockRejectedValue(notFoundError);

      await listPostByPostIdHandler(req, res, next);

      expect(mockGetPostByPostIdService).toHaveBeenCalledWith({
        post_id: postId,
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
      const postId = 1;

      req.params.id = postId.toString();

      mockValidatePositiveIntegerAndThrow.mockReturnValue(postId);

      const serviceError = new Error('Database connection failed');
      mockGetPostByPostIdService.mockRejectedValue(serviceError);

      await listPostByPostIdHandler(req, res, next);

      expect(mockGetPostByPostIdService).toHaveBeenCalledWith({
        post_id: postId,
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

