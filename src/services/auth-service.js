import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './firebase.js';

class AuthService {
  #user = null;
  #subscribers = new Set();
  #initialized = false;
  #initPromise = null;

  constructor() {
    this.#initPromise = new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        this.#user = user;
        this.#initialized = true;
        this.#notifySubscribers();
        resolve(user);
      });
    });
  }

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
    return this.#initPromise;
  }

  async login(email, password) {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  }

  async logout() {
    await signOut(auth);
  }

  subscribe(callback) {
    this.#subscribers.add(callback);
    if (this.#initialized) {
      callback(this.#user);
    }
    return () => this.#subscribers.delete(callback);
  }

  #notifySubscribers() {
    for (const callback of this.#subscribers) {
      callback(this.#user);
    }
  }
}

export const authService = new AuthService();
