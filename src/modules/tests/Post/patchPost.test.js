import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import httpStatusCodes from 'http-status-codes';

const mockPatchPostService = jest.fn();
const mockValidateStringAndThrow = jest.fn();
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
  patchPostService: mockPatchPostService,
}));

jest.unstable_mockModule('#common/validations/index.js', () => ({
  validateStringAndThrow: mockValidateStringAndThrow,
  validatePositiveIntegerAndThrow: mockValidatePositiveIntegerAndThrow,
}));

jest.unstable_mockModule('#common/services/logger/logger.js', () => ({
  logError: mockLogError,
}));

jest.unstable_mockModule('#common/handlers/index.js', () => ({
  httpErrorHandler: mockHttpErrorHandler,
}));

const { patchPostHandler } = await import('#handlers/Posts/patchPost.js');
const {
  PostValidationError,
  PostUpdateError,
  PostNotFoundError,
} = await import('#common/errors/index.js');

describe('patchPostHandler', () => {
  let req, res, next;

  const setupValidValidations = (postId, authorId) => {
    if (authorId !== undefined) {
      mockValidatePositiveIntegerAndThrow
        .mockReturnValueOnce(postId)
        .mockReturnValueOnce(authorId);
    } else {
      mockValidatePositiveIntegerAndThrow.mockReturnValue(postId);
    }
    mockValidateStringAndThrow.mockImplementation(() => {});
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
    it('deve atualizar apenas o author_id do post', async () => {
      const postId = 1;
      const newAuthorId = 2;

      req.params.id = postId.toString();
      req.body = {
        author_id: newAuthorId,
      };

      setupValidValidations(postId, newAuthorId);

      const mockUpdatedPost = {
        post_id: postId,
        author_id: newAuthorId,
        post_text: 'Post original',
      };

      mockPatchPostService.mockResolvedValue(mockUpdatedPost);

      await patchPostHandler(req, res, next);

      expect(mockValidatePositiveIntegerAndThrow).toHaveBeenCalledTimes(2);
      expect(mockPatchPostService).toHaveBeenCalledWith({
        post_id: postId,
        author_id: newAuthorId,
        post_text: undefined,
      });
      expect(res.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(res.send).toHaveBeenCalledWith(mockUpdatedPost);
    });

    it('deve atualizar apenas o post_text do post', async () => {
      const postId = 1;
      const newPostText = 'Post atualizado';

      req.params.id = postId.toString();
      req.body = {
        post_text: newPostText,
      };

      setupValidValidations(postId);

      mockValidateStringAndThrow.mockImplementation(() => {});

      const mockUpdatedPost = {
        post_id: postId,
        author_id: 1,
        post_text: newPostText,
      };

      mockPatchPostService.mockResolvedValue(mockUpdatedPost);

      await patchPostHandler(req, res, next);

      expect(mockValidateStringAndThrow).toHaveBeenCalledWith(
        newPostText,
        'post_text',
        PostValidationError,
        mockLogError,
        'PATCH',
        'POST',
        { post_id: postId, author_id: undefined }
      );
      expect(mockPatchPostService).toHaveBeenCalledWith({
        post_id: postId,
        author_id: undefined,
        post_text: newPostText,
      });
      expect(res.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(res.send).toHaveBeenCalledWith(mockUpdatedPost);
    });

    it('deve atualizar ambos author_id e post_text', async () => {
      const postId = 1;
      const newAuthorId = 2;
      const newPostText = 'Post atualizado';

      req.params.id = postId.toString();
      req.body = {
        author_id: newAuthorId,
        post_text: newPostText,
      };

      setupValidValidations(postId, newAuthorId);
      mockValidateStringAndThrow.mockImplementation(() => {});

      const mockUpdatedPost = {
        post_id: postId,
        author_id: newAuthorId,
        post_text: newPostText,
      };

      mockPatchPostService.mockResolvedValue(mockUpdatedPost);

      await patchPostHandler(req, res, next);

      expect(mockValidatePositiveIntegerAndThrow).toHaveBeenCalledTimes(2);
      expect(mockValidateStringAndThrow).toHaveBeenCalledWith(
        newPostText,
        'post_text',
        PostValidationError,
        mockLogError,
        'PATCH',
        'POST',
        { post_id: postId, author_id: newAuthorId }
      );
      expect(mockPatchPostService).toHaveBeenCalledWith({
        post_id: postId,
        author_id: newAuthorId,
        post_text: newPostText,
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

      await patchPostHandler(req, res, next);

      expect(mockValidatePositiveIntegerAndThrow).toHaveBeenCalledWith(
        '0',
        'post id',
        PostValidationError,
        mockLogError,
        'PATCH',
        'POST'
      );
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: validationError,
      });
      expect(mockPatchPostService).not.toHaveBeenCalled();
    });
  });

  describe('Cenários de erro - Validação de campos', () => {
    it('deve retornar erro quando nenhum campo é fornecido', async () => {
      const postId = 1;

      req.params.id = postId.toString();
      req.body = {};

      mockValidatePositiveIntegerAndThrow.mockReturnValue(postId);

      await patchPostHandler(req, res, next);

      expect(mockLogError).toHaveBeenCalledWith(
        'PATCH',
        'POST',
        expect.any(PostValidationError),
        { post_id: postId }
      );
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: expect.any(PostValidationError),
      });
      expect(mockPatchPostService).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando author_id está vazio', async () => {
      const postId = 1;

      req.params.id = postId.toString();
      req.body = {
        author_id: '',
      };

      mockValidatePositiveIntegerAndThrow.mockReturnValue(postId);

      await patchPostHandler(req, res, next);

      expect(mockLogError).toHaveBeenCalledWith(
        'PATCH',
        'POST',
        expect.any(PostValidationError),
        { post_id: postId }
      );
      expect(mockHttpErrorHandler).toHaveBeenCalled();
      expect(mockPatchPostService).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando post_text está vazio', async () => {
      const postId = 1;

      req.params.id = postId.toString();
      req.body = {
        post_text: '',
      };

      mockValidatePositiveIntegerAndThrow.mockReturnValue(postId);

      await patchPostHandler(req, res, next);

      expect(mockLogError).toHaveBeenCalledWith(
        'PATCH',
        'POST',
        expect.any(PostValidationError),
        { post_id: postId }
      );
      expect(mockHttpErrorHandler).toHaveBeenCalled();
      expect(mockPatchPostService).not.toHaveBeenCalled();
    });
  });

  describe('Cenários de erro - Validação de author_id', () => {
    it('deve retornar erro quando author_id não é um inteiro positivo', async () => {
      const postId = 1;

      req.params.id = postId.toString();
      req.body = {
        author_id: 0,
      };

      mockValidatePositiveIntegerAndThrow.mockReturnValue(postId);

      await patchPostHandler(req, res, next);

      expect(mockLogError).toHaveBeenCalledWith(
        'PATCH',
        'POST',
        expect.any(PostValidationError),
        { post_id: postId }
      );
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: expect.any(PostValidationError),
      });
      expect(mockPatchPostService).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando author_id é negativo', async () => {
      const postId = 1;

      req.params.id = postId.toString();
      req.body = {
        author_id: -1,
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

      await patchPostHandler(req, res, next);

      expect(mockValidatePositiveIntegerAndThrow).toHaveBeenCalledTimes(2);
      expect(mockHttpErrorHandler).toHaveBeenCalled();
      expect(mockPatchPostService).not.toHaveBeenCalled();
    });
  });

  describe('Cenários de erro - Validação de post_text', () => {
    it('deve retornar erro quando post_text está vazio (quando fornecido)', async () => {
      const postId = 1;

      req.params.id = postId.toString();
      req.body = {
        post_text: '',
      };

      mockValidatePositiveIntegerAndThrow.mockReturnValue(postId);

      await patchPostHandler(req, res, next);

      expect(mockLogError).toHaveBeenCalledWith(
        'PATCH',
        'POST',
        expect.any(PostValidationError),
        { post_id: postId }
      );
      expect(mockHttpErrorHandler).toHaveBeenCalled();
      expect(mockValidateStringAndThrow).not.toHaveBeenCalled();
      expect(mockPatchPostService).not.toHaveBeenCalled();
    });
  });

  describe('Cenários de erro - Service', () => {
    it('deve retornar erro quando post não é encontrado', async () => {
      const postId = 999;
      const newPostText = 'Post atualizado';

      req.params.id = postId.toString();
      req.body = {
        post_text: newPostText,
      };

      mockValidatePositiveIntegerAndThrow.mockReturnValue(postId);
      mockValidateStringAndThrow.mockImplementation(() => {});

      const notFoundError = new PostNotFoundError(postId);
      mockPatchPostService.mockRejectedValue(notFoundError);

      await patchPostHandler(req, res, next);

      expect(mockValidatePositiveIntegerAndThrow).toHaveBeenCalled();
      expect(mockValidateStringAndThrow).toHaveBeenCalled();
      expect(mockPatchPostService).toHaveBeenCalledWith({
        post_id: postId,
        author_id: undefined,
        post_text: newPostText,
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
      const newAuthorId = 2;

      req.params.id = postId.toString();
      req.body = {
        author_id: newAuthorId,
      };

      setupValidValidations(postId, newAuthorId);

      const serviceError = new PostUpdateError(postId, 'Failed to update post');
      mockPatchPostService.mockRejectedValue(serviceError);

      await patchPostHandler(req, res, next);

      expect(mockPatchPostService).toHaveBeenCalledWith({
        post_id: postId,
        author_id: newAuthorId,
        post_text: undefined,
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

