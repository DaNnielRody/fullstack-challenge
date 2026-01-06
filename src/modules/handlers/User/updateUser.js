import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/errors/index.js';
import { updateUserService } from '#services/index.js';
import { UserValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';
import {
  validateEmail,
  validatePassword,
  validatePositiveIntegerAndThrow,
  validateStringAndThrow,
} from '#common/validations/index.js';

/**
 * Atualiza completamente um usuário existente.
 *
 * @description
 * Realiza atualização completa (PUT) de um usuário. Todos os campos devem ser fornecidos.
 * A senha é criptografada antes de ser armazenada. O email deve ser único no sistema.
 *
 * @param {string} req.params.id - ID do usuário a ser atualizado (deve ser um número inteiro positivo)
 * @param {Object} req.body - Dados completos do usuário
 * @param {string} req.body.user_email - Email do usuário (obrigatório, deve ser válido e único)
 * @param {string} req.body.user_password - Senha do usuário (obrigatória, mínimo 8 caracteres, deve conter número e caractere especial)
 * @param {string} req.body.full_name - Nome completo do usuário (obrigatório)
 *
 * @returns {Object} 200 - Usuário atualizado com sucesso
 * @returns {Object} 400 - Erro de validação (ID inválido, email inválido, senha fraca, campos obrigatórios faltando)
 * @returns {Object} 404 - Usuário não encontrado
 * @returns {Object} 409 - Email já existe no sistema
 * @returns {Object} 500 - Erro interno do servidor
 */
const updateUserHandler = async (req, res, next) => {
  try {
    const user_id = validatePositiveIntegerAndThrow(
      req.params.id,
      'user id',
      UserValidationError,
      logError,
      'UPDATE',
      'USER'
    );

    const { user_email, user_password, full_name } = req.body;

    validateStringAndThrow(
      user_email,
      'user_email',
      UserValidationError,
      logError,
      'UPDATE',
      'USER',
      { user_id }
    );

    const emailValidation = validateEmail(user_email);
    if (!emailValidation.valid) {
      const error = new UserValidationError(emailValidation.error, {
        user_email,
      });
      logError('UPDATE', 'USER', error, { user_id, user_email });
      throw error;
    }

    validateStringAndThrow(
      user_password,
      'user_password',
      UserValidationError,
      logError,
      'UPDATE',
      'USER',
      { user_id, user_email }
    );

    const passwordValidation = validatePassword(user_password);
    if (!passwordValidation.valid) {
      const error = new UserValidationError(passwordValidation.error, {});
      logError('UPDATE', 'USER', error, { user_id, user_email });
      throw error;
    }

    validateStringAndThrow(
      full_name,
      'full_name',
      UserValidationError,
      logError,
      'UPDATE',
      'USER',
      { user_id, user_email }
    );

    const updated_user = await updateUserService({
      user_id,
      user_email,
      user_password,
      full_name,
    });

    return res.status(httpStatusCodes.OK).send(updated_user);
  } catch (error) {
    return httpErrorHandler({ req, res, error });
  }
};

export { updateUserHandler };
