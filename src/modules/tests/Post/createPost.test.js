import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import httpStatusCodes from 'http-status-codes';

const mockCreatePostService = jest.fn();
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
  createPostService: mockCreatePostService,
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

const { createPostHandler } = await import('#handlers/Posts/createPost.js');
const {
  PostValidationError,
  PostCreationError,
  AuthorNotFoundError,
} = await import('#common/errors/index.js');

describe('createPostHandler', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
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
    it('deve criar um post com post_text e author_id válidos', async () => {
      const postText = 'Este é um post de teste';
      const authorId = 1;

      req.body = {
        post_text: postText,
        author_id: authorId,
      };

      mockValidateStringAndThrow.mockImplementation(() => {});
      mockValidatePositiveIntegerAndThrow.mockReturnValue(authorId);

      const mockCreatedPost = {
        post_id: 1,
        author_id: authorId,
        post_text: postText,
      };

      mockCreatePostService.mockResolvedValue(mockCreatedPost);

      await createPostHandler(req, res, next);

      expect(mockValidateStringAndThrow).toHaveBeenCalledWith(
        postText,
        'post_text',
        PostValidationError,
        mockLogError,
        'CREATE',
        'POST'
      );
      expect(mockValidatePositiveIntegerAndThrow).toHaveBeenCalledWith(
        authorId,
        'author_id',
        PostValidationError,
        mockLogError,
        'CREATE',
        'POST'
      );
      expect(mockCreatePostService).toHaveBeenCalledWith({
        post_text: postText,
        author_id: authorId,
      });
      expect(res.status).toHaveBeenCalledWith(httpStatusCodes.CREATED);
      expect(res.send).toHaveBeenCalledWith(mockCreatedPost);
    });

    it('deve criar um post com texto longo', async () => {
      const postText =
        'Este é um post muito longo que contém várias palavras e pode ter até 200 caracteres conforme o schema do banco de dados permite armazenar textos de posts.';
      const authorId = 2;

      req.body = {
        post_text: postText,
        author_id: authorId,
      };

      mockValidateStringAndThrow.mockImplementation(() => {});
      mockValidatePositiveIntegerAndThrow.mockReturnValue(authorId);

      const mockCreatedPost = {
        post_id: 2,
        author_id: authorId,
        post_text: postText,
      };

      mockCreatePostService.mockResolvedValue(mockCreatedPost);

      await createPostHandler(req, res, next);

      expect(mockCreatePostService).toHaveBeenCalledWith({
        post_text: postText,
        author_id: authorId,
      });
      expect(res.status).toHaveBeenCalledWith(httpStatusCodes.CREATED);
      expect(res.send).toHaveBeenCalledWith(mockCreatedPost);
    });
  });

  describe('Cenários de erro - Validação de string', () => {
    it('deve retornar erro quando post_text está vazio', async () => {
      req.body = {
        post_text: '',
        author_id: 1,
      };

      const validationError = new PostValidationError(
        'Invalid post_text: must be a non-empty string',
        { post_text: '' }
      );

      mockValidateStringAndThrow.mockImplementation(
        (value, fieldName, ErrorClass, logErrorFn, action, entity) => {
          logErrorFn(action, entity, validationError, { [fieldName]: value });
          throw validationError;
        }
      );

      await createPostHandler(req, res, next);

      expect(mockValidateStringAndThrow).toHaveBeenCalledWith(
        '',
        'post_text',
        PostValidationError,
        mockLogError,
        'CREATE',
        'POST'
      );
      expect(mockLogError).toHaveBeenCalledWith(
        'CREATE',
        'POST',
        validationError,
        { post_text: '' }
      );
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: validationError,
      });
      expect(mockValidatePositiveIntegerAndThrow).not.toHaveBeenCalled();
      expect(mockCreatePostService).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando post_text não é fornecido', async () => {
      req.body = {
        author_id: 1,
      };

      const validationError = new PostValidationError(
        'Invalid post_text: must be a non-empty string',
        { post_text: undefined }
      );

      mockValidateStringAndThrow.mockImplementation(
        (value, fieldName, ErrorClass, logErrorFn, action, entity) => {
          logErrorFn(action, entity, validationError, { [fieldName]: value });
          throw validationError;
        }
      );

      await createPostHandler(req, res, next);

      expect(mockValidateStringAndThrow).toHaveBeenCalledWith(
        undefined,
        'post_text',
        PostValidationError,
        mockLogError,
        'CREATE',
        'POST'
      );
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: validationError,
      });
      expect(mockCreatePostService).not.toHaveBeenCalled();
    });
  });

  describe('Cenários de erro - Validação de author_id', () => {
    it('deve retornar erro quando author_id não é um inteiro positivo', async () => {
      req.body = {
        post_text: 'Post de teste',
        author_id: 0,
      };

      const validationError = new PostValidationError(
        'Invalid author_id: must be a positive integer',
        { author_id: 0 }
      );

      mockValidateStringAndThrow.mockImplementation(() => {});
      mockValidatePositiveIntegerAndThrow.mockImplementation(
        (value, fieldName, ErrorClass, logErrorFn, action, entity) => {
          logErrorFn(action, entity, validationError, { [fieldName]: value });
          throw validationError;
        }
      );

      await createPostHandler(req, res, next);

      expect(mockValidatePositiveIntegerAndThrow).toHaveBeenCalledWith(
        0,
        'author_id',
        PostValidationError,
        mockLogError,
        'CREATE',
        'POST'
      );
      expect(mockLogError).toHaveBeenCalledWith(
        'CREATE',
        'POST',
        validationError,
        { author_id: 0 }
      );
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: validationError,
      });
      expect(mockCreatePostService).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando author_id é negativo', async () => {
      req.body = {
        post_text: 'Post de teste',
        author_id: -1,
      };

      const validationError = new PostValidationError(
        'Invalid author_id: must be a positive integer',
        { author_id: -1 }
      );

      mockValidateStringAndThrow.mockImplementation(() => {});
      mockValidatePositiveIntegerAndThrow.mockImplementation(
        (value, fieldName, ErrorClass, logErrorFn, action, entity) => {
          logErrorFn(action, entity, validationError, { [fieldName]: value });
          throw validationError;
        }
      );

      await createPostHandler(req, res, next);

      expect(mockValidatePositiveIntegerAndThrow).toHaveBeenCalledWith(
        -1,
        'author_id',
        PostValidationError,
        mockLogError,
        'CREATE',
        'POST'
      );
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: validationError,
      });
      expect(mockCreatePostService).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando author_id não é um número', async () => {
      req.body = {
        post_text: 'Post de teste',
        author_id: 'abc',
      };

      const validationError = new PostValidationError(
        'Invalid author_id: must be a positive integer',
        { author_id: 'abc' }
      );

      mockValidateStringAndThrow.mockImplementation(() => {});
      mockValidatePositiveIntegerAndThrow.mockImplementation(
        (value, fieldName, ErrorClass, logErrorFn, action, entity) => {
          logErrorFn(action, entity, validationError, { [fieldName]: value });
          throw validationError;
        }
      );

      await createPostHandler(req, res, next);

      expect(mockValidatePositiveIntegerAndThrow).toHaveBeenCalledWith(
        'abc',
        'author_id',
        PostValidationError,
        mockLogError,
        'CREATE',
        'POST'
      );
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: validationError,
      });
      expect(mockCreatePostService).not.toHaveBeenCalled();
    });
  });

  describe('Cenários de erro - Service', () => {
    it('deve retornar erro quando autor não é encontrado', async () => {
      const postText = 'Post de teste';
      const authorId = 999;

      req.body = {
        post_text: postText,
        author_id: authorId,
      };

      mockValidateStringAndThrow.mockImplementation(() => {});
      mockValidatePositiveIntegerAndThrow.mockReturnValue(authorId);

      const notFoundError = new AuthorNotFoundError(authorId);
      mockCreatePostService.mockRejectedValue(notFoundError);

      await createPostHandler(req, res, next);

      expect(mockCreatePostService).toHaveBeenCalledWith({
        post_text: postText,
        author_id: authorId,
      });
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: notFoundError,
      });
      expect(res.status).not.toHaveBeenCalledWith(httpStatusCodes.CREATED);
      expect(res.send).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando service lança exceção de criação', async () => {
      const postText = 'Post de teste';
      const authorId = 1;

      req.body = {
        post_text: postText,
        author_id: authorId,
      };

      mockValidateStringAndThrow.mockImplementation(() => {});
      mockValidatePositiveIntegerAndThrow.mockReturnValue(authorId);

      const creationError = new PostCreationError('Failed to create post');
      mockCreatePostService.mockRejectedValue(creationError);

      await createPostHandler(req, res, next);

      expect(mockCreatePostService).toHaveBeenCalledWith({
        post_text: postText,
        author_id: authorId,
      });
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: creationError,
      });
      expect(res.status).not.toHaveBeenCalledWith(httpStatusCodes.CREATED);
      expect(res.send).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando service lança exceção genérica', async () => {
      const postText = 'Post de teste';
      const authorId = 1;

      req.body = {
        post_text: postText,
        author_id: authorId,
      };

      mockValidateStringAndThrow.mockImplementation(() => {});
      mockValidatePositiveIntegerAndThrow.mockReturnValue(authorId);

      const serviceError = new Error('Database connection failed');
      mockCreatePostService.mockRejectedValue(serviceError);

      await createPostHandler(req, res, next);

      expect(mockCreatePostService).toHaveBeenCalledWith({
        post_text: postText,
        author_id: authorId,
      });
      expect(mockHttpErrorHandler).toHaveBeenCalledWith({
        req,
        res,
        error: serviceError,
      });
      expect(res.status).not.toHaveBeenCalledWith(httpStatusCodes.CREATED);
      expect(res.send).not.toHaveBeenCalled();
    });
  });
});

