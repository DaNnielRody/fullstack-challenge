import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/errors/index.js';
import { getAllUsersService } from '#services/index.js';

/**
 * Lista todos os usuários cadastrados no sistema.
 *
 * @description
 * Retorna uma lista de todos os usuários. A senha não é incluída na resposta por questões de segurança.
 * Retorna um array vazio caso não existam usuários cadastrados.
 *
 * @returns {Array} 200 - Lista de usuários (pode ser array vazio)
 * @returns {Object} 500 - Erro interno do servidor
 *
 * @example
 * // Response 200
 * [
 *   {
 *     "user_id": 1,
 *     "user_email": "usuario@example.com",
 *     "full_name": "João Silva"
 *   }
 * ]
 */
const listUserHandler = async (req, res, next) => {
  try {
    const users_response = await getAllUsersService();
    const users = users_response.users || [];

    return res.status(httpStatusCodes.OK).send(users);
  } catch (error) {
    return httpErrorHandler({ req, res, error });
  }
};

export { listUserHandler };
