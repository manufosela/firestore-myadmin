import { LitElement, html, css } from 'lit';
import { authService } from '../services/auth-service.js';
import { Router } from '@vaadin/router';

const FIREBASE_ERROR_MESSAGES = {
  'auth/invalid-credential': 'Email o contraseña incorrectos.',
  'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
  'auth/too-many-requests': 'Demasiados intentos. Inténtalo de nuevo más tarde.',
  'auth/network-request-failed': 'Error de red. Comprueba tu conexión.',
  'auth/invalid-email': 'El formato del email no es válido.',
};

export class FmaPageLogin extends LitElement {
  static properties = {
    _email: { type: String, state: true },
    _password: { type: String, state: true },
    _error: { type: String, state: true },
    _loading: { type: Boolean, state: true },
  };

  static styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: var(--fma-bg, #f8f9fa);
      font-family: var(--fma-font-family, system-ui, -apple-system, sans-serif);
    }

    .login-card {
      background: var(--fma-surface, #fff);
      border-radius: var(--fma-radius-lg, 8px);
      box-shadow: var(--fma-shadow-md, 0 2px 6px rgba(0, 0, 0, 0.15));
      padding: var(--fma-space-xl, 2rem);
      width: 100%;
      max-width: 400px;
      margin: var(--fma-space-md, 1rem);
    }

    h1 {
      color: var(--fma-primary, #1a73e8);
      font-size: var(--fma-font-size-xl, 1.5rem);
      text-align: center;
      margin: 0 0 var(--fma-space-xs, 0.25rem);
    }

    .subtitle {
      color: var(--fma-text-secondary, #5f6368);
      font-size: var(--fma-font-size-sm, 0.875rem);
      text-align: center;
      margin: 0 0 var(--fma-space-lg, 1.5rem);
    }

    .field {
      margin-bottom: var(--fma-space-md, 1rem);
    }

    label {
      display: block;
      font-size: var(--fma-font-size-sm, 0.875rem);
      color: var(--fma-text, #202124);
      margin-bottom: var(--fma-space-xs, 0.25rem);
      font-weight: 500;
    }

    input {
      width: 100%;
      padding: 0.625rem 0.75rem;
      border: 1px solid var(--fma-border, #dadce0);
      border-radius: var(--fma-radius, 4px);
      font-size: var(--fma-font-size-base, 1rem);
      font-family: inherit;
      color: var(--fma-text, #202124);
      background: var(--fma-surface, #fff);
      box-sizing: border-box;
      transition: border-color var(--fma-transition, 200ms ease-in-out);
    }

    input:focus {
      outline: none;
      border-color: var(--fma-primary, #1a73e8);
      box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
    }

    .error-message {
      background: #fce8e6;
      color: var(--fma-error, #d93025);
      padding: var(--fma-space-sm, 0.5rem) var(--fma-space-md, 1rem);
      border-radius: var(--fma-radius, 4px);
      font-size: var(--fma-font-size-sm, 0.875rem);
      margin-bottom: var(--fma-space-md, 1rem);
    }

    button[type='submit'] {
      width: 100%;
      padding: 0.625rem;
      background: var(--fma-primary, #1a73e8);
      color: #fff;
      border: none;
      border-radius: var(--fma-radius, 4px);
      font-size: var(--fma-font-size-base, 1rem);
      font-weight: 500;
      cursor: pointer;
      transition: background var(--fma-transition, 200ms ease-in-out);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--fma-space-sm, 0.5rem);
    }

    button[type='submit']:hover:not(:disabled) {
      background: var(--fma-primary-dark, #1557b0);
    }

    button[type='submit']:focus-visible {
      outline: 2px solid var(--fma-primary, #1a73e8);
      outline-offset: 2px;
    }

    button[type='submit']:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;

  constructor() {
    super();
    this._email = '';
    this._password = '';
    this._error = '';
    this._loading = false;
  }

  _onInput(field, e) {
    if (field === 'email') {
      this._email = e.target.value;
    } else {
      this._password = e.target.value;
    }
    if (this._error) {
      this._error = '';
    }
  }

  _validateForm() {
    const email = this._email.trim();
    if (!email) {
      return 'El email es obligatorio.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'El formato del email no es válido.';
    }
    if (!this._password) {
      return 'La contraseña es obligatoria.';
    }
    return null;
  }

  async _onSubmit(e) {
    e.preventDefault();

    const validationError = this._validateForm();
    if (validationError) {
      this._error = validationError;
      return;
    }

    this._loading = true;
    this._error = '';

    try {
      await authService.login(this._email.trim(), this._password);
      Router.go('/dashboard');
    } catch (err) {
      const code = err.code;
      this._error = FIREBASE_ERROR_MESSAGES[code] ?? `Error de autenticación: ${code}`;
    } finally {
      this._loading = false;
    }
  }

  render() {
    return html`
      <div class="login-card">
        <h1>Firestore MyAdmin</h1>
        <p class="subtitle">Inicia sesión para continuar</p>

        ${this._error
          ? html`<div class="error-message" role="alert">${this._error}</div>`
          : ''}

        <form @submit=${this._onSubmit}>
          <div class="field">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              .value=${this._email}
              @input=${(e) => this._onInput('email', e)}
              autocomplete="email"
              ?disabled=${this._loading}
            />
          </div>

          <div class="field">
            <label for="password">Contraseña</label>
            <input
              id="password"
              type="password"
              .value=${this._password}
              @input=${(e) => this._onInput('password', e)}
              autocomplete="current-password"
              ?disabled=${this._loading}
            />
          </div>

          <button type="submit" ?disabled=${this._loading}>
            ${this._loading ? html`<span class="spinner"></span>` : ''}
            ${this._loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    `;
  }
}

customElements.define('fma-page-login', FmaPageLogin);
