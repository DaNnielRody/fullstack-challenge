import { getPostByPostIdRepositories } from '#repositories/index.js';
import { logRead, logError } from '#common/services/logger/logger.js';
import {
  PostNotFoundError,
  PostValidationError,
  handleServiceError,
} from '#common/errors/index.js';
import {
  validateArrayHasOneAndThrow,
} from '#common/validations/index.js';

/**
 * Busca um post por ID e retorna como objeto único.
 *
 * @description
 * Service responsável por buscar um post específico no banco de dados.
 * Retorna um objeto único (não array) para garantir consistência com handlers e testes de integração.
 * Lança erro se o post não for encontrado, formalizando a responsabilidade através de validação explícita.
 *
 * @param {Object} params - Parâmetros da busca
 * @param {number} params.post_id - ID do post a ser buscado
 *
 * @returns {Object} Objeto contendo o post encontrado
 * @returns {Object} returns.post - Dados do post (objeto único, não array)
 *
 * @throws {PostNotFoundError} Se o post não for encontrado no banco de dados
 */
const getPostByPostIdService = async ({ post_id }) => {
  try {
    const { posts = [] } = await getPostByPostIdRepositories({
      post_id,
    });

    validateArrayHasOneAndThrow(
      posts,
      'post',
      PostNotFoundError,
      logError,
      'READ',
      'POST',
      { post_id }
    );

    const [post] = posts;

    logRead('POST', { post_id });

    return {
      post,
    };
  } catch (error) {
    handleServiceError('READ', 'POST', error, { post_id });
  }
};

export { getPostByPostIdService };

