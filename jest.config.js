module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'backend/**/*.js',
    '!backend/tests/**',
    '!backend/node_modules/**'
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  verbose: true
};
