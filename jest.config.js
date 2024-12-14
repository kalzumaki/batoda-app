module.exports = {
    preset: 'react-native',
    moduleNameMapper: {
      '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
      '^@react-native-async-storage/async-storage$': '@react-native-async-storage/async-storage/jest/async-storage-mock',
      '^@pusher/pusher-websocket-react-native$': '<rootDir>/__mocks__/@pusher/pusher-websocket-react-native.js',
    },
    transformIgnorePatterns: [
      "node_modules/(?!(react-native|@react-native|@react-navigation|react-native-toast-message|react-native-vector-icons)/)"
    ],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  };
