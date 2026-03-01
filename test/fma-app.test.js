import { html, fixture, expect } from '@open-wc/testing';
import { authService } from '../src/services/auth-service.js';
import '../src/components/fma-app.js';

describe('FmaApp', () => {
  afterEach(() => {
    authService._setUser(null);
  });

  it('renders the component', async () => {
    const el = await fixture(html`<fma-app></fma-app>`);
    expect(el).to.exist;
    expect(el).to.be.instanceOf(HTMLElement);
  });

  it('has a router outlet', async () => {
    const el = await fixture(html`<fma-app></fma-app>`);
    const outlet = el.shadowRoot.querySelector('#outlet');
    expect(outlet).to.exist;
  });

  describe('when not authenticated', () => {
    it('does not show header', async () => {
      const el = await fixture(html`<fma-app></fma-app>`);
      const header = el.shadowRoot.querySelector('header');
      expect(header).to.not.exist;
    });

    it('does not show sidebar', async () => {
      const el = await fixture(html`<fma-app></fma-app>`);
      const sidebar = el.shadowRoot.querySelector('.sidebar');
      expect(sidebar).to.not.exist;
    });

    it('renders login layout', async () => {
      const el = await fixture(html`<fma-app></fma-app>`);
      const loginLayout = el.shadowRoot.querySelector('.login-layout');
      expect(loginLayout).to.exist;
    });
  });

  describe('when authenticated', () => {
    it('displays the logo text', async () => {
      authService._setUser({ uid: 'test', email: 'user@test.com' });
      const el = await fixture(html`<fma-app></fma-app>`);
      const logo = el.shadowRoot.querySelector('.logo');
      expect(logo).to.exist;
      expect(logo.textContent).to.equal('Firestore MyAdmin');
    });

    it('has a header element', async () => {
      authService._setUser({ uid: 'test', email: 'user@test.com' });
      const el = await fixture(html`<fma-app></fma-app>`);
      const header = el.shadowRoot.querySelector('header');
      expect(header).to.exist;
    });

    it('has a sidebar', async () => {
      authService._setUser({ uid: 'test', email: 'user@test.com' });
      const el = await fixture(html`<fma-app></fma-app>`);
      const sidebar = el.shadowRoot.querySelector('.sidebar');
      expect(sidebar).to.exist;
    });

    it('displays user email', async () => {
      authService._setUser({ uid: 'test', email: 'user@test.com' });
      const el = await fixture(html`<fma-app></fma-app>`);
      const email = el.shadowRoot.querySelector('.user-email');
      expect(email).to.exist;
      expect(email.textContent).to.equal('user@test.com');
    });

    it('has a logout button', async () => {
      authService._setUser({ uid: 'test', email: 'user@test.com' });
      const el = await fixture(html`<fma-app></fma-app>`);
      const logoutBtn = el.shadowRoot.querySelector('.logout-btn');
      expect(logoutBtn).to.exist;
      expect(logoutBtn.textContent).to.equal('Salir');
    });

    it('toggles sidebar on menu button click', async () => {
      authService._setUser({ uid: 'test', email: 'user@test.com' });
      const el = await fixture(html`<fma-app></fma-app>`);
      const btn = el.shadowRoot.querySelector('.menu-btn');
      expect(el.sidebarOpen).to.be.true;
      btn.click();
      expect(el.sidebarOpen).to.be.false;
      btn.click();
      expect(el.sidebarOpen).to.be.true;
    });
  });
});
