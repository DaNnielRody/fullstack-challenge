import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/errors/index.js';
import { patchPostService } from '#services/index.js';
import { PostValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';
import {
  validateStringAndThrow,
  validatePositiveIntegerAndThrow,
} from '#common/validations/index.js';

/**
 * Atualiza parcialmente um post existente.
 *
 * @description
 * Realiza atualização parcial (PATCH) de um post. Apenas os campos fornecidos serão atualizados.
 * Pelo menos um campo deve ser fornecido. O autor (author_id) deve existir no sistema se for fornecido.
 * O texto do post pode ter até 200 caracteres se for fornecido.
 *
 * @param {string} req.params.id - ID do post a ser atualizado (deve ser um número inteiro positivo)
 * @param {Object} req.body - Campos a serem atualizados (pelo menos um obrigatório)
 * @param {number} [req.body.author_id] - ID do autor do post (opcional, deve ser um número inteiro positivo e existir no sistema se fornecido)
 * @param {string} [req.body.post_text] - Texto do post (opcional, máximo 200 caracteres se fornecido)
 *
 * @returns {Object} 200 - Post atualizado com sucesso
 * @returns {Object} 400 - Erro de validação (ID inválido, nenhum campo fornecido, post_text vazio, author_id inválido)
 * @returns {Object} 404 - Post ou autor não encontrado
 * @returns {Object} 500 - Erro interno do servidor
 */
const patchPostHandler = async (req, res, next) => {
  try {
    const post_id = validatePositiveIntegerAndThrow(
      req.params.id,
      'post id',
      PostValidationError,
      logError,
      'PATCH',
      'POST'
    );

    const { author_id, post_text } = req.body;

    if (!author_id && !post_text) {
      const error = new PostValidationError(
        'At least one field must be provided for update',
        {}
      );
      logError('PATCH', 'POST', error, { post_id });
      throw error;
    }

    let author_id_num = undefined;
    if (author_id !== undefined) {
      author_id_num = validatePositiveIntegerAndThrow(
        author_id,
        'author_id',
        PostValidationError,
        logError,
        'PATCH',
        'POST',
        { post_id }
      );
    }

    if (post_text !== undefined) {
      validateStringAndThrow(
        post_text,
        'post_text',
        PostValidationError,
        logError,
        'PATCH',
        'POST',
        { post_id, author_id: author_id_num }
      );
    }

    const updated_post = await patchPostService({
      post_id,
      author_id: author_id_num,
      post_text,
    });

    return res.status(httpStatusCodes.OK).send(updated_post);
  } catch (error) {
    return httpErrorHandler({ req, res, error });
  }
};

export { patchPostHandler };
