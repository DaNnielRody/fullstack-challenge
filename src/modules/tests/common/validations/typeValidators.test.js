import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
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
} from '#common/validations/index.js';
import { UserValidationError, PostValidationError } from '#common/errors/index.js';

const mockLogError = jest.fn();

describe('validateString', () => {
  it('deve validar string não vazia', () => {
    const result = validateString('texto válido', 'field_name');
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('deve retornar erro quando string é vazia', () => {
    const result = validateString('', 'field_name');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid field_name: must be a non-empty string');
  });

  it('deve retornar erro quando valor não é string', () => {
    const result = validateString(null, 'field_name');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid field_name: must be a non-empty string');
  });
});

describe('validatePositiveInteger', () => {
  it('deve validar inteiro positivo', () => {
    const result = validatePositiveInteger(1, 'field_name');
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('deve retornar erro quando valor é zero', () => {
    const result = validatePositiveInteger(0, 'field_name');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid field_name: must be a positive integer');
  });

  it('deve retornar erro quando valor não é número válido', () => {
    const result = validatePositiveInteger('abc', 'field_name');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid field_name: must be a positive integer');
  });
});

describe('validateStringAndThrow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve não lançar erro quando string é válida', () => {
    expect(() => {
      validateStringAndThrow(
        'texto válido',
        'field_name',
        UserValidationError,
        mockLogError,
        'CREATE',
        'USER'
      );
    }).not.toThrow();
    expect(mockLogError).not.toHaveBeenCalled();
  });

  it('deve lançar erro quando string é inválida', () => {
    expect(() => {
      validateStringAndThrow(
        '',
        'field_name',
        UserValidationError,
        mockLogError,
        'CREATE',
        'USER'
      );
    }).toThrow(UserValidationError);
    expect(mockLogError).toHaveBeenCalled();
  });
});

describe('validatePositiveIntegerAndThrow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve não lançar erro quando inteiro é válido e retornar número', () => {
    const result = validatePositiveIntegerAndThrow(
      123,
      'field_name',
      PostValidationError,
      mockLogError,
      'CREATE',
      'POST'
    );
    expect(result).toBe(123);
    expect(mockLogError).not.toHaveBeenCalled();
  });

  it('deve lançar erro quando inteiro é inválido', () => {
    expect(() => {
      validatePositiveIntegerAndThrow(
        0,
        'field_name',
        PostValidationError,
        mockLogError,
        'CREATE',
        'POST'
      );
    }).toThrow(PostValidationError);
    expect(mockLogError).toHaveBeenCalled();
  });
});

describe('validateArrayExists', () => {
  it('deve validar array não vazio', () => {
    const result = validateArrayExists([1, 2, 3], 'field_name');
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('deve retornar erro quando array é vazio', () => {
    const result = validateArrayExists([], 'field_name');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('field_name not found');
  });
});

describe('validateArrayHasOne', () => {
  it('deve validar array com exatamente um elemento', () => {
    const result = validateArrayHasOne([1], 'field_name');
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('deve retornar erro quando array não tem exatamente um elemento', () => {
    const result = validateArrayHasOne([], 'field_name');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('field_name not found');
  });
});

describe('validateArrayEmpty', () => {
  it('deve validar array vazio', () => {
    const result = validateArrayEmpty([], 'field_name');
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('deve retornar erro quando array não está vazio', () => {
    const result = validateArrayEmpty([1], 'field_name');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('field_name already exists');
  });
});

describe('validateArrayExistsAndThrow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve não lançar erro quando array existe', () => {
    expect(() => {
      validateArrayExistsAndThrow(
        [1, 2, 3],
        'users',
        UserValidationError,
        mockLogError,
        'READ',
        'USER'
      );
    }).not.toThrow();
    expect(mockLogError).not.toHaveBeenCalled();
  });

  it('deve lançar erro quando array não existe', () => {
    expect(() => {
      validateArrayExistsAndThrow(
        [],
        'users',
        UserValidationError,
        mockLogError,
        'READ',
        'USER'
      );
    }).toThrow(UserValidationError);
    expect(mockLogError).toHaveBeenCalled();
  });
});

describe('validateArrayHasOneAndThrow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve não lançar erro quando array tem exatamente um elemento', () => {
    expect(() => {
      validateArrayHasOneAndThrow(
        [1],
        'user',
        UserValidationError,
        mockLogError,
        'READ',
        'USER'
      );
    }).not.toThrow();
    expect(mockLogError).not.toHaveBeenCalled();
  });

  it('deve lançar erro quando array não tem exatamente um elemento', () => {
    expect(() => {
      validateArrayHasOneAndThrow(
        [],
        'user',
        UserValidationError,
        mockLogError,
        'READ',
        'USER'
      );
    }).toThrow(UserValidationError);
    expect(mockLogError).toHaveBeenCalled();
  });
});

describe('validateArrayEmptyAndThrow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve não lançar erro quando array está vazio', () => {
    expect(() => {
      validateArrayEmptyAndThrow(
        [],
        'users',
        UserValidationError,
        mockLogError,
        'CREATE',
        'USER'
      );
    }).not.toThrow();
    expect(mockLogError).not.toHaveBeenCalled();
  });

  it('deve lançar erro quando array não está vazio', () => {
    expect(() => {
      validateArrayEmptyAndThrow(
        [1],
        'users',
        UserValidationError,
        mockLogError,
        'CREATE',
        'USER'
      );
    }).toThrow(UserValidationError);
    expect(mockLogError).toHaveBeenCalled();
  });
});

describe('validateCreationResultAndThrow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve não lançar erro quando resultado de criação é válido', () => {
    expect(() => {
      validateCreationResultAndThrow(
        [1],
        'user',
        UserValidationError,
        mockLogError,
        'CREATE',
        'USER'
      );
    }).not.toThrow();
    expect(mockLogError).not.toHaveBeenCalled();
  });

  it('deve lançar erro quando resultado de criação é inválido', () => {
    expect(() => {
      validateCreationResultAndThrow(
        [],
        'user',
        UserValidationError,
        mockLogError,
        'CREATE',
        'USER'
      );
    }).toThrow(UserValidationError);
    expect(mockLogError).toHaveBeenCalled();
  });
});
