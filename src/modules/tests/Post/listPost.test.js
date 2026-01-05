import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import httpStatusCodes from 'http-status-codes';

const mockGetAllPostsService = jest.fn();
const mockHttpErrorHandler = jest.fn(({ res, error }) => {
  return res.status(error.statusCode || 500).json({
    error: error.message,
    code: error.code,
    details: error.details,
  });
});

jest.unstable_mockModule('#services/index.js', () => ({
  getAllPostsService: mockGetAllPostsService,
}));

jest.unstable_mockModule('#common/handlers/index.js', () => ({
  httpErrorHandler: mockHttpErrorHandler,
}));

const { listPostHandler } = await import('#handlers/Posts/listPost.js');

describe('listPostHandler', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {};

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    next = jest.fn();
  });

  describe('Cenários de sucesso', () => {
    it('deve retornar lista de posts quando há posts cadastrados', async () => {
      const mockPosts = [
        {
          post_id: 1,
          author_id: 1,
          post_text: 'Primeiro post',
        },
        {
          post_id: 2,
          author_id: 2,
          post_text: 'Segundo post',
        },
      ];

      mockGetAllPostsService.mockResolvedValue({
        posts: mockPosts,
      });

      await listPostHandler(req, res, next);

      expect(mockGetAllPostsService).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(res.send).toHaveBeenCalledWith(mockPosts);
    });

    it('deve retornar lista vazia quando não há posts cadastrados', async () => {
      mockGetAllPostsService.mockResolvedValue({
        posts: [],
      });

      await listPostHandler(req, res, next);

      expect(mockGetAllPostsService).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(res.send).toHaveBeenCalledWith([]);
    });

    it('deve retornar lista vazia quando service retorna undefined', async () => {
      mockGetAllPostsService.mockResolvedValue({
        posts: undefined,
      });

      await listPostHandler(req, res, next);

      expect(mockGetAllPostsService).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(res.send).toHaveBeenCalledWith([]);
    });
  });

  describe('Cenários de erro - Service', () => {
    it('deve retornar erro quando service lança exceção', async () => {
      const serviceError = new Error('Database connection failed');
      mockGetAllPostsService.mockRejectedValue(serviceError);

      await listPostHandler(req, res, next);

      expect(mockGetAllPostsService).toHaveBeenCalled();
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

