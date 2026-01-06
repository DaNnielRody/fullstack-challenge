import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/errors/index.js';
import { getAllPostsService } from '#services/index.js';

/**
 * Lista todos os posts cadastrados no sistema.
 *
 * @description
 * Retorna uma lista de todos os posts. Retorna um array vazio caso não existam posts cadastrados.
 *
 * @returns {Array} 200 - Lista de posts (pode ser array vazio)
 * @returns {Object} 500 - Erro interno do servidor
 *
 * @example
 * // Response 200
 * [
 *   {
 *     "post_id": 1,
 *     "author_id": 123,
 *     "post_text": "Este é um post de exemplo"
 *   }
 * ]
 */
const listPostHandler = async (req, res, next) => {
  try {
    const posts_response = await getAllPostsService();
    const posts = posts_response.posts || [];

    return res.status(httpStatusCodes.OK).send(posts);
  } catch (error) {
    return httpErrorHandler({ req, res, error });
  }
};

export { listPostHandler };
