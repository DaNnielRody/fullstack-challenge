import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/errors/index.js';
import { createUserService } from '#services/index.js';
import { UserValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';
import {
  validateEmail,
  validatePassword,
  validateStringAndThrow,
} from '#common/validations/index.js';

/**
 * Cria um novo usuário no sistema.
 *
 * @description
 * Endpoint responsável por criar um novo usuário com validações de email, senha e nome.
 * A senha é criptografada antes de ser armazenada no banco de dados.
 *
 * @param {Object} req.body - Dados do usuário a ser criado
 * @param {string} req.body.user_email - Email do usuário (obrigatório, deve ser válido e único)
 * @param {string} req.body.user_password - Senha do usuário (obrigatória, mínimo 8 caracteres, deve conter número e caractere especial)
 * @param {string} req.body.full_name - Nome completo do usuário (obrigatório)
 *
 * @returns {Object} 201 - Usuário criado com sucesso
 * @returns {Object} 400 - Erro de validação (email inválido, senha fraca, campos obrigatórios faltando)
 * @returns {Object} 409 - Email já existe no sistema
 * @returns {Object} 500 - Erro interno do servidor
 *
 * @example
 * // Request body
 * {
 *   "user_email": "usuario@example.com",
 *   "user_password": "Senha123!",
 *   "full_name": "João Silva"
 * }
 */
const createUserHandler = async (req, res, next) => {
  try {
    const { user_email, user_password, full_name } = req.body;

    validateStringAndThrow(
      user_email,
      'user_email',
      UserValidationError,
      logError,
      'CREATE',
      'USER'
    );

    const emailValidation = validateEmail(user_email);
    if (!emailValidation.valid) {
      const error = new UserValidationError(emailValidation.error, {
        user_email,
      });
      logError('CREATE', 'USER', error, { user_email });
      throw error;
    }

    validateStringAndThrow(
      user_password,
      'user_password',
      UserValidationError,
      logError,
      'CREATE',
      'USER',
      { user_email }
    );

    const passwordValidation = validatePassword(user_password);
    if (!passwordValidation.valid) {
      const error = new UserValidationError(passwordValidation.error, {});
      logError('CREATE', 'USER', error, { user_email });
      throw error;
    }

    validateStringAndThrow(
      full_name,
      'full_name',
      UserValidationError,
      logError,
      'CREATE',
      'USER',
      { user_email }
    );

    const created_user = await createUserService({
      user_email,
      user_password,
      full_name,
    });

    return res.status(httpStatusCodes.CREATED).send(created_user);
  } catch (error) {
    return httpErrorHandler({ req, res, error });
  }
};

export { createUserHandler };
