module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^expo-crypto$': '<rootDir>/__mocks__/expo-crypto.js',
  },
};
