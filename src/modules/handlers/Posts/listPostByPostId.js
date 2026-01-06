import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/errors/index.js';
import { getPostByPostIdService } from '#services/index.js';
import { PostValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';
import { validatePositiveIntegerAndThrow } from '#common/validations/index.js';

/**
 * Busca um post específico por ID.
 *
 * @description
 * Retorna os dados de um post específico identificado pelo ID fornecido na URL.
 *
 * @param {string} req.params.id - ID do post (deve ser um número inteiro positivo)
 *
 * @returns {Object} 200 - Dados do post encontrado
 * @returns {Object} 400 - ID inválido (não é um número positivo)
 * @returns {Object} 404 - Post não encontrado
 * @returns {Object} 500 - Erro interno do servidor
 *
 * @example
 * // GET /api/v1/post/456
 * // Response 200
 * {
 *   "post_id": 456,
 *   "author_id": 123,
 *   "post_text": "Este é um post de exemplo"
 * }
 */
const listPostByPostIdHandler = async (req, res, next) => {
  try {
    const post_id = validatePositiveIntegerAndThrow(
      req.params.id,
      'post_id',
      PostValidationError,
      logError,
      'READ',
      'POST'
    );

    const { post } = await getPostByPostIdService({
      post_id,
    });

    return res.status(httpStatusCodes.OK).send(post);
  } catch (error) {
    return httpErrorHandler({ req, res, error });
  }
};

export { listPostByPostIdHandler };

