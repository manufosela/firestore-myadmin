import { html, fixture, expect } from '@open-wc/testing';
import { onSnapshot } from 'firebase/firestore';
import { authService } from '../src/services/auth-service.js';
import '../src/components/connection-list.js';

function simulateSnapshot(docs) {
  if (onSnapshot._lastCallback) {
    onSnapshot._lastCallback({
      docs: docs.map((d) => ({
        id: d.id,
        data: () => ({ ...d }),
      })),
    });
  }
}

describe('FmaConnectionList', () => {
  beforeEach(() => {
    authService._setUser({ uid: 'test-uid', email: 'test@test.com' });
    onSnapshot._lastCallback = null;
  });

  afterEach(() => {
    authService._setUser(null);
  });

  describe('loading state', () => {
    it('shows loading message initially', async () => {
      const el = await fixture(html`<fma-connection-list></fma-connection-list>`);
      const loading = el.shadowRoot.querySelector('.loading');
      expect(loading).to.exist;
      expect(loading.textContent).to.include('Cargando');
    });
  });

  describe('empty state', () => {
    it('renders nothing when no connections', async () => {
      const el = await fixture(html`<fma-connection-list></fma-connection-list>`);
      simulateSnapshot([]);
      await el.updateComplete;

      const grid = el.shadowRoot.querySelector('.grid');
      expect(grid).to.not.exist;
    });
  });

  describe('with connections', () => {
    const mockConnections = [
      { id: 'conn-1', name: 'Production', projectId: 'my-project', clientEmail: 'sa@gcloud.com' },
      { id: 'conn-2', name: 'Staging', projectId: 'my-staging', clientEmail: 'sa2@gcloud.com' },
    ];

    it('renders a card for each connection', async () => {
      const el = await fixture(html`<fma-connection-list></fma-connection-list>`);
      simulateSnapshot(mockConnections);
      await el.updateComplete;

      const cards = el.shadowRoot.querySelectorAll('.card');
      expect(cards.length).to.equal(2);
    });

    it('displays connection name', async () => {
      const el = await fixture(html`<fma-connection-list></fma-connection-list>`);
      simulateSnapshot(mockConnections);
      await el.updateComplete;

      const names = el.shadowRoot.querySelectorAll('.card-name');
      expect(names[0].textContent).to.equal('Production');
      expect(names[1].textContent).to.equal('Staging');
    });

    it('displays project ID', async () => {
      const el = await fixture(html`<fma-connection-list></fma-connection-list>`);
      simulateSnapshot(mockConnections);
      await el.updateComplete;

      const projects = el.shadowRoot.querySelectorAll('.card-project');
      expect(projects[0].textContent).to.equal('my-project');
    });

    it('displays client email', async () => {
      const el = await fixture(html`<fma-connection-list></fma-connection-list>`);
      simulateSnapshot(mockConnections);
      await el.updateComplete;

      const emails = el.shadowRoot.querySelectorAll('.card-email');
      expect(emails[0].textContent).to.equal('sa@gcloud.com');
    });

    it('has Abrir, Editar, and Eliminar buttons', async () => {
      const el = await fixture(html`<fma-connection-list></fma-connection-list>`);
      simulateSnapshot(mockConnections);
      await el.updateComplete;

      const buttons = el.shadowRoot.querySelectorAll('.card:first-child .btn');
      const texts = Array.from(buttons).map((b) => b.textContent.trim());
      expect(texts).to.include('Abrir');
      expect(texts).to.include('Editar');
      expect(texts).to.include('Eliminar');
    });

    it('dispatches connection-select on Abrir click', async () => {
      const el = await fixture(html`<fma-connection-list></fma-connection-list>`);
      simulateSnapshot(mockConnections);
      await el.updateComplete;

      let selected = null;
      el.addEventListener('connection-select', (e) => {
        selected = e.detail;
      });

      const openBtn = el.shadowRoot.querySelector('.btn-primary');
      openBtn.click();
      expect(selected).to.not.be.null;
      expect(selected.id).to.equal('conn-1');
    });

    it('shows edit input on Editar click', async () => {
      const el = await fixture(html`<fma-connection-list></fma-connection-list>`);
      simulateSnapshot(mockConnections);
      await el.updateComplete;

      const editBtn = Array.from(el.shadowRoot.querySelectorAll('.btn')).find(
        (b) => b.textContent.trim() === 'Editar',
      );
      editBtn.click();
      await el.updateComplete;

      const input = el.shadowRoot.querySelector('.edit-input');
      expect(input).to.exist;
      expect(input.value).to.equal('Production');
    });

    it('shows Guardar and Cancelar in edit mode', async () => {
      const el = await fixture(html`<fma-connection-list></fma-connection-list>`);
      simulateSnapshot(mockConnections);
      await el.updateComplete;

      const editBtn = Array.from(el.shadowRoot.querySelectorAll('.btn')).find(
        (b) => b.textContent.trim() === 'Editar',
      );
      editBtn.click();
      await el.updateComplete;

      const buttons = el.shadowRoot.querySelectorAll('.card:first-child .btn');
      const texts = Array.from(buttons).map((b) => b.textContent.trim());
      expect(texts).to.include('Guardar');
      expect(texts).to.include('Cancelar');
    });

    it('cancels edit mode on Cancelar click', async () => {
      const el = await fixture(html`<fma-connection-list></fma-connection-list>`);
      simulateSnapshot(mockConnections);
      await el.updateComplete;

      const editBtn = Array.from(el.shadowRoot.querySelectorAll('.btn')).find(
        (b) => b.textContent.trim() === 'Editar',
      );
      editBtn.click();
      await el.updateComplete;

      const cancelBtn = Array.from(el.shadowRoot.querySelectorAll('.btn')).find(
        (b) => b.textContent.trim() === 'Cancelar',
      );
      cancelBtn.click();
      await el.updateComplete;

      const input = el.shadowRoot.querySelector('.edit-input');
      expect(input).to.not.exist;
    });

    it('shows delete confirmation on Eliminar click', async () => {
      const el = await fixture(html`<fma-connection-list></fma-connection-list>`);
      simulateSnapshot(mockConnections);
      await el.updateComplete;

      const deleteBtn = Array.from(el.shadowRoot.querySelectorAll('.btn')).find(
        (b) => b.textContent.trim() === 'Eliminar',
      );
      deleteBtn.click();
      await el.updateComplete;

      const confirm = el.shadowRoot.querySelector('.confirm-delete');
      expect(confirm).to.exist;
      expect(confirm.textContent).to.include('Eliminar esta conexion permanentemente');
    });

    it('cancels delete on Cancelar click in confirm', async () => {
      const el = await fixture(html`<fma-connection-list></fma-connection-list>`);
      simulateSnapshot(mockConnections);
      await el.updateComplete;

      const deleteBtn = Array.from(el.shadowRoot.querySelectorAll('.btn')).find(
        (b) => b.textContent.trim() === 'Eliminar',
      );
      deleteBtn.click();
      await el.updateComplete;

      const cancelBtn = Array.from(el.shadowRoot.querySelectorAll('.confirm-actions .btn')).find(
        (b) => b.textContent.trim() === 'Cancelar',
      );
      cancelBtn.click();
      await el.updateComplete;

      const confirm = el.shadowRoot.querySelector('.confirm-delete');
      expect(confirm).to.not.exist;
    });
  });

  describe('without auth', () => {
    it('stops loading when no user', async () => {
      authService._setUser(null);
      const el = await fixture(html`<fma-connection-list></fma-connection-list>`);
      await el.updateComplete;

      // Should not be loading, and no grid
      expect(el._loading).to.be.false;
    });
  });
});
