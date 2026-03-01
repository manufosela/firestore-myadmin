import { html, fixture, expect } from '@open-wc/testing';
import { authService } from '../src/services/auth-service.js';
import { Router } from '@vaadin/router';
import '../src/pages/page-login.js';

describe('FmaPageLogin', () => {
  let originalLogin;
  let originalRouterGo;

  beforeEach(() => {
    originalLogin = authService.login;
    originalRouterGo = Router.go;
  });

  afterEach(() => {
    authService.login = originalLogin;
    Router.go = originalRouterGo;
  });

  describe('rendering', () => {
    it('renders the login form', async () => {
      const el = await fixture(html`<fma-page-login></fma-page-login>`);
      const form = el.shadowRoot.querySelector('form');
      expect(form).to.exist;
    });

    it('displays the title', async () => {
      const el = await fixture(html`<fma-page-login></fma-page-login>`);
      const h1 = el.shadowRoot.querySelector('h1');
      expect(h1).to.exist;
      expect(h1.textContent).to.equal('Firestore MyAdmin');
    });

    it('has email and password inputs with labels', async () => {
      const el = await fixture(html`<fma-page-login></fma-page-login>`);
      const emailLabel = el.shadowRoot.querySelector('label[for="email"]');
      const passwordLabel = el.shadowRoot.querySelector('label[for="password"]');
      const emailInput = el.shadowRoot.querySelector('#email');
      const passwordInput = el.shadowRoot.querySelector('#password');

      expect(emailLabel).to.exist;
      expect(emailLabel.textContent).to.equal('Email');
      expect(passwordLabel).to.exist;
      expect(passwordLabel.textContent).to.equal('Contraseña');
      expect(emailInput).to.exist;
      expect(emailInput.type).to.equal('email');
      expect(passwordInput).to.exist;
      expect(passwordInput.type).to.equal('password');
    });

    it('has a submit button', async () => {
      const el = await fixture(html`<fma-page-login></fma-page-login>`);
      const button = el.shadowRoot.querySelector('button[type="submit"]');
      expect(button).to.exist;
      expect(button.textContent.trim()).to.include('Iniciar sesión');
    });
  });

  describe('validation', () => {
    it('shows error when email is empty', async () => {
      const el = await fixture(html`<fma-page-login></fma-page-login>`);
      const form = el.shadowRoot.querySelector('form');
      form.dispatchEvent(new Event('submit', { cancelable: true }));
      await el.updateComplete;

      const error = el.shadowRoot.querySelector('[role="alert"]');
      expect(error).to.exist;
      expect(error.textContent).to.equal('El email es obligatorio.');
    });

    it('shows error when email format is invalid', async () => {
      const el = await fixture(html`<fma-page-login></fma-page-login>`);
      el._email = 'not-an-email';
      await el.updateComplete;

      const form = el.shadowRoot.querySelector('form');
      form.dispatchEvent(new Event('submit', { cancelable: true }));
      await el.updateComplete;

      const error = el.shadowRoot.querySelector('[role="alert"]');
      expect(error).to.exist;
      expect(error.textContent).to.equal('El formato del email no es válido.');
    });

    it('shows error when password is empty', async () => {
      const el = await fixture(html`<fma-page-login></fma-page-login>`);
      el._email = 'test@example.com';
      await el.updateComplete;

      const form = el.shadowRoot.querySelector('form');
      form.dispatchEvent(new Event('submit', { cancelable: true }));
      await el.updateComplete;

      const error = el.shadowRoot.querySelector('[role="alert"]');
      expect(error).to.exist;
      expect(error.textContent).to.equal('La contraseña es obligatoria.');
    });

    it('clears error when user types', async () => {
      const el = await fixture(html`<fma-page-login></fma-page-login>`);
      el._error = 'Some error';
      await el.updateComplete;

      let error = el.shadowRoot.querySelector('[role="alert"]');
      expect(error).to.exist;

      const emailInput = el.shadowRoot.querySelector('#email');
      emailInput.value = 'a';
      emailInput.dispatchEvent(new Event('input'));
      await el.updateComplete;

      error = el.shadowRoot.querySelector('[role="alert"]');
      expect(error).to.not.exist;
    });
  });

  describe('Firebase error mapping', () => {
    it('maps auth/invalid-credential error', async () => {
      authService.login = () => Promise.reject({ code: 'auth/invalid-credential' });

      const el = await fixture(html`<fma-page-login></fma-page-login>`);
      el._email = 'test@example.com';
      el._password = 'wrong-password';
      await el.updateComplete;

      const form = el.shadowRoot.querySelector('form');
      form.dispatchEvent(new Event('submit', { cancelable: true }));

      await new Promise((r) => setTimeout(r, 10));
      await el.updateComplete;

      const error = el.shadowRoot.querySelector('[role="alert"]');
      expect(error).to.exist;
      expect(error.textContent).to.equal('Email o contraseña incorrectos.');
    });

    it('maps auth/user-disabled error', async () => {
      authService.login = () => Promise.reject({ code: 'auth/user-disabled' });

      const el = await fixture(html`<fma-page-login></fma-page-login>`);
      el._email = 'test@example.com';
      el._password = 'password123';
      await el.updateComplete;

      const form = el.shadowRoot.querySelector('form');
      form.dispatchEvent(new Event('submit', { cancelable: true }));

      await new Promise((r) => setTimeout(r, 10));
      await el.updateComplete;

      const error = el.shadowRoot.querySelector('[role="alert"]');
      expect(error).to.exist;
      expect(error.textContent).to.equal('Esta cuenta ha sido deshabilitada.');
    });
  });

  describe('loading state', () => {
    it('disables inputs and button during loading', async () => {
      authService.login = () => new Promise(() => {}); // Never resolves

      const el = await fixture(html`<fma-page-login></fma-page-login>`);
      el._email = 'test@example.com';
      el._password = 'password123';
      await el.updateComplete;

      const form = el.shadowRoot.querySelector('form');
      form.dispatchEvent(new Event('submit', { cancelable: true }));
      await el.updateComplete;

      const emailInput = el.shadowRoot.querySelector('#email');
      const passwordInput = el.shadowRoot.querySelector('#password');
      const button = el.shadowRoot.querySelector('button[type="submit"]');

      expect(emailInput.disabled).to.be.true;
      expect(passwordInput.disabled).to.be.true;
      expect(button.disabled).to.be.true;
      expect(button.textContent.trim()).to.include('Iniciando sesión');
    });

    it('shows spinner during loading', async () => {
      authService.login = () => new Promise(() => {});

      const el = await fixture(html`<fma-page-login></fma-page-login>`);
      el._email = 'test@example.com';
      el._password = 'password123';
      await el.updateComplete;

      const form = el.shadowRoot.querySelector('form');
      form.dispatchEvent(new Event('submit', { cancelable: true }));
      await el.updateComplete;

      const spinner = el.shadowRoot.querySelector('.spinner');
      expect(spinner).to.exist;
    });
  });

  describe('successful login', () => {
    it('navigates to /dashboard on successful login', async () => {
      authService.login = () => Promise.resolve({ uid: 'test-uid', email: 'test@example.com' });
      let navigatedTo = null;
      Router.go = (path) => {
        navigatedTo = path;
      };

      const el = await fixture(html`<fma-page-login></fma-page-login>`);
      el._email = 'test@example.com';
      el._password = 'correct-password';
      await el.updateComplete;

      const form = el.shadowRoot.querySelector('form');
      form.dispatchEvent(new Event('submit', { cancelable: true }));

      await new Promise((r) => setTimeout(r, 10));
      await el.updateComplete;

      expect(navigatedTo).to.equal('/dashboard');
    });
  });
});
