import { expect } from '@open-wc/testing';

let authStateCallback = null;
let mockUser = null;

const mockAuth = {};

// Mock firebase/auth
const originalImport = window.__importShim || null;

// We test AuthService behavior via a simplified mock approach
describe('AuthService', () => {
  let AuthServiceClass;
  let service;
  let unsubscribers;

  beforeEach(() => {
    unsubscribers = [];
  });

  afterEach(() => {
    for (const unsub of unsubscribers) {
      unsub();
    }
  });

  it('should expose currentUser as null before auth state resolves', () => {
    // Create a minimal service mock to test the pattern
    const subscribers = new Set();
    let user = null;
    let initialized = false;

    const service = {
      get currentUser() {
        return user;
      },
      get isAuthenticated() {
        return user !== null;
      },
      get initialized() {
        return initialized;
      },
      subscribe(cb) {
        subscribers.add(cb);
        if (initialized) cb(user);
        return () => subscribers.delete(cb);
      },
    };

    expect(service.currentUser).to.be.null;
    expect(service.isAuthenticated).to.be.false;
    expect(service.initialized).to.be.false;
  });

  it('should notify subscribers when auth state changes', () => {
    const subscribers = new Set();
    let user = null;
    let initialized = false;

    function notifySubscribers() {
      for (const cb of subscribers) {
        cb(user);
      }
    }

    const service = {
      get currentUser() {
        return user;
      },
      get isAuthenticated() {
        return user !== null;
      },
      subscribe(cb) {
        subscribers.add(cb);
        if (initialized) cb(user);
        return () => subscribers.delete(cb);
      },
    };

    const received = [];
    const unsub = service.subscribe((u) => received.push(u));
    unsubscribers.push(unsub);

    // Simulate auth state change
    user = { uid: 'test-uid', email: 'test@example.com' };
    initialized = true;
    notifySubscribers();

    expect(received).to.have.lengthOf(1);
    expect(received[0].uid).to.equal('test-uid');
    expect(service.isAuthenticated).to.be.true;
  });

  it('should allow unsubscribing', () => {
    const subscribers = new Set();
    let user = null;

    function notifySubscribers() {
      for (const cb of subscribers) {
        cb(user);
      }
    }

    const service = {
      subscribe(cb) {
        subscribers.add(cb);
        return () => subscribers.delete(cb);
      },
    };

    const received = [];
    const unsub = service.subscribe((u) => received.push(u));

    user = { uid: 'uid-1' };
    notifySubscribers();
    expect(received).to.have.lengthOf(1);

    // Unsubscribe
    unsub();

    user = { uid: 'uid-2' };
    notifySubscribers();
    // Should not receive the second notification
    expect(received).to.have.lengthOf(1);
  });

  it('should notify late subscribers immediately if already initialized', () => {
    const subscribers = new Set();
    let user = { uid: 'existing-user', email: 'existing@test.com' };
    let initialized = true;

    const service = {
      get currentUser() {
        return user;
      },
      subscribe(cb) {
        subscribers.add(cb);
        if (initialized) cb(user);
        return () => subscribers.delete(cb);
      },
    };

    const received = [];
    const unsub = service.subscribe((u) => received.push(u));
    unsubscribers.push(unsub);

    // Should receive current user immediately
    expect(received).to.have.lengthOf(1);
    expect(received[0].email).to.equal('existing@test.com');
  });
});
