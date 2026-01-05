export default {
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '.mock.js',
    '/src/modules/common/errors/database/',
    '/src/modules/common/errors/index.js',
  ],
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/'],
  verbose: true,
  coverageThreshold: {
    global: {
      statements: 85,
      functions: 80,
      lines: 85,
    },
    './src/modules/handlers/**': {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
    './src/modules/common/validations/**': {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
  maxConcurrency: 10,
  transform: {},
  moduleNameMapper: {
    '^#modules/(.*)$': '<rootDir>/src/modules/$1',
    '^#handlers/(.*)$': '<rootDir>/src/modules/handlers/$1',
    '^#services/(.*)$': '<rootDir>/src/modules/services/$1',
    '^#repositories/(.*)$': '<rootDir>/src/modules/repositories/$1',
    '^#common/handlers/(.*)$': '<rootDir>/src/modules/common/handlers/$1',
    '^#common/services/(.*)$': '<rootDir>/src/modules/common/services/$1',
    '^#common/errors/(.*)$': '<rootDir>/src/modules/common/errors/$1',
    '^#common/validations/(.*)$': '<rootDir>/src/modules/common/validations/$1',
    '^#routes/(.*)$': '<rootDir>/src/modules/routes/$1'
  }
};
