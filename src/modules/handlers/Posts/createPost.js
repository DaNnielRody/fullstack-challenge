import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/errors/index.js';
import { createPostService } from '#services/index.js';
import { PostValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';
import {
  validateStringAndThrow,
  validatePositiveIntegerAndThrow,
} from '#common/validations/index.js';

/**
 * Cria um novo post no sistema.
 *
 * @description
 * Endpoint responsável por criar um novo post. O autor (author_id) deve existir no sistema.
 * O texto do post pode ter até 200 caracteres.
 *
 * @param {Object} req.body - Dados do post a ser criado
 * @param {string} req.body.post_text - Texto do post (obrigatório, máximo 200 caracteres)
 * @param {number} req.body.author_id - ID do autor do post (obrigatório, deve ser um número inteiro positivo e existir no sistema)
 *
 * @returns {Object} 201 - Post criado com sucesso
 * @returns {Object} 400 - Erro de validação (post_text vazio, author_id inválido)
 * @returns {Object} 404 - Autor não encontrado
 * @returns {Object} 500 - Erro interno do servidor
 *
 * @example
 * // Request body
 * {
 *   "post_text": "Este é um post de exemplo",
 *   "author_id": 123
 * }
 */
const createPostHandler = async (req, res, next) => {
  try {
    const { post_text, author_id } = req.body;

    validateStringAndThrow(
      post_text,
      'post_text',
      PostValidationError,
      logError,
      'CREATE',
      'POST'
    );

    const author_id_num = validatePositiveIntegerAndThrow(
      author_id,
      'author_id',
      PostValidationError,
      logError,
      'CREATE',
      'POST'
    );

    const created_post = await createPostService({
      post_text,
      author_id: author_id_num,
    });

    return res.status(httpStatusCodes.CREATED).send(created_post);
  } catch (error) {
    return httpErrorHandler({ req, res, error });
  }
};

export { createPostHandler };
