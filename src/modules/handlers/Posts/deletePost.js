import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/errors/index.js';
import { deletePostService } from '#services/index.js';
import { PostValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';
import { validatePositiveIntegerAndThrow } from '#common/validations/index.js';

/**
 * Deleta um post do sistema.
 *
 * @description
 * Remove permanentemente um post do sistema. Esta ação não pode ser desfeita.
 *
 * @param {string} req.params.id - ID do post a ser deletado (deve ser um número inteiro positivo)
 *
 * @returns {void} 204 - Post deletado com sucesso (sem conteúdo no body)
 * @returns {Object} 400 - ID inválido (não é um número positivo)
 * @returns {Object} 404 - Post não encontrado
 * @returns {Object} 500 - Erro interno do servidor
 */
const deletePostHandler = async (req, res, next) => {
  try {
    const post_id = validatePositiveIntegerAndThrow(
      req.params.id,
      'post id',
      PostValidationError,
      logError,
      'DELETE',
      'POST'
    );

    await deletePostService({
      post_id,
    });

    return res.status(httpStatusCodes.NO_CONTENT).send();
  } catch (error) {
    return httpErrorHandler({ req, res, error });
  }
};

export { deletePostHandler };
