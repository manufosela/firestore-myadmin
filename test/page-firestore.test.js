import { html, fixture, expect } from '@open-wc/testing';
import { firestoreApi } from '../src/services/firestore-api.js';
import { connectionService } from '../src/services/connection-service.js';
import '../src/pages/page-firestore.js';

const mockCollections = [
  { id: 'users', path: 'users' },
  { id: 'orders', path: 'orders' },
];

const mockDocuments = {
  documents: [
    { id: 'doc1', path: 'users/doc1', data: { name: 'Alice', age: 30 } },
    { id: 'doc2', path: 'users/doc2', data: { name: 'Bob', age: 25 } },
  ],
  hasMore: false,
};

const mockDocument = {
  id: 'doc1',
  path: 'users/doc1',
  data: { name: 'Alice', age: 30, created: { _type: 'timestamp', value: '2026-01-01T00:00:00Z' } },
  subcollections: [{ id: 'posts', path: 'users/doc1/posts' }],
};

describe('FmaPageFirestore', () => {
  let originalListCollections;
  let originalListDocuments;
  let originalGetDocument;

  beforeEach(() => {
    originalListCollections = firestoreApi.listCollections;
    originalListDocuments = firestoreApi.listDocuments;
    originalGetDocument = firestoreApi.getDocument;
    connectionService._reset();
    connectionService._setConnections([{ id: 'conn-1', name: 'Production', projectId: 'prod' }]);
  });

  afterEach(() => {
    firestoreApi.listCollections = originalListCollections;
    firestoreApi.listDocuments = originalListDocuments;
    firestoreApi.getDocument = originalGetDocument;
    connectionService._reset();
  });

  describe('initial load', () => {
    it('renders the page with title', async () => {
      firestoreApi.listCollections = async () => mockCollections;

      const el = await fixture(html`<fma-page-firestore></fma-page-firestore>`);
      el.firestoreId = 'conn-1';
      el._connectionName = 'Production';
      el._collections = mockCollections;
      el._view = 'collections';
      el._loading = false;
      await el.updateComplete;

      const h2 = el.shadowRoot.querySelector('h2');
      expect(h2.textContent).to.equal('Production');
    });

    it('displays collections list', async () => {
      const el = await fixture(html`<fma-page-firestore></fma-page-firestore>`);
      el.firestoreId = 'conn-1';
      el._collections = mockCollections;
      el._view = 'collections';
      el._loading = false;
      await el.updateComplete;

      const items = el.shadowRoot.querySelectorAll('.list-item');
      expect(items.length).to.equal(2);
      expect(items[0].querySelector('.name').textContent).to.equal('users');
      expect(items[1].querySelector('.name').textContent).to.equal('orders');
    });

    it('shows empty message when no collections', async () => {
      const el = await fixture(html`<fma-page-firestore></fma-page-firestore>`);
      el.firestoreId = 'conn-1';
      el._collections = [];
      el._view = 'collections';
      el._loading = false;
      await el.updateComplete;

      const empty = el.shadowRoot.querySelector('.empty');
      expect(empty).to.exist;
      expect(empty.textContent).to.include('No hay colecciones');
    });
  });

  describe('documents view', () => {
    it('displays documents when collection is selected', async () => {
      firestoreApi.listDocuments = async () => mockDocuments;

      const el = await fixture(html`<fma-page-firestore></fma-page-firestore>`);
      el.firestoreId = 'conn-1';
      el._collections = mockCollections;
      el._view = 'collections';
      el._loading = false;
      await el.updateComplete;

      await el._selectCollection(mockCollections[0]);
      await el.updateComplete;

      const items = el.shadowRoot.querySelectorAll('.list-item');
      expect(items.length).to.equal(2);
      expect(items[0].querySelector('.name').textContent).to.equal('doc1');
    });

    it('shows breadcrumbs after selecting collection', async () => {
      firestoreApi.listDocuments = async () => mockDocuments;

      const el = await fixture(html`<fma-page-firestore></fma-page-firestore>`);
      el.firestoreId = 'conn-1';
      el._connectionName = 'Production';
      el._view = 'collections';
      el._loading = false;
      await el.updateComplete;

      await el._selectCollection(mockCollections[0]);
      await el.updateComplete;

      const breadcrumbs = el.shadowRoot.querySelector('.breadcrumbs');
      expect(breadcrumbs).to.exist;
      expect(breadcrumbs.textContent).to.include('Production');
      expect(breadcrumbs.textContent).to.include('users');
    });

    it('shows load more button when hasMore is true', async () => {
      firestoreApi.listDocuments = async () => ({
        documents: mockDocuments.documents,
        hasMore: true,
      });

      const el = await fixture(html`<fma-page-firestore></fma-page-firestore>`);
      el.firestoreId = 'conn-1';
      el._view = 'collections';
      el._loading = false;
      await el.updateComplete;

      await el._selectCollection(mockCollections[0]);
      await el.updateComplete;

      const loadMore = el.shadowRoot.querySelector('.load-more');
      expect(loadMore).to.exist;
      expect(loadMore.textContent).to.include('Cargar más');
    });
  });

  describe('document detail view', () => {
    it('displays document fields', async () => {
      firestoreApi.listDocuments = async () => mockDocuments;
      firestoreApi.getDocument = async () => mockDocument;

      const el = await fixture(html`<fma-page-firestore></fma-page-firestore>`);
      el.firestoreId = 'conn-1';
      el._view = 'collections';
      el._loading = false;
      await el.updateComplete;

      await el._selectCollection(mockCollections[0]);
      await el.updateComplete;

      await el._selectDocument(mockDocuments.documents[0]);
      await el.updateComplete;

      const detail = el.shadowRoot.querySelector('.doc-detail');
      expect(detail).to.exist;

      const header = detail.querySelector('.doc-header');
      expect(header.textContent).to.equal('doc1');

      const fields = detail.querySelectorAll('.field-row');
      expect(fields.length).to.equal(3); // name, age, created
    });

    it('shows subcollections', async () => {
      firestoreApi.listDocuments = async () => mockDocuments;
      firestoreApi.getDocument = async () => mockDocument;

      const el = await fixture(html`<fma-page-firestore></fma-page-firestore>`);
      el.firestoreId = 'conn-1';
      el._view = 'collections';
      el._loading = false;
      await el.updateComplete;

      await el._selectCollection(mockCollections[0]);
      await el.updateComplete;

      await el._selectDocument(mockDocuments.documents[0]);
      await el.updateComplete;

      const subTitle = el.shadowRoot.querySelector('.subcollections-title');
      expect(subTitle).to.exist;
      expect(subTitle.textContent).to.include('Subcolecciones');

      const subItems = el.shadowRoot.querySelectorAll('.subcollections-list .list-item');
      expect(subItems.length).to.equal(1);
      expect(subItems[0].querySelector('.name').textContent).to.equal('posts');
    });

    it('shows type labels for special fields', async () => {
      firestoreApi.listDocuments = async () => mockDocuments;
      firestoreApi.getDocument = async () => mockDocument;

      const el = await fixture(html`<fma-page-firestore></fma-page-firestore>`);
      el.firestoreId = 'conn-1';
      el._view = 'collections';
      el._loading = false;
      await el.updateComplete;

      await el._selectCollection(mockCollections[0]);
      await el.updateComplete;

      await el._selectDocument(mockDocuments.documents[0]);
      await el.updateComplete;

      const typeLabels = el.shadowRoot.querySelectorAll('.field-type');
      const types = Array.from(typeLabels).map((t) => t.textContent);
      expect(types).to.include('timestamp');
      expect(types).to.include('string');
      expect(types).to.include('number');
    });
  });

  describe('error handling', () => {
    it('shows error message on API failure', async () => {
      firestoreApi.listCollections = async () => {
        throw new Error('Network error');
      };

      const el = await fixture(html`<fma-page-firestore></fma-page-firestore>`);
      el.firestoreId = 'conn-1';

      // Simulate onBeforeEnter
      el._breadcrumbs = [];
      await el._loadCollections();
      await el.updateComplete;

      const error = el.shadowRoot.querySelector('.error');
      expect(error).to.exist;
      expect(error.textContent).to.include('Network error');
    });
  });

  describe('breadcrumb navigation', () => {
    it('navigates back to root on breadcrumb root click', async () => {
      firestoreApi.listCollections = async () => mockCollections;
      firestoreApi.listDocuments = async () => mockDocuments;

      const el = await fixture(html`<fma-page-firestore></fma-page-firestore>`);
      el.firestoreId = 'conn-1';
      el._connectionName = 'Production';
      el._view = 'collections';
      el._loading = false;
      el._collections = mockCollections;
      await el.updateComplete;

      // Select a collection to create breadcrumbs
      await el._selectCollection(mockCollections[0]);
      await el.updateComplete;

      expect(el._breadcrumbs.length).to.equal(1);

      // Click root breadcrumb
      el._navigateToBreadcrumb(-1);
      await el.updateComplete;

      expect(el._breadcrumbs.length).to.equal(0);
      expect(el._view).to.equal('collections');
    });
  });

  describe('CRUD operations', () => {
    it('shows "Nuevo documento" button in documents view', async () => {
      firestoreApi.listDocuments = async () => mockDocuments;

      const el = await fixture(html`<fma-page-firestore></fma-page-firestore>`);
      el.firestoreId = 'conn-1';
      el._view = 'collections';
      el._loading = false;
      await el.updateComplete;

      await el._selectCollection(mockCollections[0]);
      await el.updateComplete;

      const newBtn = el.shadowRoot.querySelector('.btn-primary');
      expect(newBtn).to.exist;
      expect(newBtn.textContent).to.include('Nuevo documento');
    });

    it('shows Edit and Delete buttons in document detail', async () => {
      firestoreApi.listDocuments = async () => mockDocuments;
      firestoreApi.getDocument = async () => mockDocument;

      const el = await fixture(html`<fma-page-firestore></fma-page-firestore>`);
      el.firestoreId = 'conn-1';
      el._view = 'collections';
      el._loading = false;
      await el.updateComplete;

      await el._selectCollection(mockCollections[0]);
      await el.updateComplete;

      await el._selectDocument(mockDocuments.documents[0]);
      await el.updateComplete;

      const docActions = el.shadowRoot.querySelector('.doc-actions');
      expect(docActions).to.exist;
      const buttons = docActions.querySelectorAll('.btn');
      const texts = Array.from(buttons).map((b) => b.textContent.trim());
      expect(texts).to.include('Editar');
      expect(texts).to.include('Eliminar');
    });

    it('opens editor on "Nuevo documento" click', async () => {
      firestoreApi.listDocuments = async () => mockDocuments;

      const el = await fixture(html`<fma-page-firestore></fma-page-firestore>`);
      el.firestoreId = 'conn-1';
      el._view = 'collections';
      el._loading = false;
      await el.updateComplete;

      await el._selectCollection(mockCollections[0]);
      await el.updateComplete;

      el._openCreateEditor();
      await el.updateComplete;

      expect(el._editorOpen).to.be.true;
      expect(el._editorMode).to.equal('create');
    });

    it('opens editor on Edit click', async () => {
      firestoreApi.listDocuments = async () => mockDocuments;
      firestoreApi.getDocument = async () => mockDocument;

      const el = await fixture(html`<fma-page-firestore></fma-page-firestore>`);
      el.firestoreId = 'conn-1';
      el._view = 'collections';
      el._loading = false;
      await el.updateComplete;

      await el._selectCollection(mockCollections[0]);
      await el.updateComplete;

      await el._selectDocument(mockDocuments.documents[0]);
      await el.updateComplete;

      el._openEditEditor();
      await el.updateComplete;

      expect(el._editorOpen).to.be.true;
      expect(el._editorMode).to.equal('edit');
      expect(el._editorFields.length).to.equal(3);
    });

    it('shows delete confirmation on Eliminar click', async () => {
      firestoreApi.listDocuments = async () => mockDocuments;
      firestoreApi.getDocument = async () => mockDocument;

      const el = await fixture(html`<fma-page-firestore></fma-page-firestore>`);
      el.firestoreId = 'conn-1';
      el._view = 'collections';
      el._loading = false;
      await el.updateComplete;

      await el._selectCollection(mockCollections[0]);
      await el.updateComplete;

      await el._selectDocument(mockDocuments.documents[0]);
      await el.updateComplete;

      el._showDeleteConfirm();
      await el.updateComplete;

      const confirm = el.shadowRoot.querySelector('.confirm-delete');
      expect(confirm).to.exist;
      expect(confirm.textContent).to.include('Eliminar');
    });

    it('cancels delete confirmation', async () => {
      firestoreApi.listDocuments = async () => mockDocuments;
      firestoreApi.getDocument = async () => mockDocument;

      const el = await fixture(html`<fma-page-firestore></fma-page-firestore>`);
      el.firestoreId = 'conn-1';
      el._view = 'collections';
      el._loading = false;
      await el.updateComplete;

      await el._selectCollection(mockCollections[0]);
      await el.updateComplete;

      await el._selectDocument(mockDocuments.documents[0]);
      await el.updateComplete;

      el._showDeleteConfirm();
      await el.updateComplete;

      el._cancelDelete();
      await el.updateComplete;

      const confirm = el.shadowRoot.querySelector('.confirm-delete');
      expect(confirm).to.not.exist;
    });

    it('deletes document and returns to documents view', async () => {
      firestoreApi.listDocuments = async () => mockDocuments;
      firestoreApi.getDocument = async () => mockDocument;
      firestoreApi.deleteDocument = async () => ({ message: 'ok' });

      const el = await fixture(html`<fma-page-firestore></fma-page-firestore>`);
      el.firestoreId = 'conn-1';
      el._view = 'collections';
      el._loading = false;
      await el.updateComplete;

      await el._selectCollection(mockCollections[0]);
      await el.updateComplete;

      await el._selectDocument(mockDocuments.documents[0]);
      await el.updateComplete;

      await el._deleteDocument();
      await el.updateComplete;

      expect(el._view).to.equal('documents');
      expect(el._selectedDoc).to.be.null;
    });
  });
});
