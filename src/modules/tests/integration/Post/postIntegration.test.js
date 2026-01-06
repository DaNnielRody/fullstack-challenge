import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import httpStatusCodes from 'http-status-codes';
import { setup, cleanup, closeDatabase } from '../setup.js';
import { createUserHandler } from '#handlers/User/createUser.js';
import { createPostHandler } from '#handlers/Posts/createPost.js';
import { listPostHandler } from '#handlers/Posts/listPost.js';
import { listPostByPostIdHandler } from '#handlers/Posts/listPostByPostId.js';
import { listPostByUserIdHandler } from '#handlers/Posts/listPostByUserId.js';
import { updatePostHandler } from '#handlers/Posts/updatePost.js';
import { patchPostHandler } from '#handlers/Posts/patchPost.js';
import { deletePostHandler } from '#handlers/Posts/deletePost.js';

describe('Post Integration Tests', () => {
  let mockReq, mockRes, mockNext;
  let testUserId1;
  let testUserId2;

  const createMockRequest = (body = {}, params = {}) => ({
    body,
    params,
    headers: {},
    method: 'POST',
    path: '/api/v1/post',
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

    const user1 = {
      user_email: 'autor1@gmail.com',
      user_password: 'Senha123!',
      full_name: 'Autor Um',
    };

    const user2 = {
      user_email: 'autor2@gmail.com',
      user_password: 'Senha123!',
      full_name: 'Autor Dois',
    };

    mockReq.body = user1;
    await createUserHandler(mockReq, mockRes, mockNext);
    if (!mockRes.send.mock.calls.length) {
      throw new Error(`Failed to create user1: ${JSON.stringify(mockRes.json.mock.calls[0]?.[0] || 'Unknown error')}`);
    }
    testUserId1 = mockRes.send.mock.calls[0][0].user_id;

    mockRes = createMockResponse();
    mockReq.body = user2;
    await createUserHandler(mockReq, mockRes, mockNext);
    if (!mockRes.send.mock.calls.length) {
      throw new Error(`Failed to create user2: ${JSON.stringify(mockRes.json.mock.calls[0]?.[0] || 'Unknown error')}`);
    }
    testUserId2 = mockRes.send.mock.calls[0][0].user_id;
  });

  describe('CREATE - Criar post', () => {
    it('deve criar um post com sucesso', async () => {
      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.body = {
        post_text: 'Este é um post de teste',
        author_id: testUserId1,
      };

      await createPostHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.CREATED);
      expect(mockRes.send).toHaveBeenCalled();
      const responseData = mockRes.send.mock.calls[0][0];
      expect(responseData).toHaveProperty('post_id');
      expect(responseData.post_text).toBe('Este é um post de teste');
      expect(responseData.author_id).toBe(testUserId1);
    });

    it('deve criar um post com texto longo (até 200 caracteres)', async () => {
      const longText = 'a'.repeat(200);
      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.body = {
        post_text: longText,
        author_id: testUserId1,
      };

      await createPostHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.CREATED);
      const responseData = mockRes.send.mock.calls[0][0];
      expect(responseData.post_text).toBe(longText);
    });

    it('deve retornar erro quando post_text está vazio', async () => {
      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.body = {
        post_text: '',
        author_id: testUserId1,
      };

      await createPostHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
      expect(mockRes.json).toHaveBeenCalled();
      const errorResponse = mockRes.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('code');
      expect(errorResponse).toHaveProperty('message');
    });

    it('deve retornar erro quando author_id não é fornecido', async () => {
      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.body = {
        post_text: 'Post sem autor',
      };

      await createPostHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
      expect(mockRes.json).toHaveBeenCalled();
      const errorResponse = mockRes.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('code');
      expect(errorResponse).toHaveProperty('message');
    });

    it('deve retornar erro quando author_id não é um número', async () => {
      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.body = {
        post_text: 'Post com autor inválido',
        author_id: 'abc',
      };

      await createPostHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
      expect(mockRes.json).toHaveBeenCalled();
      const errorResponse = mockRes.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('code');
      expect(errorResponse).toHaveProperty('message');
    });

    it('deve retornar erro quando author_id é negativo', async () => {
      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.body = {
        post_text: 'Post com autor negativo',
        author_id: -1,
      };

      await createPostHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
      expect(mockRes.json).toHaveBeenCalled();
      const errorResponse = mockRes.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('code');
      expect(errorResponse).toHaveProperty('message');
    });

    it('deve retornar erro quando author_id não existe', async () => {
      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.body = {
        post_text: 'Post com autor inexistente',
        author_id: 99999,
      };

      await createPostHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.NOT_FOUND);
      expect(mockRes.json).toHaveBeenCalled();
      const errorResponse = mockRes.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('code');
      expect(errorResponse).toHaveProperty('message');
    });
  });

  describe('READ - Listar todos os posts', () => {
    it('deve retornar lista vazia quando não há posts', async () => {
      mockReq = createMockRequest();
      mockRes = createMockResponse();
      await listPostHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(mockRes.send).toHaveBeenCalled();
      const posts = mockRes.send.mock.calls[0][0];
      expect(Array.isArray(posts)).toBe(true);
      expect(posts).toHaveLength(0);
    });

    it('deve retornar lista de posts criados', async () => {
      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.body = {
        post_text: 'Primeiro post',
        author_id: testUserId1,
      };
      await createPostHandler(mockReq, mockRes, mockNext);

      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.body = {
        post_text: 'Segundo post',
        author_id: testUserId2,
      };
      await createPostHandler(mockReq, mockRes, mockNext);

      mockReq = createMockRequest();
      mockRes = createMockResponse();
      await listPostHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      const posts = mockRes.send.mock.calls[0][0];
      expect(Array.isArray(posts)).toBe(true);
      expect(posts.length).toBeGreaterThanOrEqual(2);
      expect(posts[0]).toHaveProperty('post_id');
      expect(posts[0]).toHaveProperty('post_text');
      expect(posts[0]).toHaveProperty('author_id');
    });
  });

  describe('READ - Buscar post por ID', () => {
    it('deve retornar post quando ID existe', async () => {
      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.body = {
        post_text: 'Post para buscar',
        author_id: testUserId1,
      };
      await createPostHandler(mockReq, mockRes, mockNext);
      const postId = mockRes.send.mock.calls[0][0].post_id;

      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.params = { id: postId.toString() };
      await listPostByPostIdHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      const post = mockRes.send.mock.calls[0][0];
      expect(post).toHaveProperty('post_id', postId);
      expect(post.post_text).toBe('Post para buscar');
      expect(post.author_id).toBe(testUserId1);
    });

    it('deve retornar erro quando ID não existe', async () => {
      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.params = { id: '99999' };
      await listPostByPostIdHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.NOT_FOUND);
      expect(mockRes.json).toHaveBeenCalled();
      const errorResponse = mockRes.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('code');
      expect(errorResponse).toHaveProperty('message');
    });

    it('deve retornar erro quando ID é inválido', async () => {
      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.params = { id: 'abc' };
      await listPostByPostIdHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
      expect(mockRes.json).toHaveBeenCalled();
      const errorResponse = mockRes.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('code');
      expect(errorResponse).toHaveProperty('message');
    });
  });

  describe('READ - Buscar posts por user_id', () => {
    it('deve retornar posts de um usuário específico', async () => {
      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.body = {
        post_text: 'Post do usuário 1',
        author_id: testUserId1,
      };
      await createPostHandler(mockReq, mockRes, mockNext);

      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.body = {
        post_text: 'Outro post do usuário 1',
        author_id: testUserId1,
      };
      await createPostHandler(mockReq, mockRes, mockNext);

      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.body = {
        post_text: 'Post do usuário 2',
        author_id: testUserId2,
      };
      await createPostHandler(mockReq, mockRes, mockNext);

      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.params = { id: testUserId1.toString() };
      await listPostByUserIdHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      const posts = mockRes.send.mock.calls[0][0];
      expect(Array.isArray(posts)).toBe(true);
      expect(posts.length).toBe(2);
      posts.forEach((post) => {
        expect(post.author_id).toBe(testUserId1);
      });
    });

    it('deve retornar lista vazia quando usuário não tem posts', async () => {
      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.params = { id: testUserId1.toString() };
      await listPostByUserIdHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      const posts = mockRes.send.mock.calls[0][0];
      expect(Array.isArray(posts)).toBe(true);
      expect(posts).toHaveLength(0);
    });

    it('deve retornar erro quando user_id é inválido', async () => {
      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.params = { id: 'abc' };
      await listPostByUserIdHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
      expect(mockRes.json).toHaveBeenCalled();
      const errorResponse = mockRes.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('code');
      expect(errorResponse).toHaveProperty('message');
    });
  });

  describe('UPDATE - Atualizar post', () => {
    it('deve atualizar post com sucesso', async () => {
      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.body = {
        post_text: 'Post original',
        author_id: testUserId1,
      };
      await createPostHandler(mockReq, mockRes, mockNext);
      const postId = mockRes.send.mock.calls[0][0].post_id;

      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.params = { id: postId.toString() };
      mockReq.body = {
        post_text: 'Post atualizado',
        author_id: testUserId2,
      };
      await updatePostHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      const updatedPost = mockRes.send.mock.calls[0][0];
      expect(updatedPost.post_text).toBe('Post atualizado');
      expect(updatedPost.author_id).toBe(testUserId2);
      expect(updatedPost.post_id).toBe(postId);
    });

    it('deve retornar erro quando ID não existe', async () => {
      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.params = { id: '99999' };
      mockReq.body = {
        post_text: 'Post atualizado',
        author_id: testUserId1,
      };
      await updatePostHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.NOT_FOUND);
      expect(mockRes.json).toHaveBeenCalled();
      const errorResponse = mockRes.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('code');
      expect(errorResponse).toHaveProperty('message');
    });

    it('deve retornar erro quando post_text está vazio', async () => {
      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.body = {
        post_text: 'Post original',
        author_id: testUserId1,
      };
      await createPostHandler(mockReq, mockRes, mockNext);
      const postId = mockRes.send.mock.calls[0][0].post_id;

      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.params = { id: postId.toString() };
      mockReq.body = {
        post_text: '',
        author_id: testUserId1,
      };
      await updatePostHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
      expect(mockRes.json).toHaveBeenCalled();
      const errorResponse = mockRes.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('code');
      expect(errorResponse).toHaveProperty('message');
    });

    it('deve retornar erro quando author_id não existe', async () => {
      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.body = {
        post_text: 'Post original',
        author_id: testUserId1,
      };
      await createPostHandler(mockReq, mockRes, mockNext);
      const postId = mockRes.send.mock.calls[0][0].post_id;

      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.params = { id: postId.toString() };
      mockReq.body = {
        post_text: 'Post atualizado',
        author_id: 99999,
      };
      await updatePostHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.NOT_FOUND);
      expect(mockRes.json).toHaveBeenCalled();
      const errorResponse = mockRes.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('code');
      expect(errorResponse).toHaveProperty('message');
    });
  });

  describe('PATCH - Atualização parcial de post', () => {
    it('deve atualizar apenas o texto do post', async () => {
      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.body = {
        post_text: 'Post original',
        author_id: testUserId1,
      };
      await createPostHandler(mockReq, mockRes, mockNext);
      const postId = mockRes.send.mock.calls[0][0].post_id;

      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.params = { id: postId.toString() };
      mockReq.body = {
        post_text: 'Texto atualizado',
      };
      await patchPostHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      const updatedPost = mockRes.send.mock.calls[0][0];
      expect(updatedPost.post_text).toBe('Texto atualizado');
      expect(updatedPost.author_id).toBe(testUserId1);
    });

    it('deve atualizar apenas o author_id', async () => {
      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.body = {
        post_text: 'Post original',
        author_id: testUserId1,
      };
      await createPostHandler(mockReq, mockRes, mockNext);
      const postId = mockRes.send.mock.calls[0][0].post_id;

      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.params = { id: postId.toString() };
      mockReq.body = {
        author_id: testUserId2,
      };
      await patchPostHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      const updatedPost = mockRes.send.mock.calls[0][0];
      expect(updatedPost.author_id).toBe(testUserId2);
      expect(updatedPost.post_text).toBe('Post original');
    });

    it('deve retornar erro quando nenhum campo é fornecido', async () => {
      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.body = {
        post_text: 'Post original',
        author_id: testUserId1,
      };
      await createPostHandler(mockReq, mockRes, mockNext);
      const postId = mockRes.send.mock.calls[0][0].post_id;

      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.params = { id: postId.toString() };
      mockReq.body = {};
      await patchPostHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
      expect(mockRes.json).toHaveBeenCalled();
      const errorResponse = mockRes.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('code');
      expect(errorResponse).toHaveProperty('message');
    });
  });

  describe('DELETE - Deletar post', () => {
    it('deve deletar post com sucesso', async () => {
      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.body = {
        post_text: 'Post para deletar',
        author_id: testUserId1,
      };
      await createPostHandler(mockReq, mockRes, mockNext);
      const postId = mockRes.send.mock.calls[0][0].post_id;

      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.params = { id: postId.toString() };
      await deletePostHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(
        httpStatusCodes.NO_CONTENT
      );

      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.params = { id: postId.toString() };
      await listPostByPostIdHandler(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.NOT_FOUND);
    });

    it('deve retornar erro quando ID não existe', async () => {
      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.params = { id: '99999' };
      await deletePostHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.NOT_FOUND);
      expect(mockRes.json).toHaveBeenCalled();
      const errorResponse = mockRes.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('code');
      expect(errorResponse).toHaveProperty('message');
    });

    it('deve retornar erro quando ID é inválido', async () => {
      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.params = { id: 'abc' };
      await deletePostHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
      expect(mockRes.json).toHaveBeenCalled();
      const errorResponse = mockRes.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('code');
      expect(errorResponse).toHaveProperty('message');
    });
  });

  describe('Validações de integridade referencial', () => {
    it('não deve permitir criar post com author_id inexistente', async () => {
      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.body = {
        post_text: 'Post com autor inexistente',
        author_id: 99999,
      };

      await createPostHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.NOT_FOUND);
      expect(mockRes.json).toHaveBeenCalled();
      const errorResponse = mockRes.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('code');
      expect(errorResponse).toHaveProperty('message');
    });

    it('não deve permitir atualizar post com author_id inexistente', async () => {
      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.body = {
        post_text: 'Post original',
        author_id: testUserId1,
      };
      await createPostHandler(mockReq, mockRes, mockNext);
      const postId = mockRes.send.mock.calls[0][0].post_id;

      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockReq.params = { id: postId.toString() };
      mockReq.body = {
        post_text: 'Post atualizado',
        author_id: 99999,
      };
      await updatePostHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatusCodes.NOT_FOUND);
      expect(mockRes.json).toHaveBeenCalled();
      const errorResponse = mockRes.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('code');
      expect(errorResponse).toHaveProperty('message');
    });
  });
});
