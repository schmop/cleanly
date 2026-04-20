module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/unit/**/*.spec.ts'],
  moduleNameMapper: {
    // Stub @/store — it uses Vite's import.meta which CommonJS jest can't parse.
    // The unit tests don't exercise the store; this keeps them decoupled.
    '^@/store$': '<rootDir>/tests/unit/__stubs__/store.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['jest-extended/all'],
  transformIgnorePatterns: ['/node_modules/(?!@ionic/vue|@ionic/vue-router|@ionic/core|@stencil/core|ionicons)'],
};
