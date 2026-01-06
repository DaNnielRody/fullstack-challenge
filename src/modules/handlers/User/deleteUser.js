import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/errors/index.js';
import { deleteUserService } from '#services/index.js';
import { UserValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';
import { validatePositiveIntegerAndThrow } from '#common/validations/index.js';

/**
 * Deleta um usuário do sistema.
 *
 * @description
 * Remove permanentemente um usuário do sistema. Esta ação não pode ser desfeita.
 * Se o usuário tiver posts associados, a operação pode falhar dependendo das regras de integridade referencial.
 *
 * @param {string} req.params.id - ID do usuário a ser deletado (deve ser um número inteiro positivo)
 *
 * @returns {void} 204 - Usuário deletado com sucesso (sem conteúdo no body)
 * @returns {Object} 400 - ID inválido (não é um número positivo)
 * @returns {Object} 404 - Usuário não encontrado
 * @returns {Object} 500 - Erro interno do servidor
 */
const deleteUserHandler = async (req, res, next) => {
  try {
    const user_id = validatePositiveIntegerAndThrow(
      req.params.id,
      'user id',
      UserValidationError,
      logError,
      'DELETE',
      'USER'
    );

    await deleteUserService({
      user_id,
    });

    return res.status(httpStatusCodes.NO_CONTENT).send();
  } catch (error) {
    return httpErrorHandler({ req, res, error });
  }
};

export { deleteUserHandler };
