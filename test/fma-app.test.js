import { html, fixture, expect } from '@open-wc/testing';
import '../src/components/fma-app.js';

describe('FmaApp', () => {
  it('renders the component', async () => {
    const el = await fixture(html`<fma-app></fma-app>`);
    expect(el).to.exist;
    expect(el).to.be.instanceOf(HTMLElement);
  });

  it('displays the title', async () => {
    const el = await fixture(html`<fma-app></fma-app>`);
    const h1 = el.shadowRoot.querySelector('h1');
    expect(h1).to.exist;
    expect(h1.textContent).to.equal('Firestore MyAdmin');
  });
});
