import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import httpStatusCodes from 'http-status-codes';
import { setup, cleanup, closeDatabase } from '../setup.js';
import { createUserHandler } from '#handlers/User/createUser.js';
import { listUserHandler } from '#handlers/User/listUsers.js';
import { listUserByIdHandler } from '#handlers/User/listUserById.js';
import { updateUserHandler } from '#handlers/User/updateUser.js';
import { patchUserHandler } from '#handlers/User/patchUser.js';
import { deleteUserHandler } from '#handlers/User/deleteUser.js';

describe('User Integration Tests', () => {
  let mockReq, mockRes, mockNext;

  const createMockRequest = (body = {}, params = {}) => ({
    body,
    params,
    headers: {},
    method: 'POST',
    path: '/api/v1/user',
    ip: '127.0.0.1',
  });

  const createMockResponse = () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
    };
    return res;
  };

  beforeAll(async () => {
    await setup();
  });

  afterAll(async () => {
    await cleanup();
    await closeDatabase();
  });

  beforeEach(async () => {
    await cleanup();
    mockReq = createMockRequest();
    mockRes = createMockResponse();
    mockNext = jest.fn();
  });

  describe('CREATE - Criar usuário', () => {
    it('deve criar um usuário com sucesso', async () => {
      mockReq.body = {
        user_email: 'teste@gmail.com',
        user_password: 'Senha123!',
        full_name: 'João Silva',
      };

      await createUserHandler(mockReq, mockRes, mockNext);

      if (mockRes.status.mock.calls[0][0] !== httpStatusCodes.CREATED) {
        console.error('Error response:', mockRes.json.mock.calls[0]?.[0]);
      }
      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.CREATED);
      expect(mockRes.send).toHaveBeenCalled();
      const responseData = mockRes.send.mock.calls[0][0];
      expect(responseData).toHaveProperty('user_id');
      expect(responseData.user_email).toBe('teste@gmail.com');
      expect(responseData.full_name).toBe('João Silva');
      expect(responseData).not.toHaveProperty('user_password');
    });

    it('deve retornar erro quando email está vazio', async () => {
      mockReq.body = {
        user_email: '',
        user_password: 'Senha123!',
        full_name: 'João Silva',
      };

      await createUserHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
      expect(mockRes.json).toHaveBeenCalled();
      const errorResponse = mockRes.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('code');
      expect(errorResponse).toHaveProperty('message');
    });

    it('deve retornar erro quando email tem formato inválido', async () => {
      mockReq.body = {
        user_email: 'email-invalido',
        user_password: 'Senha123!',
        full_name: 'João Silva',
      };

      await createUserHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
      expect(mockRes.json).toHaveBeenCalled();
      const errorResponse = mockRes.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('code');
      expect(errorResponse).toHaveProperty('message');
    });

    it('deve retornar erro quando senha está vazia', async () => {
      mockReq.body = {
        user_email: 'teste@gmail.com',
        user_password: '',
        full_name: 'João Silva',
      };

      await createUserHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
      expect(mockRes.json).toHaveBeenCalled();
      const errorResponse = mockRes.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('code');
      expect(errorResponse).toHaveProperty('message');
    });

    it('deve retornar erro quando senha é muito curta', async () => {
      mockReq.body = {
        user_email: 'teste@gmail.com',
        user_password: 'Sen1!',
        full_name: 'João Silva',
      };

      await createUserHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
      expect(mockRes.json).toHaveBeenCalled();
      const errorResponse = mockRes.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('code');
      expect(errorResponse).toHaveProperty('message');
    });

    it('deve retornar erro quando senha não contém número', async () => {
      mockReq.body = {
        user_email: 'teste@gmail.com',
        user_password: 'SenhaSemNumero!',
        full_name: 'João Silva',
      };

      await createUserHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
      expect(mockRes.json).toHaveBeenCalled();
      const errorResponse = mockRes.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('code');
      expect(errorResponse).toHaveProperty('message');
    });

    it('deve retornar erro quando senha não contém caractere especial', async () => {
      mockReq.body = {
        user_email: 'teste@gmail.com',
        user_password: 'Senha123',
        full_name: 'João Silva',
      };

      await createUserHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
      expect(mockRes.json).toHaveBeenCalled();
      const errorResponse = mockRes.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('code');
      expect(errorResponse).toHaveProperty('message');
    });

    it('deve retornar erro quando full_name está vazio', async () => {
      mockReq.body = {
        user_email: 'teste@gmail.com',
        user_password: 'Senha123!',
        full_name: '',
      };

      await createUserHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
      expect(mockRes.json).toHaveBeenCalled();
      const errorResponse = mockRes.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('code');
      expect(errorResponse).toHaveProperty('message');
    });

    it('deve retornar erro ao tentar criar usuário com email duplicado', async () => {
      mockReq.body = {
        user_email: 'duplicado@gmail.com',
        user_password: 'Senha123!',
        full_name: 'Primeiro Usuário',
      };

      await createUserHandler(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.CREATED);

      mockRes = createMockResponse();

      await createUserHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(
        httpStatusCodes.CONFLICT
      );
      expect(mockRes.json).toHaveBeenCalled();
      const errorResponse = mockRes.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('code');
      expect(errorResponse).toHaveProperty('message');
    });
  });

  describe('READ - Listar usuários', () => {
    it('deve retornar lista vazia quando não há usuários', async () => {
      await listUserHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(mockRes.send).toHaveBeenCalled();
      const users = mockRes.send.mock.calls[0][0];
      expect(Array.isArray(users)).toBe(true);
      expect(users).toHaveLength(0);
    });

    it('deve retornar lista de usuários criados', async () => {
      mockReq.body = {
        user_email: 'usuario1@gmail.com',
        user_password: 'Senha123!',
        full_name: 'Usuário Um',
      };
      await createUserHandler(mockReq, mockRes, mockNext);

      mockRes = createMockResponse();
      mockReq.body = {
        user_email: 'usuario2@gmail.com',
        user_password: 'Senha123!',
        full_name: 'Usuário Dois',
      };
      await createUserHandler(mockReq, mockRes, mockNext);

      mockRes = createMockResponse();
      await listUserHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      const users = mockRes.send.mock.calls[0][0];
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThanOrEqual(2);
      expect(users[0]).toHaveProperty('user_id');
      expect(users[0]).toHaveProperty('user_email');
      expect(users[0]).toHaveProperty('full_name');
      expect(users[0]).not.toHaveProperty('user_password');
    });
  });

  describe('READ - Buscar usuário por ID', () => {
    it('deve retornar usuário quando ID existe', async () => {
      mockReq.body = {
        user_email: 'buscar@gmail.com',
        user_password: 'Senha123!',
        full_name: 'Usuário para Buscar',
      };
      await createUserHandler(mockReq, mockRes, mockNext);
      const userId = mockRes.send.mock.calls[0][0].user_id;

      mockRes = createMockResponse();
      mockReq.params = { id: userId.toString() };
      await listUserByIdHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      const user = mockRes.send.mock.calls[0][0];
      expect(user).toHaveProperty('user_id', userId);
      expect(user.user_email).toBe('buscar@gmail.com');
      expect(user.full_name).toBe('Usuário para Buscar');
      expect(user).not.toHaveProperty('user_password');
    });

    it('deve retornar erro quando ID não existe', async () => {
      mockReq.params = { id: '99999' };
      await listUserByIdHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.NOT_FOUND);
      expect(mockRes.json).toHaveBeenCalled();
      const errorResponse = mockRes.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('code');
      expect(errorResponse).toHaveProperty('message');
    });

    it('deve retornar erro quando ID é inválido', async () => {
      mockReq.params = { id: 'abc' };
      await listUserByIdHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
      expect(mockRes.json).toHaveBeenCalled();
      const errorResponse = mockRes.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('code');
      expect(errorResponse).toHaveProperty('message');
    });
  });

  describe('UPDATE - Atualizar usuário', () => {
    it('deve atualizar usuário com sucesso', async () => {
      mockReq.body = {
        user_email: 'atualizar@gmail.com',
        user_password: 'Senha123!',
        full_name: 'Nome Original',
      };
      await createUserHandler(mockReq, mockRes, mockNext);
      const userId = mockRes.send.mock.calls[0][0].user_id;

      mockRes = createMockResponse();
      mockReq.params = { id: userId.toString() };
      mockReq.body = {
        user_email: 'atualizado@gmail.com',
        user_password: 'NovaSenha123!',
        full_name: 'Nome Atualizado',
      };
      await updateUserHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      const updatedUser = mockRes.send.mock.calls[0][0];
      expect(updatedUser).toHaveProperty('user_id', userId);
      expect(updatedUser.user_email).toBe('atualizado@gmail.com');
      expect(updatedUser.full_name).toBe('Nome Atualizado');
      expect(updatedUser).not.toHaveProperty('user_password');
    });

    it('deve retornar erro quando ID não existe', async () => {
      mockReq.params = { id: '99999' };
      mockReq.body = {
        user_email: 'teste@gmail.com',
        user_password: 'Senha123!',
        full_name: 'Teste',
      };
      await updateUserHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.NOT_FOUND);
      expect(mockRes.json).toHaveBeenCalled();
      const errorResponse = mockRes.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('code');
      expect(errorResponse).toHaveProperty('message');
    });

    it('deve retornar erro quando email é inválido na atualização', async () => {
      mockReq.body = {
        user_email: 'teste@gmail.com',
        user_password: 'Senha123!',
        full_name: 'Teste',
      };
      await createUserHandler(mockReq, mockRes, mockNext);
      const userId = mockRes.send.mock.calls[0][0].user_id;

      mockRes = createMockResponse();
      mockReq.params = { id: userId.toString() };
      mockReq.body = {
        user_email: 'email-invalido',
        user_password: 'Senha123!',
        full_name: 'Teste',
      };
      await updateUserHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
      expect(mockRes.json).toHaveBeenCalled();
      const errorResponse = mockRes.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('code');
      expect(errorResponse).toHaveProperty('message');
    });
  });

  describe('PATCH - Atualização parcial de usuário', () => {
    it('deve atualizar apenas o email', async () => {
      mockReq.body = {
        user_email: 'patch@gmail.com',
        user_password: 'Senha123!',
        full_name: 'Nome Original',
      };
      await createUserHandler(mockReq, mockRes, mockNext);
      const userId = mockRes.send.mock.calls[0][0].user_id;

      mockRes = createMockResponse();
      mockReq.params = { id: userId.toString() };
      mockReq.body = {
        user_email: 'patchatualizado@gmail.com',
      };
      await patchUserHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      const updatedUser = mockRes.send.mock.calls[0][0];
      expect(updatedUser.user_email).toBe('patchatualizado@gmail.com');
      expect(updatedUser.full_name).toBe('Nome Original');
    });

    it('deve atualizar apenas o nome', async () => {
      mockReq.body = {
        user_email: 'patch2@gmail.com',
        user_password: 'Senha123!',
        full_name: 'Nome Original',
      };
      await createUserHandler(mockReq, mockRes, mockNext);
      const userId = mockRes.send.mock.calls[0][0].user_id;

      mockRes = createMockResponse();
      mockReq.params = { id: userId.toString() };
      mockReq.body = {
        full_name: 'Nome Atualizado',
      };
      await patchUserHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      const updatedUser = mockRes.send.mock.calls[0][0];
      expect(updatedUser.full_name).toBe('Nome Atualizado');
      expect(updatedUser.user_email).toBe('patch2@gmail.com');
    });

    it('deve retornar erro quando nenhum campo é fornecido', async () => {
      mockReq.body = {
        user_email: 'patch3@gmail.com',
        user_password: 'Senha123!',
        full_name: 'Teste',
      };
      await createUserHandler(mockReq, mockRes, mockNext);
      const userId = mockRes.send.mock.calls[0][0].user_id;

      mockRes = createMockResponse();
      mockReq.params = { id: userId.toString() };
      mockReq.body = {};
      await patchUserHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
      expect(mockRes.json).toHaveBeenCalled();
      const errorResponse = mockRes.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('code');
      expect(errorResponse).toHaveProperty('message');
    });
  });

  describe('DELETE - Deletar usuário', () => {
    it('deve deletar usuário com sucesso', async () => {
      mockReq.body = {
        user_email: 'deletar@gmail.com',
        user_password: 'Senha123!',
        full_name: 'Usuário para Deletar',
      };
      await createUserHandler(mockReq, mockRes, mockNext);
      const userId = mockRes.send.mock.calls[0][0].user_id;

      mockRes = createMockResponse();
      mockReq.params = { id: userId.toString() };
      await deleteUserHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(
        httpStatusCodes.NO_CONTENT
      );

      mockRes = createMockResponse();
      await listUserByIdHandler(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.NOT_FOUND);
    });

    it('deve retornar erro quando ID não existe', async () => {
      mockReq.params = { id: '99999' };
      await deleteUserHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.NOT_FOUND);
      expect(mockRes.json).toHaveBeenCalled();
      const errorResponse = mockRes.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('code');
      expect(errorResponse).toHaveProperty('message');
    });

    it('deve retornar erro quando ID é inválido', async () => {
      mockReq.params = { id: 'abc' };
      await deleteUserHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
      expect(mockRes.json).toHaveBeenCalled();
      const errorResponse = mockRes.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('code');
      expect(errorResponse).toHaveProperty('message');
    });
  });
});
