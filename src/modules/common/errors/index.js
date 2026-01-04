export { DomainError } from './domain/domainError.js';

export {
  UserNotFoundError,
  UserCreationError,
  UserUpdateError,
  UserDeletionError,
  UserValidationError,
  UserEmailAlreadyExistsError,
} from './domain/userErrors.js';

export {
  PostNotFoundError,
  AuthorNotFoundError,
  PostCreationError,
  PostUpdateError,
  PostDeletionError,
  PostValidationError,
} from './domain/postErrors.js';

export {
  ForeignKeyViolationError,
  UserHasReferencesError,
  PostHasReferencesError,
  InvalidReferenceError,
} from './database/databaseFKErrors.js';

export {
  transformDatabaseError,
  handleServiceError,
} from './database/databaseErrorTransformer.js';
