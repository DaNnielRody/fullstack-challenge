import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/errors/index.js';
import { getUserByIdService } from '#services/index.js';
import { UserValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';
import { validatePositiveIntegerAndThrow } from '#common/validations/index.js';

/**
 * Busca um usuário específico por ID.
 *
 * @description
 * Retorna os dados de um usuário específico identificado pelo ID fornecido na URL.
 * A senha não é incluída na resposta por questões de segurança.
 *
 * @param {string} req.params.id - ID do usuário (deve ser um número inteiro positivo)
 *
 * @returns {Object} 200 - Dados do usuário encontrado
 * @returns {Object} 400 - ID inválido (não é um número positivo)
 * @returns {Object} 404 - Usuário não encontrado
 * @returns {Object} 500 - Erro interno do servidor
 *
 * @example
 * // GET /api/v1/user/123
 * // Response 200
 * {
 *   "user_id": 123,
 *   "user_email": "usuario@example.com",
 *   "full_name": "João Silva"
 * }
 */
const listUserByIdHandler = async (req, res, next) => {
  try {
    const user_id = validatePositiveIntegerAndThrow(
      req.params.id,
      'user id',
      UserValidationError,
      logError,
      'READ',
      'USER'
    );

    const { user } = await getUserByIdService({ user_id });
    return res.status(httpStatusCodes.OK).send(user);
  } catch (error) {
    return httpErrorHandler({ req, res, error });
  }
};

export { listUserByIdHandler };
