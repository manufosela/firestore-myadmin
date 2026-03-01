import { html, fixture, expect } from '@open-wc/testing';
import { authService } from '../src/services/auth-service.js';
import { Router } from '@vaadin/router';
import '../src/pages/page-login.js';

describe('FmaPageLogin', () => {
  let originalLoginWithGoogle;
  let originalRouterGo;

  beforeEach(() => {
    originalLoginWithGoogle = authService.loginWithGoogle;
    originalRouterGo = Router.go;
  });

  afterEach(() => {
    authService.loginWithGoogle = originalLoginWithGoogle;
    Router.go = originalRouterGo;
  });

  describe('rendering', () => {
    it('displays the title', async () => {
      const el = await fixture(html`<fma-page-login></fma-page-login>`);
      const h1 = el.shadowRoot.querySelector('h1');
      expect(h1).to.exist;
      expect(h1.textContent).to.equal('Firestore MyAdmin');
    });

    it('displays the subtitle', async () => {
      const el = await fixture(html`<fma-page-login></fma-page-login>`);
      const subtitle = el.shadowRoot.querySelector('.subtitle');
      expect(subtitle).to.exist;
      expect(subtitle.textContent).to.include('Inicia sesión');
    });

    it('has a Google sign-in button', async () => {
      const el = await fixture(html`<fma-page-login></fma-page-login>`);
      const btn = el.shadowRoot.querySelector('.google-btn');
      expect(btn).to.exist;
      expect(btn.textContent.trim()).to.include('Iniciar sesión con Google');
    });

    it('shows Google icon in the button', async () => {
      const el = await fixture(html`<fma-page-login></fma-page-login>`);
      const icon = el.shadowRoot.querySelector('.google-icon');
      expect(icon).to.exist;
    });

    it('has a compact card layout', async () => {
      const el = await fixture(html`<fma-page-login></fma-page-login>`);
      const card = el.shadowRoot.querySelector('.login-card');
      expect(card).to.exist;
    });
  });

  describe('Google Auth flow', () => {
    it('navigates to /dashboard on successful login', async () => {
      authService.loginWithGoogle = () => Promise.resolve({ uid: 'test-uid', email: 'test@example.com' });
      let navigatedTo = null;
      Router.go = (path) => {
        navigatedTo = path;
      };

      const el = await fixture(html`<fma-page-login></fma-page-login>`);
      const btn = el.shadowRoot.querySelector('.google-btn');
      btn.click();

      await new Promise((r) => setTimeout(r, 10));
      await el.updateComplete;

      expect(navigatedTo).to.equal('/dashboard');
    });

    it('shows error when popup is closed by user', async () => {
      authService.loginWithGoogle = () => Promise.reject({ code: 'auth/popup-closed-by-user' });

      const el = await fixture(html`<fma-page-login></fma-page-login>`);
      const btn = el.shadowRoot.querySelector('.google-btn');
      btn.click();

      await new Promise((r) => setTimeout(r, 10));
      await el.updateComplete;

      const error = el.shadowRoot.querySelector('[role="alert"]');
      expect(error).to.exist;
      expect(error.textContent).to.include('Se cerró la ventana');
    });

    it('shows error when user account is disabled', async () => {
      authService.loginWithGoogle = () => Promise.reject({ code: 'auth/user-disabled' });

      const el = await fixture(html`<fma-page-login></fma-page-login>`);
      const btn = el.shadowRoot.querySelector('.google-btn');
      btn.click();

      await new Promise((r) => setTimeout(r, 10));
      await el.updateComplete;

      const error = el.shadowRoot.querySelector('[role="alert"]');
      expect(error).to.exist;
      expect(error.textContent).to.include('deshabilitada');
    });
  });

  describe('loading state', () => {
    it('disables button and shows spinner during loading', async () => {
      authService.loginWithGoogle = () => new Promise(() => {}); // Never resolves

      const el = await fixture(html`<fma-page-login></fma-page-login>`);
      const btn = el.shadowRoot.querySelector('.google-btn');
      btn.click();
      await el.updateComplete;

      expect(btn.disabled).to.be.true;
      expect(btn.textContent.trim()).to.include('Iniciando sesión');
      const spinner = el.shadowRoot.querySelector('.spinner');
      expect(spinner).to.exist;
    });
  });
});
