import { getUsersByIdRepositories } from '#repositories/index.js';
import { logRead, logError } from '#common/services/logger/logger.js';
import {
  UserNotFoundError,
  UserValidationError,
  handleServiceError,
} from '#common/errors/index.js';
import {
  validatePositiveIntegerAndThrow,
  validateArrayHasOneAndThrow,
} from '#common/validations/index.js';

/**
 * Busca um usuário por ID e retorna como objeto único.
 *
 * @description
 * Service responsável por buscar um usuário específico no banco de dados.
 * Retorna um objeto único (não array) para garantir consistência com handlers e testes de integração.
 * Lança erro se o usuário não for encontrado, formalizando a responsabilidade através de validação explícita.
 *
 * @param {Object} params - Parâmetros da busca
 * @param {number} params.user_id - ID do usuário a ser buscado
 *
 * @returns {Object} Objeto contendo o usuário encontrado
 * @returns {Object} returns.user - Dados do usuário (objeto único, não array)
 *
 * @throws {UserValidationError} Se o user_id não for um número positivo
 * @throws {UserNotFoundError} Se o usuário não for encontrado no banco de dados
 */
const getUserByIdService = async ({ user_id }) => {
  try {
    validatePositiveIntegerAndThrow(
      user_id,
      'user_id',
      UserValidationError,
      logError,
      'READ',
      'USER'
    );

    const { users = [] } = await getUsersByIdRepositories({
      user_id,
    });

    validateArrayHasOneAndThrow(
      users,
      'user',
      UserNotFoundError,
      logError,
      'READ',
      'USER',
      { user_id }
    );

    const [user] = users;

    logRead('USER', { user_id });

    return {
      user,
    };
  } catch (error) {
    handleServiceError('READ', 'USER', error, { user_id });
  }
};

export { getUserByIdService };
