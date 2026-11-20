module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/cdk.out',
    '<rootDir>/backend',
    '<rootDir>/frontend',
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/cdk.out',
    '<rootDir>/backend',
    '<rootDir>/frontend',
  ],
};
