// Mock ConnectionService for testing - no Firebase dependency
class MockConnectionService {
  #connections = [];
  #activeConnectionId = null;
  #subscribers = new Set();

  get connections() {
    return this.#connections;
  }

  get activeConnectionId() {
    return this.#activeConnectionId;
  }

  get activeConnection() {
    return this.#connections.find((c) => c.id === this.#activeConnectionId) ?? null;
  }

  setActive(connectionId) {
    this.#activeConnectionId = connectionId;
    this.#notify();
  }

  subscribe(callback) {
    this.#subscribers.add(callback);
    callback({
      connections: this.#connections,
      activeConnectionId: this.#activeConnectionId,
    });
    return () => this.#subscribers.delete(callback);
  }

  // Test helper - set connections to simulate data
  _setConnections(connections) {
    this.#connections = connections;
    this.#notify();
  }

  // Test helper - reset state
  _reset() {
    this.#connections = [];
    this.#activeConnectionId = null;
    this.#notify();
  }

  #notify() {
    for (const cb of this.#subscribers) {
      cb({
        connections: this.#connections,
        activeConnectionId: this.#activeConnectionId,
      });
    }
  }

  destroy() {}
}

export const connectionService = new MockConnectionService();
