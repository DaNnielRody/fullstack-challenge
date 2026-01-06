import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/errors/index.js';
import { patchUserService } from '#services/index.js';
import { UserValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';
import {
  validateEmail,
  validatePassword,
  validatePositiveIntegerAndThrow,
  validateStringAndThrow,
} from '#common/validations/index.js';

/**
 * Atualiza parcialmente um usuário existente.
 *
 * @description
 * Realiza atualização parcial (PATCH) de um usuário. Apenas os campos fornecidos serão atualizados.
 * Pelo menos um campo deve ser fornecido. A senha é criptografada se fornecida.
 * O email deve ser único no sistema se for fornecido.
 *
 * @param {string} req.params.id - ID do usuário a ser atualizado (deve ser um número inteiro positivo)
 * @param {Object} req.body - Campos a serem atualizados (pelo menos um obrigatório)
 * @param {string} [req.body.user_email] - Email do usuário (opcional, deve ser válido e único se fornecido)
 * @param {string} [req.body.user_password] - Senha do usuário (opcional, mínimo 8 caracteres, deve conter número e caractere especial se fornecido)
 * @param {string} [req.body.full_name] - Nome completo do usuário (opcional)
 *
 * @returns {Object} 200 - Usuário atualizado com sucesso
 * @returns {Object} 400 - Erro de validação (ID inválido, nenhum campo fornecido, email inválido, senha fraca)
 * @returns {Object} 404 - Usuário não encontrado
 * @returns {Object} 409 - Email já existe no sistema
 * @returns {Object} 500 - Erro interno do servidor
 */
const patchUserHandler = async (req, res, next) => {
  try {
    const user_id = validatePositiveIntegerAndThrow(
      req.params.id,
      'user id',
      UserValidationError,
      logError,
      'PATCH',
      'USER'
    );

    const { user_email, user_password, full_name } = req.body;

    if (!user_email && !user_password && !full_name) {
      const error = new UserValidationError(
        'At least one field must be provided for update',
        {}
      );
      logError('PATCH', 'USER', error, { user_id });
      throw error;
    }

    if (user_email !== undefined) {
      validateStringAndThrow(
        user_email,
        'user_email',
        UserValidationError,
        logError,
        'PATCH',
        'USER',
        { user_id }
      );

      const emailValidation = validateEmail(user_email);
      if (!emailValidation.valid) {
        const error = new UserValidationError(emailValidation.error, {
          user_email,
        });
        logError('PATCH', 'USER', error, { user_id, user_email });
        throw error;
      }
    }

    if (user_password !== undefined) {
      validateStringAndThrow(
        user_password,
        'user_password',
        UserValidationError,
        logError,
        'PATCH',
        'USER',
        { user_id }
      );

      const passwordValidation = validatePassword(user_password);
      if (!passwordValidation.valid) {
        const error = new UserValidationError(passwordValidation.error, {});
        logError('PATCH', 'USER', error, { user_id });
        throw error;
      }
    }

    const updated_user = await patchUserService({
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

export { patchUserHandler };
