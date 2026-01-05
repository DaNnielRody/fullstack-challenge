import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import httpStatusCodes from 'http-status-codes';

const mockGetAllUsersService = jest.fn();
const mockHttpErrorHandler = jest.fn(({ res, error }) => {
  return res.status(error.statusCode || 500).json({
    error: error.message,
    code: error.code,
    details: error.details,
  });
});

jest.unstable_mockModule('#services/index.js', () => ({
  getAllUsersService: mockGetAllUsersService,
}));

jest.unstable_mockModule('#common/handlers/index.js', () => ({
  httpErrorHandler: mockHttpErrorHandler,
}));

const { listUserHandler } = await import('#handlers/User/listUsers.js');

describe('listUserHandler', () => {
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
    it('deve retornar lista de usuários quando há usuários cadastrados', async () => {
      const mockUsers = [
        {
          user_id: 1,
          user_email: 'usuario1@gmail.com',
          full_name: 'João Silva',
        },
        {
          user_id: 2,
          user_email: 'usuario2@gmail.com',
          full_name: 'Maria Santos',
        },
      ];

      mockGetAllUsersService.mockResolvedValue({
        users: mockUsers,
      });

      await listUserHandler(req, res, next);

      expect(mockGetAllUsersService).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(res.send).toHaveBeenCalledWith(mockUsers);
    });

    it('deve retornar lista vazia quando não há usuários cadastrados', async () => {
      mockGetAllUsersService.mockResolvedValue({
        users: [],
      });

      await listUserHandler(req, res, next);

      expect(mockGetAllUsersService).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(res.send).toHaveBeenCalledWith([]);
    });

    it('deve retornar lista vazia quando service retorna undefined', async () => {
      mockGetAllUsersService.mockResolvedValue({
        users: undefined,
      });

      await listUserHandler(req, res, next);

      expect(mockGetAllUsersService).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(res.send).toHaveBeenCalledWith([]);
    });
  });

  describe('Cenários de erro - Service', () => {
    it('deve retornar erro quando service lança exceção', async () => {
      const serviceError = new Error('Database connection failed');
      mockGetAllUsersService.mockRejectedValue(serviceError);

      await listUserHandler(req, res, next);

      expect(mockGetAllUsersService).toHaveBeenCalled();
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

