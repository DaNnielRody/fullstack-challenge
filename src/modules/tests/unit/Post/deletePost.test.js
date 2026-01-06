import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import httpStatusCodes from 'http-status-codes';

const mockDeletePostService = jest.fn();
const mockValidatePositiveIntegerAndThrow = jest.fn();
const mockLogError = jest.fn();

jest.unstable_mockModule('#services/index.js', () => ({
  deletePostService: mockDeletePostService,
}));

jest.unstable_mockModule('#common/validations/index.js', () => ({
  validatePositiveIntegerAndThrow: mockValidatePositiveIntegerAndThrow,
}));

jest.unstable_mockModule('#common/services/logger/logger.js', () => ({
  logError: mockLogError,
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
      headers: {},
      method: 'DELETE',
      path: '/api/posts/:id',
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
    it('deve retornar erro quando post_id é inválido', async () => {
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

      expect(res.status).toHaveBeenCalledWith(validationError.statusCode);
      expect(res.json).toHaveBeenCalledWith({
        code: validationError.code,
        message: validationError.message,
      });
      expect(res.end).toHaveBeenCalled();
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
      expect(res.status).toHaveBeenCalledWith(notFoundError.statusCode);
      expect(res.json).toHaveBeenCalledWith({
        code: notFoundError.code,
        message: notFoundError.message,
      });
      expect(res.end).toHaveBeenCalled();
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
      expect(res.status).toHaveBeenCalledWith(serviceError.statusCode);
      expect(res.json).toHaveBeenCalledWith({
        code: serviceError.code,
        message: serviceError.message,
      });
      expect(res.end).toHaveBeenCalled();
    });
  });
});

