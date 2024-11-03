const mockPusherInstance = {
    connect: jest.fn(),
    disconnect: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    bind: jest.fn(),
    unbind: jest.fn(),
    init: jest.fn(),  // Add the init function mock
    getInstance: jest.fn().mockReturnValue({
      connect: jest.fn(),
      disconnect: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      bind: jest.fn(),
      unbind: jest.fn(),
      init: jest.fn(),  // Add the init function mock here as well
    }),
  };

  module.exports = {
    Pusher: {
      getInstance: () => mockPusherInstance,
    },
  };
