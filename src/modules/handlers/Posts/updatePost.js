import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/errors/index.js';
import { updatePostService } from '#services/index.js';
import { PostValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';
import {
  validateStringAndThrow,
  validatePositiveIntegerAndThrow,
} from '#common/validations/index.js';

/**
 * Atualiza completamente um post existente.
 *
 * @description
 * Realiza atualização completa (PUT) de um post. Todos os campos devem ser fornecidos.
 * O autor (author_id) deve existir no sistema. O texto do post pode ter até 200 caracteres.
 *
 * @param {string} req.params.id - ID do post a ser atualizado (deve ser um número inteiro positivo)
 * @param {Object} req.body - Dados completos do post
 * @param {number} req.body.author_id - ID do autor do post (obrigatório, deve ser um número inteiro positivo e existir no sistema)
 * @param {string} req.body.post_text - Texto do post (obrigatório, máximo 200 caracteres)
 *
 * @returns {Object} 200 - Post atualizado com sucesso
 * @returns {Object} 400 - Erro de validação (ID inválido, post_text vazio, author_id inválido)
 * @returns {Object} 404 - Post ou autor não encontrado
 * @returns {Object} 500 - Erro interno do servidor
 */
const updatePostHandler = async (req, res, next) => {
  try {
    const post_id = validatePositiveIntegerAndThrow(
      req.params.id,
      'post id',
      PostValidationError,
      logError,
      'UPDATE',
      'POST'
    );

    const { author_id, post_text } = req.body;

    const author_id_num = validatePositiveIntegerAndThrow(
      author_id,
      'author_id',
      PostValidationError,
      logError,
      'UPDATE',
      'POST',
      { post_id }
    );

    validateStringAndThrow(
      post_text,
      'post_text',
      PostValidationError,
      logError,
      'UPDATE',
      'POST',
      { post_id, author_id: author_id_num }
    );

    const updated_post = await updatePostService({
      post_id,
      author_id: author_id_num,
      post_text,
    });

    return res.status(httpStatusCodes.OK).send(updated_post);
  } catch (error) {
    return httpErrorHandler({ req, res, error });
  }
};

export { updatePostHandler };
