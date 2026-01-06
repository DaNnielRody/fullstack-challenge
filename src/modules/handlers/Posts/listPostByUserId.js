import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/errors/index.js';
import { getPostByUserIdService } from '#services/index.js';
import { PostValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';
import { validatePositiveIntegerAndThrow } from '#common/validations/index.js';

/**
 * Lista todos os posts de um usuário específico.
 *
 * @description
 * Retorna uma lista de todos os posts criados por um usuário identificado pelo ID fornecido na URL.
 * Retorna um array vazio caso o usuário não tenha posts ou não exista.
 *
 * @param {string} req.params.id - ID do usuário (deve ser um número inteiro positivo)
 *
 * @returns {Array} 200 - Lista de posts do usuário (pode ser array vazio)
 * @returns {Object} 400 - ID inválido (não é um número positivo)
 * @returns {Object} 404 - Usuário não encontrado
 * @returns {Object} 500 - Erro interno do servidor
 *
 * @example
 * // GET /api/v1/post/user/123
 * // Response 200
 * [
 *   {
 *     "post_id": 1,
 *     "author_id": 123,
 *     "post_text": "Primeiro post do usuário"
 *   }
 * ]
 */
const listPostByUserIdHandler = async (req, res, next) => {
  try {
    const user_id = validatePositiveIntegerAndThrow(
      req.params.id,
      'user_id',
      PostValidationError,
      logError,
      'LIST',
      'POST'
    );

    const { posts } = await getPostByUserIdService({
      user_id,
    });

    return res.status(httpStatusCodes.OK).send(posts);
  } catch (error) {
    return httpErrorHandler({ req, res, error });
  }
};

export { listPostByUserIdHandler };
