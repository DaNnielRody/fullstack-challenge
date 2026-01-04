import {
  UserEmailAlreadyExistsError,
  UserNotFoundError,
} from '../domain/userErrors.js';
import {
  AuthorNotFoundError,
  PostNotFoundError,
} from '../domain/postErrors.js';
import {
  UserHasReferencesError,
  PostHasReferencesError,
} from './databaseFKErrors.js';
import { logError } from '#common/services/logger/logger.js';

const transformDatabaseError = (error, context = {}) => {
  if (
    error.code === 'ER_DUP_ENTRY' ||
    error.code === '23505' ||
    (error.message?.includes('unique') && error.message?.includes('user_email'))
  ) {
    if (context.user_email) {
      return new UserEmailAlreadyExistsError(context.user_email);
    }
  }

  if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === '23503') {
    if (context.user_id) {
      return new UserNotFoundError(context.user_id);
    }
    if (context.author_id) {
      return new AuthorNotFoundError(context.author_id);
    }
    if (context.post_id) {
      return new PostNotFoundError(context.post_id);
    }
  }

  if (
    error.code === 'ER_ROW_IS_REFERENCED_2' ||
    error.code === 'ER_ROW_IS_REFERENCED' ||
    (error.code === '23503' && error.message?.includes('still referenced'))
  ) {
    if (context.user_id) {
      return new UserHasReferencesError(context.user_id);
    }
    if (context.post_id) {
      return new PostHasReferencesError(context.post_id);
    }
  }

  return null;
};

const handleServiceError = (operation, entity, error, context) => {
  const transformedError = transformDatabaseError(error, context);
  const finalError = transformedError || error;

  logError(operation, entity, finalError, context);
  throw finalError;
};

export { transformDatabaseError, handleServiceError };
