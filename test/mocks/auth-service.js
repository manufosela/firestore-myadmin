// Mock AuthService for testing - no Firebase dependency
class MockAuthService {
  #user = null;
  #subscribers = new Set();
  #initialized = true;

  get currentUser() {
    return this.#user;
  }

  get isAuthenticated() {
    return this.#user !== null;
  }

  get initialized() {
    return this.#initialized;
  }

  waitForInit() {
    return Promise.resolve(this.#user);
  }

  async login() {
    return { uid: 'mock-uid', email: 'mock@test.com' };
  }

  async logout() {
    this._setUser(null);
  }

  subscribe(callback) {
    this.#subscribers.add(callback);
    if (this.#initialized) {
      callback(this.#user);
    }
    return () => this.#subscribers.delete(callback);
  }

  // Test helper - set user to simulate auth state
  _setUser(user) {
    this.#user = user;
    for (const cb of this.#subscribers) {
      cb(this.#user);
    }
  }
}

export const authService = new MockAuthService();
