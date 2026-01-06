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

/**
 * Valida se o valor é uma string não vazia e lança erro se inválido.
 *
 * @description
 * Garante que o valor seja uma string não vazia. Se a validação falhar, lança um erro
 * da classe especificada e registra no log. Após essa validação, o restante do fluxo
 * pode assumir que o valor é uma string válida. Esta validação fecha o ciclo de
 * responsabilidade dentro da lógica da aplicação.
 *
 * @param {*} value - Valor a ser validado
 * @param {string} fieldName - Nome do campo para mensagens de erro
 * @param {Function} ValidationErrorClass - Classe de erro a ser lançada
 * @param {Function} logError - Função de log de erro
 * @param {string} action - Ação sendo executada (CREATE, UPDATE, etc)
 * @param {string} entity - Entidade sendo validada (USER, POST, etc)
 * @param {Object} [logContext={}] - Contexto adicional para logs
 *
 * @throws {ValidationErrorClass} Se o valor não for uma string não vazia
 */
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

/**
 * Valida se o valor é um número inteiro positivo e lança erro se inválido.
 *
 * @description
 * Garante que o valor seja um número inteiro positivo. Se a validação falhar, lança um erro
 * da classe especificada e registra no log. Após essa validação, o restante do fluxo
 * pode assumir que o valor é um número válido. Esta validação fecha o ciclo de
 * responsabilidade dentro da lógica da aplicação.
 *
 * @param {*} value - Valor a ser validado
 * @param {string} fieldName - Nome do campo para mensagens de erro
 * @param {Function} ValidationErrorClass - Classe de erro a ser lançada
 * @param {Function} logError - Função de log de erro
 * @param {string} action - Ação sendo executada (CREATE, UPDATE, etc)
 * @param {string} entity - Entidade sendo validada (USER, POST, etc)
 * @param {Object} [logContext={}] - Contexto adicional para logs
 *
 * @returns {number} Número inteiro positivo validado
 * @throws {ValidationErrorClass} Se o valor não for um número inteiro positivo
 */
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

/**
 * Valida se o array existe e contém pelo menos um elemento, lança erro se inválido.
 *
 * @description
 * Garante que o array exista e não esteja vazio. Usado para validar se uma entidade
 * foi encontrada no banco de dados. Se a validação falhar, lança um erro de "não encontrado"
 * e registra no log. Após essa validação, o restante do fluxo pode assumir que a entidade
 * existe. Esta validação fecha o ciclo de responsabilidade dentro da lógica da aplicação.
 *
 * @param {Array} array - Array a ser validado
 * @param {string} fieldName - Nome do campo para mensagens de erro
 * @param {Function} NotFoundErrorClass - Classe de erro a ser lançada
 * @param {Function} logError - Função de log de erro
 * @param {string} action - Ação sendo executada (CREATE, READ, etc)
 * @param {string} entity - Entidade sendo validada (USER, POST, etc)
 * @param {Object} [logContext={}] - Contexto adicional para logs
 *
 * @throws {NotFoundErrorClass} Se o array estiver vazio ou não existir
 */
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

/**
 * Valida se o array contém exatamente um elemento, lança erro se inválido.
 *
 * @description
 * Garante que o array contenha exatamente um elemento. Usado para validar buscas por ID
 * onde esperamos encontrar exatamente um resultado. Se a validação falhar, lança um erro
 * de "não encontrado" e registra no log. Após essa validação, o restante do fluxo pode
 * assumir que existe exatamente uma entidade. Esta validação fecha o ciclo de
 * responsabilidade dentro da lógica da aplicação.
 *
 * @param {Array} array - Array a ser validado
 * @param {string} fieldName - Nome do campo para mensagens de erro
 * @param {Function} NotFoundErrorClass - Classe de erro a ser lançada
 * @param {Function} logError - Função de log de erro
 * @param {string} action - Ação sendo executada (READ, UPDATE, etc)
 * @param {string} entity - Entidade sendo validada (USER, POST, etc)
 * @param {Object} [logContext={}] - Contexto adicional para logs
 *
 * @throws {NotFoundErrorClass} Se o array não contiver exatamente um elemento
 */
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
