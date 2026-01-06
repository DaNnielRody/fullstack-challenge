import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import httpStatusCodes from 'http-status-codes';

const mockUpdatePostService = jest.fn();
const mockValidateStringAndThrow = jest.fn();
const mockValidatePositiveIntegerAndThrow = jest.fn();
const mockLogError = jest.fn();

jest.unstable_mockModule('#services/index.js', () => ({
  updatePostService: mockUpdatePostService,
}));

jest.unstable_mockModule('#common/validations/index.js', () => ({
  validateStringAndThrow: mockValidateStringAndThrow,
  validatePositiveIntegerAndThrow: mockValidatePositiveIntegerAndThrow,
}));

jest.unstable_mockModule('#common/services/logger/logger.js', () => ({
  logError: mockLogError,
}));

const { updatePostHandler } = await import('#handlers/Posts/updatePost.js');
const {
  PostValidationError,
  PostUpdateError,
  PostNotFoundError,
} = await import('#common/errors/index.js');

describe('updatePostHandler', () => {
  let req, res, next;

  const setupValidValidations = (postId, authorId) => {
    mockValidatePositiveIntegerAndThrow
      .mockReturnValueOnce(postId)
      .mockReturnValueOnce(authorId);
    mockValidateStringAndThrow.mockImplementation(() => {});
  };

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: {},
      body: {},
      headers: {},
      method: 'PUT',
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
    it('deve atualizar um post com post_id, author_id e post_text válidos', async () => {
      const postId = 1;
      const authorId = 1;
      const postText = 'Post atualizado';

      req.params.id = postId.toString();
      req.body = {
        author_id: authorId,
        post_text: postText,
      };

      setupValidValidations(postId, authorId);

      const mockUpdatedPost = {
        post_id: postId,
        author_id: authorId,
        post_text: postText,
      };

      mockUpdatePostService.mockResolvedValue(mockUpdatedPost);

      await updatePostHandler(req, res, next);

      expect(mockValidatePositiveIntegerAndThrow).toHaveBeenCalledTimes(2);
      expect(mockValidateStringAndThrow).toHaveBeenCalledWith(
        postText,
        'post_text',
        PostValidationError,
        mockLogError,
        'UPDATE',
        'POST',
        { post_id: postId, author_id: authorId }
      );
      expect(mockUpdatePostService).toHaveBeenCalledWith({
        post_id: postId,
        author_id: authorId,
        post_text: postText,
      });
      expect(res.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(res.send).toHaveBeenCalledWith(mockUpdatedPost);
    });
  });

  describe('Cenários de erro - Validação de post_id', () => {
    it('deve retornar erro quando post_id não é um inteiro positivo', async () => {
      req.params.id = '0';
      req.body = {
        author_id: 1,
        post_text: 'Post de teste',
      };

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

      await updatePostHandler(req, res, next);

      expect(mockValidatePositiveIntegerAndThrow).toHaveBeenCalledWith(
        '0',
        'post id',
        PostValidationError,
        mockLogError,
        'UPDATE',
        'POST'
      );

      expect(res.status).toHaveBeenCalledWith(validationError.statusCode);
      expect(res.json).toHaveBeenCalledWith({
        code: validationError.code,
        message: validationError.message,
      });
      expect(res.end).toHaveBeenCalled();
      expect(mockUpdatePostService).not.toHaveBeenCalled();
    });
  });

  describe('Cenários de erro - Validação de author_id', () => {
    it('deve retornar erro quando author_id não é um inteiro positivo', async () => {
      const postId = 1;

      req.params.id = postId.toString();
      req.body = {
        author_id: 0,
        post_text: 'Post de teste',
      };

      mockValidatePositiveIntegerAndThrow
        .mockReturnValueOnce(postId)
        .mockImplementationOnce(
          (value, fieldName, ErrorClass, logErrorFn, action, entity, context) => {
            const validationError = new PostValidationError(
              'Invalid author_id: must be a positive integer',
              { author_id: 0 }
            );
            logErrorFn(action, entity, validationError, {
              ...context,
              [fieldName]: value,
            });
            throw validationError;
          }
        );

      await updatePostHandler(req, res, next);

      expect(mockValidatePositiveIntegerAndThrow).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(expect.any(Number));
      expect(res.json).toHaveBeenCalled();
      expect(res.end).toHaveBeenCalled();
      expect(mockValidateStringAndThrow).not.toHaveBeenCalled();
      expect(mockUpdatePostService).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando author_id é negativo', async () => {
      const postId = 1;

      req.params.id = postId.toString();
      req.body = {
        author_id: -1,
        post_text: 'Post de teste',
      };

      mockValidatePositiveIntegerAndThrow
        .mockReturnValueOnce(postId)
        .mockImplementationOnce(
          (value, fieldName, ErrorClass, logErrorFn, action, entity, context) => {
            const validationError = new PostValidationError(
              'Invalid author_id: must be a positive integer',
              { author_id: -1 }
            );
            logErrorFn(action, entity, validationError, {
              ...context,
              [fieldName]: value,
            });
            throw validationError;
          }
        );

      await updatePostHandler(req, res, next);

      expect(res.status).toHaveBeenCalledWith(expect.any(Number));
      expect(res.json).toHaveBeenCalled();
      expect(res.end).toHaveBeenCalled();
      expect(mockUpdatePostService).not.toHaveBeenCalled();
    });
  });

  describe('Cenários de erro - Validação de string', () => {
    it('deve retornar erro quando post_text está vazio', async () => {
      const postId = 1;
      const authorId = 1;

      req.params.id = postId.toString();
      req.body = {
        author_id: authorId,
        post_text: '',
      };

      const validationError = new PostValidationError(
        'Invalid post_text: must be a non-empty string',
        { post_text: '' }
      );

      mockValidatePositiveIntegerAndThrow
        .mockReturnValueOnce(postId)
        .mockReturnValueOnce(authorId);
      mockValidateStringAndThrow.mockImplementation(
        (value, fieldName, ErrorClass, logErrorFn, action, entity, context) => {
          logErrorFn(action, entity, validationError, {
            ...context,
            [fieldName]: value,
          });
          throw validationError;
        }
      );

      await updatePostHandler(req, res, next);

      expect(mockValidateStringAndThrow).toHaveBeenCalledWith(
        '',
        'post_text',
        PostValidationError,
        mockLogError,
        'UPDATE',
        'POST',
        { post_id: postId, author_id: authorId }
      );

      expect(res.status).toHaveBeenCalledWith(validationError.statusCode);
      expect(res.json).toHaveBeenCalledWith({
        code: validationError.code,
        message: validationError.message,
      });
      expect(res.end).toHaveBeenCalled();
      expect(mockUpdatePostService).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando post_text não é fornecido', async () => {
      const postId = 1;
      const authorId = 1;

      req.params.id = postId.toString();
      req.body = {
        author_id: authorId,
      };

      const validationError = new PostValidationError(
        'Invalid post_text: must be a non-empty string',
        { post_text: undefined }
      );

      mockValidatePositiveIntegerAndThrow
        .mockReturnValueOnce(postId)
        .mockReturnValueOnce(authorId);
      mockValidateStringAndThrow.mockImplementation(
        (value, fieldName, ErrorClass, logErrorFn, action, entity, context) => {
          logErrorFn(action, entity, validationError, {
            ...context,
            [fieldName]: value,
          });
          throw validationError;
        }
      );

      await updatePostHandler(req, res, next);

      expect(mockValidateStringAndThrow).toHaveBeenCalledWith(
        undefined,
        'post_text',
        PostValidationError,
        mockLogError,
        'UPDATE',
        'POST',
        { post_id: postId, author_id: authorId }
      );
      expect(res.status).toHaveBeenCalledWith(validationError.statusCode);
      expect(res.json).toHaveBeenCalledWith({
        code: validationError.code,
        message: validationError.message,
      });
      expect(res.end).toHaveBeenCalled();
      expect(mockUpdatePostService).not.toHaveBeenCalled();
    });
  });

  describe('Cenários de erro - Service', () => {
    it('deve retornar erro quando post não é encontrado', async () => {
      const postId = 999;
      const authorId = 1;
      const postText = 'Post de teste';

      req.params.id = postId.toString();
      req.body = {
        author_id: authorId,
        post_text: postText,
      };

      setupValidValidations(postId, authorId);

      const notFoundError = new PostNotFoundError(postId);
      mockUpdatePostService.mockRejectedValue(notFoundError);

      await updatePostHandler(req, res, next);

      expect(mockUpdatePostService).toHaveBeenCalledWith({
        post_id: postId,
        author_id: authorId,
        post_text: postText,
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
      const authorId = 1;
      const postText = 'Post de teste';

      req.params.id = postId.toString();
      req.body = {
        author_id: authorId,
        post_text: postText,
      };

      setupValidValidations(postId, authorId);

      const serviceError = new PostUpdateError(postId, 'Failed to update post');
      mockUpdatePostService.mockRejectedValue(serviceError);

      await updatePostHandler(req, res, next);

      expect(mockUpdatePostService).toHaveBeenCalledWith({
        post_id: postId,
        author_id: authorId,
        post_text: postText,
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

