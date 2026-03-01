import { html, fixture, expect } from '@open-wc/testing';
import { connectionService } from '../src/services/connection-service.js';
import { authService } from '../src/services/auth-service.js';
import '../src/components/fma-app.js';

const mockConnections = [
  { id: 'conn-1', name: 'Production', projectId: 'prod-project' },
  { id: 'conn-2', name: 'Staging', projectId: 'staging-project' },
];

describe('Connection Selector in App Shell', () => {
  beforeEach(() => {
    authService._setUser({ uid: 'test-uid', email: 'test@test.com' });
    connectionService._reset();
  });

  afterEach(() => {
    authService._setUser(null);
    connectionService._reset();
  });

  it('shows "Sin conexiones" when no connections exist', async () => {
    const el = await fixture(html`<fma-app></fma-app>`);
    await el.updateComplete;

    const noConn = el.shadowRoot.querySelector('.no-connections');
    expect(noConn).to.exist;
    expect(noConn.textContent).to.include('Sin conexiones');
  });

  it('lists connections in the sidebar', async () => {
    const el = await fixture(html`<fma-app></fma-app>`);
    connectionService._setConnections(mockConnections);
    await el.updateComplete;

    const links = el.shadowRoot.querySelectorAll('.sidebar nav a[href^="/firestore/"]');
    expect(links.length).to.equal(2);
    expect(links[0].textContent).to.include('Production');
    expect(links[1].textContent).to.include('Staging');
  });

  it('shows project ID under connection name', async () => {
    const el = await fixture(html`<fma-app></fma-app>`);
    connectionService._setConnections(mockConnections);
    await el.updateComplete;

    const projects = el.shadowRoot.querySelectorAll('.conn-project');
    expect(projects[0].textContent).to.equal('prod-project');
    expect(projects[1].textContent).to.equal('staging-project');
  });

  it('highlights active connection with .active class', async () => {
    const el = await fixture(html`<fma-app></fma-app>`);
    connectionService._setConnections(mockConnections);
    connectionService.setActive('conn-1');
    await el.updateComplete;

    const links = el.shadowRoot.querySelectorAll('.sidebar nav a[href^="/firestore/"]');
    expect(links[0].classList.contains('active')).to.be.true;
    expect(links[1].classList.contains('active')).to.be.false;
  });

  it('updates active highlight when switching connections', async () => {
    const el = await fixture(html`<fma-app></fma-app>`);
    connectionService._setConnections(mockConnections);
    connectionService.setActive('conn-1');
    await el.updateComplete;

    connectionService.setActive('conn-2');
    await el.updateComplete;

    const links = el.shadowRoot.querySelectorAll('.sidebar nav a[href^="/firestore/"]');
    expect(links[0].classList.contains('active')).to.be.false;
    expect(links[1].classList.contains('active')).to.be.true;
  });

  it('has correct href for each connection', async () => {
    const el = await fixture(html`<fma-app></fma-app>`);
    connectionService._setConnections(mockConnections);
    await el.updateComplete;

    const links = el.shadowRoot.querySelectorAll('.sidebar nav a[href^="/firestore/"]');
    expect(links[0].getAttribute('href')).to.equal('/firestore/conn-1');
    expect(links[1].getAttribute('href')).to.equal('/firestore/conn-2');
  });

  it('does not show connections section when not authenticated', async () => {
    authService._setUser(null);
    const el = await fixture(html`<fma-app></fma-app>`);
    await el.updateComplete;

    const sidebar = el.shadowRoot.querySelector('.sidebar');
    expect(sidebar).to.not.exist;
  });
});
