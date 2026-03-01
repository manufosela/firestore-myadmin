import { LitElement, html, css } from 'lit';
import { authService } from '../services/auth-service.js';
import { Router } from '@vaadin/router';

const FIREBASE_ERROR_MESSAGES = {
  'auth/popup-closed-by-user': 'Se cerró la ventana de inicio de sesión.',
  'auth/cancelled-popup-request': 'Se canceló la solicitud de inicio de sesión.',
  'auth/popup-blocked': 'El navegador bloqueó la ventana emergente. Permite pop-ups e inténtalo de nuevo.',
  'auth/network-request-failed': 'Error de red. Comprueba tu conexión.',
  'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
};

export class FmaPageLogin extends LitElement {
  static properties = {
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
      max-width: 360px;
      margin: var(--fma-space-md, 1rem);
      text-align: center;
    }

    h1 {
      color: var(--fma-primary, #1a73e8);
      font-size: var(--fma-font-size-xl, 1.5rem);
      margin: 0 0 var(--fma-space-xs, 0.25rem);
    }

    .subtitle {
      color: var(--fma-text-secondary, #5f6368);
      font-size: var(--fma-font-size-sm, 0.875rem);
      margin: 0 0 var(--fma-space-lg, 1.5rem);
    }

    .error-message {
      background: #fce8e6;
      color: var(--fma-error, #d93025);
      padding: var(--fma-space-sm, 0.5rem) var(--fma-space-md, 1rem);
      border-radius: var(--fma-radius, 4px);
      font-size: var(--fma-font-size-sm, 0.875rem);
      margin-bottom: var(--fma-space-md, 1rem);
      text-align: left;
    }

    .google-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--fma-space-sm, 0.5rem);
      width: 100%;
      padding: 0.625rem;
      background: var(--fma-surface, #fff);
      color: var(--fma-text, #202124);
      border: 1px solid var(--fma-border, #dadce0);
      border-radius: var(--fma-radius, 4px);
      font-size: var(--fma-font-size-base, 1rem);
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
      transition:
        background var(--fma-transition, 200ms ease-in-out),
        box-shadow var(--fma-transition, 200ms ease-in-out);
    }

    .google-btn:hover:not(:disabled) {
      background: var(--fma-bg, #f8f9fa);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .google-btn:focus-visible {
      outline: 2px solid var(--fma-primary, #1a73e8);
      outline-offset: 2px;
    }

    .google-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .google-icon {
      width: 18px;
      height: 18px;
    }

    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid var(--fma-border, #dadce0);
      border-top-color: var(--fma-primary, #1a73e8);
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
    this._error = '';
    this._loading = false;
  }

  onBeforeEnter(_location, commands) {
    if (authService.isAuthenticated) {
      return commands.redirect('/dashboard');
    }
    return undefined;
  }

  async _loginWithGoogle() {
    this._loading = true;
    this._error = '';

    try {
      await authService.loginWithGoogle();
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

        ${this._error ? html`<div class="error-message" role="alert">${this._error}</div>` : ''}

        <button class="google-btn" @click=${this._loginWithGoogle} ?disabled=${this._loading}>
          ${this._loading
            ? html`<span class="spinner"></span> Iniciando sesión…`
            : html`
                <svg class="google-icon" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Iniciar sesión con Google
              `}
        </button>
      </div>
    `;
  }
}

customElements.define('fma-page-login', FmaPageLogin);
