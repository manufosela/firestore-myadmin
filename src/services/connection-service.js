import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from './firebase.js';
import { authService } from './auth-service.js';

class ConnectionService {
  #connections = [];
  #activeConnectionId = null;
  #subscribers = new Set();
  #unsubscribeFirestore = null;
  #unsubscribeAuth = null;

  constructor() {
    this.#unsubscribeAuth = authService.subscribe((user) => {
      if (user) {
        this.#subscribeToConnections(user.uid);
      } else {
        this.#cleanup();
      }
    });
  }

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
    if (this.#activeConnectionId === connectionId) return;
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

  #subscribeToConnections(uid) {
    if (this.#unsubscribeFirestore) {
      this.#unsubscribeFirestore();
    }

    const q = query(collection(db, 'connections'), where('createdBy', '==', uid));

    this.#unsubscribeFirestore = onSnapshot(q, (snapshot) => {
      this.#connections = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      // If active connection was deleted, clear it
      if (this.#activeConnectionId) {
        const stillExists = this.#connections.some((c) => c.id === this.#activeConnectionId);
        if (!stillExists) {
          this.#activeConnectionId = null;
        }
      }

      this.#notify();
    });
  }

  #notify() {
    for (const cb of this.#subscribers) {
      cb({
        connections: this.#connections,
        activeConnectionId: this.#activeConnectionId,
      });
    }
  }

  #cleanup() {
    if (this.#unsubscribeFirestore) {
      this.#unsubscribeFirestore();
      this.#unsubscribeFirestore = null;
    }
    this.#connections = [];
    this.#activeConnectionId = null;
    this.#notify();
  }

  destroy() {
    this.#cleanup();
    if (this.#unsubscribeAuth) {
      this.#unsubscribeAuth();
      this.#unsubscribeAuth = null;
    }
    this.#subscribers.clear();
  }
}

export const connectionService = new ConnectionService();
