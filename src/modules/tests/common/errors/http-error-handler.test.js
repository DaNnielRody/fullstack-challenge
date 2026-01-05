import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { StatusCodes } from 'http-status-codes';

const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

const { httpErrorHandler } = await import('#common/errors/handlers/http-error-handler.js');
const {
  PostValidationError,
  PostNotFoundError,
  UserValidationError,
  UserNotFoundError,
} = await import('#common/errors/index.js');

describe('httpErrorHandler', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      method: 'POST',
      path: '/api/posts',
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
      },
      ip: '192.168.1.100',
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
    };
  });

  describe('DomainErrors (400, 404, 409)', () => {
    it('deve retornar 400 para ValidationError com code e message', () => {
      const error = new PostValidationError(
        'Invalid post_text: must be a non-empty string',
        { post_text: '' }
      );

      httpErrorHandler({ req, res, error });

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        code: 'VALIDATION_ERROR',
        message: 'Invalid post_text: must be a non-empty string',
      });
      expect(res.end).toHaveBeenCalled();
    });

    it('deve retornar 404 para NotFoundError com code e message', () => {
      const error = new PostNotFoundError(999);

      httpErrorHandler({ req, res, error });

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        code: 'POST_NOT_FOUND',
        message: 'Post not found',
      });
      expect(res.end).toHaveBeenCalled();
    });

    it('deve incluir context do erro no log mas não na resposta', () => {
      const error = new UserValidationError('Invalid email format', {
        user_email: 'invalid-email',
      });

      httpErrorHandler({ req, res, error });

      expect(mockConsoleError).toHaveBeenCalled();

      expect(res.json).toHaveBeenCalledWith({
        code: 'VALIDATION_ERROR',
        message: 'Invalid email format',
      });
    });

    it('deve usar INTERNAL_ERROR como code padrão quando DomainError não tem code', () => {
      const error = new PostValidationError('Custom error', {});
      delete error.code;

      httpErrorHandler({ req, res, error });

      expect(res.json).toHaveBeenCalledWith({
        code: 'INTERNAL_ERROR',
        message: 'Custom error',
      });
    });
  });

  describe('Internal Server Errors (500)', () => {
    it('deve retornar 500 para erro genérico SEM expor message', () => {
      const error = new Error('Database connection failed');

      httpErrorHandler({ req, res, error });

      expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        code: 'INTERNAL_ERROR',
      });
      expect(res.end).toHaveBeenCalled();
    });

    it('deve retornar código de status customizado para erro não-DomainError e não-500', () => {
      const error = new Error('Unauthorized access');
      error.statusCode = 403;

      httpErrorHandler({ req, res, error });

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        code: 'INTERNAL_ERROR',
        message: 'Unauthorized access',
      });
      expect(res.end).toHaveBeenCalled();
    });

    it('deve logar stack trace para erros 500', () => {
      const error = new Error('Critical database error');

      httpErrorHandler({ req, res, error });

      expect(mockConsoleError).toHaveBeenCalled();
      const loggedData = JSON.parse(mockConsoleError.mock.calls[0][0]);

      expect(loggedData.level).toBe('error');
      expect(loggedData.stack).toBeDefined();
      expect(loggedData.error_name).toBe('Error');
    });
  });

  describe('Logging', () => {
    it('deve logar nível "warn" para erros 4xx', () => {
      const error = new UserNotFoundError(123);

      httpErrorHandler({ req, res, error });

      const loggedData = JSON.parse(mockConsoleError.mock.calls[0][0]);

      expect(loggedData.level).toBe('warn');
      expect(loggedData.error_code).toBe('USER_NOT_FOUND');
    });

    it('deve logar nível "error" para erros 5xx', () => {
      const error = new Error('Internal error');

      httpErrorHandler({ req, res, error });

      const loggedData = JSON.parse(mockConsoleError.mock.calls[0][0]);

      expect(loggedData.level).toBe('error');
      expect(loggedData.stack).toBeDefined();
    });

    it('deve incluir informações da requisição no log', () => {
      const error = new PostValidationError('Invalid data', {});

      httpErrorHandler({ req, res, error });

      const loggedData = JSON.parse(mockConsoleError.mock.calls[0][0]);

      expect(loggedData.request).toMatchObject({
        method: 'POST',
        path: '/api/posts',
        status: 400,
        ip: '192.168.1.100',
      });
    });

    it('deve gerar error_id único para cada erro', () => {
      const error1 = new PostValidationError('Error 1', {});
      const error2 = new PostValidationError('Error 2', {});

      httpErrorHandler({ req, res, error: error1 });
      const log1 = JSON.parse(mockConsoleError.mock.calls[0][0]);

      httpErrorHandler({ req, res, error: error2 });
      const log2 = JSON.parse(mockConsoleError.mock.calls[1][0]);

      expect(log1.error_id).toBeDefined();
      expect(log2.error_id).toBeDefined();
      expect(log1.error_id).not.toBe(log2.error_id);
    });
  });

  describe('User-Agent Parsing', () => {
    it('deve parsear Chrome corretamente', () => {
      req.headers['user-agent'] =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36';

      const error = new Error('Test');
      httpErrorHandler({ req, res, error });

      const loggedData = JSON.parse(mockConsoleError.mock.calls[0][0]);
      expect(loggedData.request.user_agent).toMatch(/^Chrome\//);
    });

    it('deve parsear Firefox corretamente', () => {
      req.headers['user-agent'] =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0';

      const error = new Error('Test');
      httpErrorHandler({ req, res, error });

      const loggedData = JSON.parse(mockConsoleError.mock.calls[0][0]);
      expect(loggedData.request.user_agent).toMatch(/^Firefox\//);
    });

    it('deve parsear Safari corretamente', () => {
      req.headers['user-agent'] =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';

      const error = new Error('Test');
      httpErrorHandler({ req, res, error });

      const loggedData = JSON.parse(mockConsoleError.mock.calls[0][0]);
      expect(loggedData.request.user_agent).toMatch(/^Safari\//);
    });

    it('deve retornar primeiro token se não reconhecer o browser', () => {
      req.headers['user-agent'] = 'CustomBot/1.0 (compatible)';

      const error = new Error('Test');
      httpErrorHandler({ req, res, error });

      const loggedData = JSON.parse(mockConsoleError.mock.calls[0][0]);
      expect(loggedData.request.user_agent).toBe('CustomBot/1.0');
    });

    it('deve retornar undefined se user-agent não existir', () => {
      delete req.headers['user-agent'];

      const error = new Error('Test');
      httpErrorHandler({ req, res, error });

      const loggedData = JSON.parse(mockConsoleError.mock.calls[0][0]);
      expect(loggedData.request.user_agent).toBeUndefined();
    });
  });

  describe('IP Handling', () => {
    it('deve usar req.ip quando disponível', () => {
      req.ip = '203.0.113.45';

      const error = new Error('Test');
      httpErrorHandler({ req, res, error });

      const loggedData = JSON.parse(mockConsoleError.mock.calls[0][0]);
      expect(loggedData.request.ip).toBe('203.0.113.45');
    });

    it('deve usar x-forwarded-for quando req.ip não está disponível', () => {
      delete req.ip;
      req.headers['x-forwarded-for'] = '203.0.113.45, 198.51.100.178';

      const error = new Error('Test');
      httpErrorHandler({ req, res, error });

      const loggedData = JSON.parse(mockConsoleError.mock.calls[0][0]);
      expect(loggedData.request.ip).toBe('203.0.113.45');
    });

    it('deve usar originalUrl se disponível, senão path', () => {
      req.originalUrl = '/api/posts?filter=active';

      const error = new Error('Test');
      httpErrorHandler({ req, res, error });

      const loggedData = JSON.parse(mockConsoleError.mock.calls[0][0]);
      expect(loggedData.request.path).toBe('/api/posts?filter=active');
    });
  });

  describe('Context Fields', () => {
    it('deve incluir email no context quando presente', () => {
      const error = new UserValidationError('Invalid email', {});
      error.email = 'test@example.com';

      httpErrorHandler({ req, res, error });

      const loggedData = JSON.parse(mockConsoleError.mock.calls[0][0]);
      expect(loggedData.context.email).toBe('test@example.com');
    });

    it('deve incluir user_id no context quando presente', () => {
      const error = new UserNotFoundError(123);
      error.user_id = 123;

      httpErrorHandler({ req, res, error });

      const loggedData = JSON.parse(mockConsoleError.mock.calls[0][0]);
      expect(loggedData.context.user_id).toBe(123);
    });

    it('deve incluir post_id no context quando presente', () => {
      const error = new PostNotFoundError(456);
      error.post_id = 456;

      httpErrorHandler({ req, res, error });

      const loggedData = JSON.parse(mockConsoleError.mock.calls[0][0]);
      expect(loggedData.context.post_id).toBe(456);
    });

    it('deve incluir author_id no context quando presente', () => {
      const error = new PostValidationError('Invalid data', {});
      error.author_id = 789;

      httpErrorHandler({ req, res, error });

      const loggedData = JSON.parse(mockConsoleError.mock.calls[0][0]);
      expect(loggedData.context.author_id).toBe(789);
    });

    it('deve incluir details no context quando presente', () => {
      const error = new PostValidationError('Invalid data', {
        post_text: '',
        author_id: 0,
      });

      httpErrorHandler({ req, res, error });

      const loggedData = JSON.parse(mockConsoleError.mock.calls[0][0]);
      expect(loggedData.context.details).toEqual({
        post_text: '',
        author_id: 0,
      });
    });

    it('deve incluir entityId no context quando presente', () => {
      const error = new PostValidationError('Invalid data', {});
      error.entityId = 123;

      httpErrorHandler({ req, res, error });

      const loggedData = JSON.parse(mockConsoleError.mock.calls[0][0]);
      expect(loggedData.context.entity_id).toBe(123);
    });

    it('deve incluir referenceId no context quando presente', () => {
      const error = new PostValidationError('Invalid data', {});
      error.referenceId = 456;

      httpErrorHandler({ req, res, error });

      const loggedData = JSON.parse(mockConsoleError.mock.calls[0][0]);
      expect(loggedData.context.reference_id).toBe(456);
    });
  });

  describe('Edge Cases', () => {
    it('deve funcionar quando req não tem headers', () => {
      delete req.headers;

      const error = new Error('Test');

      expect(() => {
        httpErrorHandler({ req, res, error });
      }).not.toThrow();
    });

    it('deve funcionar quando error não tem statusCode', () => {
      const error = new Error('Generic error');
      delete error.statusCode;

      httpErrorHandler({ req, res, error });

      expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('deve funcionar quando error não tem code', () => {
      const error = new Error('Generic error');
      delete error.code;

      httpErrorHandler({ req, res, error });

      const loggedData = JSON.parse(mockConsoleError.mock.calls[0][0]);
      expect(loggedData.error_code).toBe('INTERNAL_ERROR');
    });
  });
});