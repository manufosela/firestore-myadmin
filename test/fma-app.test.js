import { html, fixture, expect } from '@open-wc/testing';
import '../src/components/fma-app.js';

describe('FmaApp', () => {
  it('renders the component', async () => {
    const el = await fixture(html`<fma-app></fma-app>`);
    expect(el).to.exist;
    expect(el).to.be.instanceOf(HTMLElement);
  });

  it('displays the logo text', async () => {
    const el = await fixture(html`<fma-app></fma-app>`);
    const logo = el.shadowRoot.querySelector('.logo');
    expect(logo).to.exist;
    expect(logo.textContent).to.equal('Firestore MyAdmin');
  });

  it('has a header element', async () => {
    const el = await fixture(html`<fma-app></fma-app>`);
    const header = el.shadowRoot.querySelector('header');
    expect(header).to.exist;
  });

  it('has a sidebar', async () => {
    const el = await fixture(html`<fma-app></fma-app>`);
    const sidebar = el.shadowRoot.querySelector('.sidebar');
    expect(sidebar).to.exist;
  });

  it('toggles sidebar on menu button click', async () => {
    const el = await fixture(html`<fma-app></fma-app>`);
    const btn = el.shadowRoot.querySelector('.menu-btn');
    expect(el.sidebarOpen).to.be.true;
    btn.click();
    expect(el.sidebarOpen).to.be.false;
    btn.click();
    expect(el.sidebarOpen).to.be.true;
  });

  it('has a router outlet', async () => {
    const el = await fixture(html`<fma-app></fma-app>`);
    const outlet = el.shadowRoot.querySelector('#outlet');
    expect(outlet).to.exist;
  });
});
