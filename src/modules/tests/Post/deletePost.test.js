import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import httpStatusCodes from 'http-status-codes';

const mockDeletePostService = jest.fn();
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
  deletePostService: mockDeletePostService,
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

const { deletePostHandler } = await import('#handlers/Posts/deletePost.js');
const {
  PostValidationError,
  PostDeletionError,
  PostNotFoundError,
} = await import('#common/errors/index.js');

describe('deletePostHandler', () => {
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
    it('deve deletar um post com post_id válido', async () => {
      const postId = 1;

      req.params.id = postId.toString();

      mockValidatePositiveIntegerAndThrow.mockReturnValue(postId);
      mockDeletePostService.mockResolvedValue({
        deletedPost: {
          post_id: postId,
          author_id: 1,
          post_text: 'Post de teste',
        },
      });

      await deletePostHandler(req, res, next);

      expect(mockValidatePositiveIntegerAndThrow).toHaveBeenCalledWith(
        postId.toString(),
        'post id',
        PostValidationError,
        mockLogError,
        'DELETE',
        'POST'
      );
      expect(mockDeletePostService).toHaveBeenCalledWith({
        post_id: postId,
      });
      expect(res.status).toHaveBeenCalledWith(httpStatusCodes.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('Cenários de erro - Validação de post_id', () => {
    it('deve retornar erro quando post_id não é um inteiro positivo', async () => {
      req.params.id = '0';

      const validationError = new PostValidationError(
        'Invalid post id: must be a positive integer',
        { 'post id': '0' }
      );

      mockValidatePositiveIntegerAndThrow.mockImplementation(
        (value, fieldName, ErrorClass, logErrorFn, action, entity) => {
          logErrorFn(action, entity, validationError, { [fieldName]: value });
          throw validationError;
        }
      );

      await deletePostHandler(req, res, next);

      expect(mockValidatePositiveIntegerAndThrow).toHaveBeenCalledWith(
        '0',
        'post id',
        PostValidationError,
        mockLogError,
        'DELETE',
        'POST'
      );
      expect(mockLogError).toHaveBeenCalledWith(
        'DELETE',
        'POST',
        validationError,
        { 'post id': '0' }
      );
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: validationError,
      });
      expect(mockDeletePostService).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando post_id é negativo', async () => {
      req.params.id = '-1';

      const validationError = new PostValidationError(
        'Invalid post id: must be a positive integer',
        { 'post id': '-1' }
      );

      mockValidatePositiveIntegerAndThrow.mockImplementation(
        (value, fieldName, ErrorClass, logErrorFn, action, entity) => {
          logErrorFn(action, entity, validationError, { [fieldName]: value });
          throw validationError;
        }
      );

      await deletePostHandler(req, res, next);

      expect(mockValidatePositiveIntegerAndThrow).toHaveBeenCalledWith(
        '-1',
        'post id',
        PostValidationError,
        mockLogError,
        'DELETE',
        'POST'
      );
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: validationError,
      });
      expect(mockDeletePostService).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando post_id não é um número', async () => {
      req.params.id = 'abc';

      const validationError = new PostValidationError(
        'Invalid post id: must be a positive integer',
        { 'post id': 'abc' }
      );

      mockValidatePositiveIntegerAndThrow.mockImplementation(
        (value, fieldName, ErrorClass, logErrorFn, action, entity) => {
          logErrorFn(action, entity, validationError, { [fieldName]: value });
          throw validationError;
        }
      );

      await deletePostHandler(req, res, next);

      expect(mockValidatePositiveIntegerAndThrow).toHaveBeenCalledWith(
        'abc',
        'post id',
        PostValidationError,
        mockLogError,
        'DELETE',
        'POST'
      );
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: validationError,
      });
      expect(mockDeletePostService).not.toHaveBeenCalled();
    });
  });

  describe('Cenários de erro - Service', () => {
    it('deve retornar erro quando post não é encontrado', async () => {
      const postId = 999;

      req.params.id = postId.toString();

      mockValidatePositiveIntegerAndThrow.mockReturnValue(postId);

      const notFoundError = new PostNotFoundError(postId);
      mockDeletePostService.mockRejectedValue(notFoundError);

      await deletePostHandler(req, res, next);

      expect(mockDeletePostService).toHaveBeenCalledWith({
        post_id: postId,
      });
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: notFoundError,
      });
      expect(res.status).not.toHaveBeenCalledWith(httpStatusCodes.NO_CONTENT);
      expect(res.send).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando service lança exceção genérica', async () => {
      const postId = 1;

      req.params.id = postId.toString();

      mockValidatePositiveIntegerAndThrow.mockReturnValue(postId);

      const serviceError = new PostDeletionError(postId, 'Failed to delete post');
      mockDeletePostService.mockRejectedValue(serviceError);

      await deletePostHandler(req, res, next);

      expect(mockDeletePostService).toHaveBeenCalledWith({
        post_id: postId,
      });
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: serviceError,
      });
      expect(res.status).not.toHaveBeenCalledWith(httpStatusCodes.NO_CONTENT);
      expect(res.send).not.toHaveBeenCalled();
    });
  });
});

