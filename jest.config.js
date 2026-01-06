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
  setupFiles: ['<rootDir>/jest.setup.js'],
  verbose: true,
  coverageThreshold: {
    global: {
      statements: 80,
      functions: 60,
      lines: 80,
    },
    './src/modules/handlers/**': {
      statements: 80,
      branches: 50,
      functions: 80,
      lines: 80,
    },
    './src/modules/common/validations/**': {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
  },
  maxConcurrency: 10,
  transform: {},
  moduleNameMapper: {
    '^#modules/(.*)$': '<rootDir>/src/modules/$1',
    '^#handlers/(.*)$': '<rootDir>/src/modules/handlers/$1',
    '^#services/(.*)$': '<rootDir>/src/modules/services/$1',
    '^#repositories/(.*)$': '<rootDir>/src/modules/repositories/$1',
    '^#common/services/(.*)$': '<rootDir>/src/modules/common/services/$1',
    '^#common/errors/(.*)$': '<rootDir>/src/modules/common/errors/$1',
    '^#common/validations/(.*)$': '<rootDir>/src/modules/common/validations/$1',
    '^#common/infrastructure/(.*)$': '<rootDir>/src/modules/common/infrastructure/$1',
    '^#routes/(.*)$': '<rootDir>/src/modules/routes/$1'
  }
};
