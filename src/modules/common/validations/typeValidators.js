const validateString = (value, fieldName) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return {
      valid: false,
      error: `Invalid ${fieldName}: must be a non-empty string`,
      details: { [fieldName]: value },
    };
  }
  return {
    valid: true,
    error: null,
  };
};

const validatePositiveInteger = (value, fieldName) => {
  const numValue = typeof value === 'number' ? value : Number(value);

  if (!Number.isInteger(numValue) || numValue <= 0) {
    return {
      valid: false,
      error: `Invalid ${fieldName}: must be a positive integer`,
      details: { [fieldName]: value },
    };
  }
  return {
    valid: true,
    error: null,
  };
};

const validateStringAndThrow = (
  value,
  fieldName,
  ValidationErrorClass,
  logError,
  action,
  entity,
  logContext = {}
) => {
  const validation = validateString(value, fieldName);
  if (!validation.valid) {
    const error = new ValidationErrorClass(
      validation.error,
      validation.details || {}
    );
    logError(action, entity, error, { ...logContext, [fieldName]: value });
    throw error;
  }
};

const validatePositiveIntegerAndThrow = (
  value,
  fieldName,
  ValidationErrorClass,
  logError,
  action,
  entity,
  logContext = {}
) => {
  const validation = validatePositiveInteger(value, fieldName);
  if (!validation.valid) {
    const error = new ValidationErrorClass(
      validation.error,
      validation.details || {}
    );
    logError(action, entity, error, { ...logContext, [fieldName]: value });
    throw error;
  }
  return typeof value === 'number' ? value : Number(value);
};

const validateArrayExists = (array, fieldName) => {
  if (!Array.isArray(array) || array.length === 0) {
    return {
      valid: false,
      error: `${fieldName} not found`,
    };
  }
  return {
    valid: true,
    error: null,
  };
};

const validateArrayHasOne = (array, fieldName) => {
  if (!Array.isArray(array) || array.length !== 1) {
    return {
      valid: false,
      error: `${fieldName} not found`,
    };
  }
  return {
    valid: true,
    error: null,
  };
};

const validateArrayEmpty = (array, fieldName) => {
  if (Array.isArray(array) && array.length > 0) {
    return {
      valid: false,
      error: `${fieldName} already exists`,
    };
  }
  return {
    valid: true,
    error: null,
  };
};

const validateArrayExistsAndThrow = (
  array,
  fieldName,
  NotFoundErrorClass,
  logError,
  action,
  entity,
  logContext = {}
) => {
  const validation = validateArrayExists(array, fieldName);
  if (!validation.valid) {
    const id =
      logContext[fieldName] ||
      logContext.id ||
      logContext[`${fieldName}_id`] ||
      logContext.user_id ||
      logContext.author_id;
    const error = new NotFoundErrorClass(id);
    logError(action, entity, error, logContext);
    throw error;
  }
};

const validateArrayHasOneAndThrow = (
  array,
  fieldName,
  NotFoundErrorClass,
  logError,
  action,
  entity,
  logContext = {}
) => {
  const validation = validateArrayHasOne(array, fieldName);
  if (!validation.valid) {
    const id =
      logContext[fieldName] ||
      logContext.id ||
      logContext[`${fieldName}_id`] ||
      logContext.user_id ||
      logContext.post_id;
    const error = new NotFoundErrorClass(id);
    logError(action, entity, error, logContext);
    throw error;
  }
};

const validateArrayEmptyAndThrow = (
  array,
  fieldName,
  AlreadyExistsErrorClass,
  logError,
  action,
  entity,
  logContext = {}
) => {
  const validation = validateArrayEmpty(array, fieldName);
  if (!validation.valid) {
    const value =
      logContext[fieldName] ||
      logContext.email ||
      logContext[`${fieldName}_id`];
    const error = new AlreadyExistsErrorClass(value);
    logError(action, entity, error, logContext);
    throw error;
  }
};

const validateCreationResultAndThrow = (
  result,
  fieldName,
  CreationErrorClass,
  logError,
  action,
  entity,
  logContext = {}
) => {
  const validation = validateArrayExists(result, fieldName);
  if (!validation.valid) {
    const error = new CreationErrorClass(`Failed to create ${fieldName}`);
    logError(action, entity, error, logContext);
    throw error;
  }
};

export {
  validateString,
  validatePositiveInteger,
  validateStringAndThrow,
  validatePositiveIntegerAndThrow,
  validateArrayExists,
  validateArrayHasOne,
  validateArrayEmpty,
  validateArrayExistsAndThrow,
  validateArrayHasOneAndThrow,
  validateArrayEmptyAndThrow,
  validateCreationResultAndThrow,
};
