import { LitElement, html, css } from 'lit';
import { connectionService } from '../services/connection-service.js';
import { firestoreApi } from '../services/firestore-api.js';

export class FmaPageFirestore extends LitElement {
  static properties = {
    firestoreId: { type: String },
    _connectionName: { type: String, state: true },
    _breadcrumbs: { type: Array, state: true },
    _collections: { type: Array, state: true },
    _documents: { type: Array, state: true },
    _selectedDoc: { type: Object, state: true },
    _loading: { type: Boolean, state: true },
    _error: { type: String, state: true },
    _hasMore: { type: Boolean, state: true },
    _view: { type: String, state: true }, // 'collections' | 'documents' | 'document'
  };

  static styles = css`
    :host {
      display: block;
      padding: var(--fma-space-xl, 2rem);
    }

    .header {
      display: flex;
      align-items: center;
      gap: var(--fma-space-sm, 0.5rem);
      margin-bottom: var(--fma-space-lg, 1.5rem);
    }

    h2 {
      color: var(--fma-text, #202124);
      margin: 0;
      font-size: var(--fma-font-size-xl, 1.5rem);
    }

    /* Breadcrumbs */
    .breadcrumbs {
      display: flex;
      align-items: center;
      gap: var(--fma-space-xs, 0.25rem);
      margin-bottom: var(--fma-space-md, 1rem);
      font-size: var(--fma-font-size-sm, 0.875rem);
      flex-wrap: wrap;
    }

    .breadcrumb {
      color: var(--fma-primary, #1a73e8);
      cursor: pointer;
      background: none;
      border: none;
      font: inherit;
      padding: 2px 4px;
      border-radius: var(--fma-radius, 4px);
    }

    .breadcrumb:hover {
      background: rgba(26, 115, 232, 0.1);
    }

    .breadcrumb-separator {
      color: var(--fma-text-secondary, #5f6368);
    }

    .breadcrumb-current {
      color: var(--fma-text, #202124);
      font-weight: 600;
    }

    /* Lists */
    .list-item {
      display: flex;
      align-items: center;
      gap: var(--fma-space-sm, 0.5rem);
      padding: var(--fma-space-sm, 0.5rem) var(--fma-space-md, 1rem);
      border: 1px solid var(--fma-border, #dadce0);
      border-radius: var(--fma-radius, 4px);
      margin-bottom: var(--fma-space-xs, 0.25rem);
      cursor: pointer;
      transition: background var(--fma-transition, 200ms ease-in-out);
      background: var(--fma-surface, #fff);
    }

    .list-item:hover {
      background: var(--fma-bg, #f8f9fa);
    }

    .list-item .icon {
      font-size: 1.2rem;
      width: 24px;
      text-align: center;
      flex-shrink: 0;
    }

    .list-item .name {
      font-weight: 500;
      color: var(--fma-text, #202124);
    }

    .list-item .path {
      font-size: var(--fma-font-size-sm, 0.875rem);
      color: var(--fma-text-secondary, #5f6368);
      margin-left: auto;
    }

    /* Document detail */
    .doc-detail {
      background: var(--fma-surface, #fff);
      border: 1px solid var(--fma-border, #dadce0);
      border-radius: var(--fma-radius-lg, 8px);
      overflow: hidden;
    }

    .doc-header {
      padding: var(--fma-space-md, 1rem);
      background: var(--fma-bg, #f8f9fa);
      border-bottom: 1px solid var(--fma-border, #dadce0);
      font-weight: 600;
      color: var(--fma-text, #202124);
    }

    .doc-fields {
      padding: var(--fma-space-md, 1rem);
    }

    .field-row {
      display: flex;
      padding: var(--fma-space-xs, 0.25rem) 0;
      border-bottom: 1px solid var(--fma-border, #dadce0);
      font-size: var(--fma-font-size-sm, 0.875rem);
    }

    .field-row:last-child {
      border-bottom: none;
    }

    .field-key {
      font-weight: 600;
      color: var(--fma-text, #202124);
      min-width: 180px;
      flex-shrink: 0;
      padding-right: var(--fma-space-md, 1rem);
      word-break: break-word;
    }

    .field-value {
      color: var(--fma-text-secondary, #5f6368);
      word-break: break-all;
      flex: 1;
    }

    .field-type {
      font-size: 0.7rem;
      color: var(--fma-text-secondary, #5f6368);
      background: var(--fma-bg, #f8f9fa);
      padding: 1px 4px;
      border-radius: 2px;
      margin-left: var(--fma-space-xs, 0.25rem);
    }

    .subcollections-title {
      padding: var(--fma-space-md, 1rem);
      padding-bottom: var(--fma-space-xs, 0.25rem);
      font-weight: 600;
      color: var(--fma-text, #202124);
      font-size: var(--fma-font-size-sm, 0.875rem);
    }

    .subcollections-list {
      padding: 0 var(--fma-space-md, 1rem) var(--fma-space-md, 1rem);
    }

    /* Status */
    .loading {
      text-align: center;
      padding: var(--fma-space-xl, 2rem);
      color: var(--fma-text-secondary, #5f6368);
    }

    .error {
      background: #fce8e6;
      color: var(--fma-error, #d93025);
      padding: var(--fma-space-sm, 0.5rem) var(--fma-space-md, 1rem);
      border-radius: var(--fma-radius, 4px);
      margin-bottom: var(--fma-space-md, 1rem);
    }

    .load-more {
      display: block;
      margin: var(--fma-space-md, 1rem) auto;
      padding: var(--fma-space-sm, 0.5rem) var(--fma-space-lg, 1.5rem);
      background: var(--fma-surface, #fff);
      border: 1px solid var(--fma-border, #dadce0);
      border-radius: var(--fma-radius, 4px);
      cursor: pointer;
      color: var(--fma-primary, #1a73e8);
      font-size: var(--fma-font-size-sm, 0.875rem);
    }

    .load-more:hover {
      background: var(--fma-bg, #f8f9fa);
    }

    .empty {
      text-align: center;
      padding: var(--fma-space-xl, 2rem);
      color: var(--fma-text-secondary, #5f6368);
    }
  `;

  constructor() {
    super();
    this.firestoreId = '';
    this._connectionName = '';
    this._breadcrumbs = [];
    this._collections = [];
    this._documents = [];
    this._selectedDoc = null;
    this._loading = false;
    this._error = '';
    this._hasMore = false;
    this._view = 'collections';
  }

  onBeforeEnter(location) {
    this.firestoreId = location.params.id;
    connectionService.setActive(this.firestoreId);
    const conn = connectionService.activeConnection;
    this._connectionName = conn?.name ?? '';
    this._breadcrumbs = [];
    this._loadCollections();
  }

  async _loadCollections(parentPath = null) {
    this._loading = true;
    this._error = '';
    this._view = 'collections';
    this._selectedDoc = null;
    this._documents = [];

    try {
      if (parentPath) {
        // Loading subcollections from a document
        const docData = await firestoreApi.getDocument(this.firestoreId, parentPath);
        this._collections = docData.subcollections;
      } else {
        this._collections = await firestoreApi.listCollections(this.firestoreId);
      }
    } catch (err) {
      this._error = err.message ?? 'Error al cargar colecciones.';
      this._collections = [];
    } finally {
      this._loading = false;
    }
  }

  async _selectCollection(col) {
    this._breadcrumbs = [...this._breadcrumbs, { type: 'collection', id: col.id, path: col.path }];
    this._loading = true;
    this._error = '';
    this._view = 'documents';
    this._selectedDoc = null;

    try {
      const result = await firestoreApi.listDocuments(this.firestoreId, col.path);
      this._documents = result.documents;
      this._hasMore = result.hasMore;
    } catch (err) {
      this._error = err.message ?? 'Error al cargar documentos.';
      this._documents = [];
    } finally {
      this._loading = false;
    }
  }

  async _selectDocument(doc) {
    this._breadcrumbs = [...this._breadcrumbs, { type: 'document', id: doc.id, path: doc.path }];
    this._loading = true;
    this._error = '';
    this._view = 'document';

    try {
      this._selectedDoc = await firestoreApi.getDocument(this.firestoreId, doc.path);
    } catch (err) {
      this._error = err.message ?? 'Error al cargar documento.';
      this._selectedDoc = null;
    } finally {
      this._loading = false;
    }
  }

  async _loadMore() {
    const lastDoc = this._documents[this._documents.length - 1];
    if (!lastDoc) return;

    const collectionPath = this._breadcrumbs.findLast((b) => b.type === 'collection')?.path;
    if (!collectionPath) return;

    this._loading = true;
    try {
      const result = await firestoreApi.listDocuments(this.firestoreId, collectionPath, {
        startAfter: lastDoc.id,
      });
      this._documents = [...this._documents, ...result.documents];
      this._hasMore = result.hasMore;
    } catch (err) {
      this._error = err.message ?? 'Error al cargar más documentos.';
    } finally {
      this._loading = false;
    }
  }

  _navigateToBreadcrumb(index) {
    if (index < 0) {
      // Navigate to root collections
      this._breadcrumbs = [];
      this._loadCollections();
      return;
    }

    const crumb = this._breadcrumbs[index];
    this._breadcrumbs = this._breadcrumbs.slice(0, index + 1);

    if (crumb.type === 'collection') {
      this._view = 'documents';
      this._selectedDoc = null;
      this._loading = true;
      this._error = '';

      firestoreApi
        .listDocuments(this.firestoreId, crumb.path)
        .then((result) => {
          this._documents = result.documents;
          this._hasMore = result.hasMore;
        })
        .catch((err) => {
          this._error = err.message ?? 'Error al cargar documentos.';
          this._documents = [];
        })
        .finally(() => {
          this._loading = false;
        });
    } else if (crumb.type === 'document') {
      this._view = 'document';
      this._loading = true;
      this._error = '';

      firestoreApi
        .getDocument(this.firestoreId, crumb.path)
        .then((docData) => {
          this._selectedDoc = docData;
        })
        .catch((err) => {
          this._error = err.message ?? 'Error al cargar documento.';
          this._selectedDoc = null;
        })
        .finally(() => {
          this._loading = false;
        });
    }
  }

  _navigateToSubcollection(subcol) {
    this._breadcrumbs = [...this._breadcrumbs, { type: 'collection', id: subcol.id, path: subcol.path }];
    this._view = 'documents';
    this._selectedDoc = null;
    this._loading = true;
    this._error = '';

    firestoreApi
      .listDocuments(this.firestoreId, subcol.path)
      .then((result) => {
        this._documents = result.documents;
        this._hasMore = result.hasMore;
      })
      .catch((err) => {
        this._error = err.message ?? 'Error al cargar documentos.';
        this._documents = [];
      })
      .finally(() => {
        this._loading = false;
      });
  }

  _formatValue(value) {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object' && value._type === 'timestamp') return value.value;
    if (typeof value === 'object' && value._type === 'reference') return value.value;
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  }

  _getTypeLabel(value) {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object' && value._type === 'timestamp') return 'timestamp';
    if (typeof value === 'object' && value._type === 'reference') return 'reference';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'map';
    return typeof value;
  }

  _renderBreadcrumbs() {
    if (this._breadcrumbs.length === 0) return html``;

    return html`
      <div class="breadcrumbs">
        <button class="breadcrumb" @click=${() => this._navigateToBreadcrumb(-1)}>
          ${this._connectionName || this.firestoreId}
        </button>
        ${this._breadcrumbs.map(
          (crumb, i) => html`
            <span class="breadcrumb-separator">/</span>
            ${i < this._breadcrumbs.length - 1
              ? html`<button class="breadcrumb" @click=${() => this._navigateToBreadcrumb(i)}>
                  ${crumb.id}
                </button>`
              : html`<span class="breadcrumb-current">${crumb.id}</span>`}
          `,
        )}
      </div>
    `;
  }

  _renderCollections() {
    if (this._collections.length === 0 && !this._loading) {
      return html`<div class="empty">No hay colecciones.</div>`;
    }

    return html`
      ${this._collections.map(
        (col) => html`
          <div class="list-item" @click=${() => this._selectCollection(col)}>
            <span class="icon">📁</span>
            <span class="name">${col.id}</span>
            <span class="path">${col.path}</span>
          </div>
        `,
      )}
    `;
  }

  _renderDocuments() {
    if (this._documents.length === 0 && !this._loading) {
      return html`<div class="empty">No hay documentos en esta colección.</div>`;
    }

    return html`
      ${this._documents.map(
        (doc) => html`
          <div class="list-item" @click=${() => this._selectDocument(doc)}>
            <span class="icon">📄</span>
            <span class="name">${doc.id}</span>
          </div>
        `,
      )}
      ${this._hasMore && !this._loading
        ? html`<button class="load-more" @click=${this._loadMore}>Cargar más documentos</button>`
        : ''}
    `;
  }

  _renderDocument() {
    if (!this._selectedDoc) return html``;

    const { data, subcollections } = this._selectedDoc;
    const entries = Object.entries(data ?? {});

    return html`
      <div class="doc-detail">
        <div class="doc-header">${this._selectedDoc.id}</div>
        <div class="doc-fields">
          ${entries.length === 0
            ? html`<div class="empty">Documento vacío.</div>`
            : entries.map(
                ([key, value]) => html`
                  <div class="field-row">
                    <span class="field-key">${key}<span class="field-type">${this._getTypeLabel(value)}</span></span>
                    <span class="field-value">${this._formatValue(value)}</span>
                  </div>
                `,
              )}
        </div>
        ${subcollections?.length > 0
          ? html`
              <div class="subcollections-title">Subcolecciones</div>
              <div class="subcollections-list">
                ${subcollections.map(
                  (subcol) => html`
                    <div class="list-item" @click=${() => this._navigateToSubcollection(subcol)}>
                      <span class="icon">📁</span>
                      <span class="name">${subcol.id}</span>
                    </div>
                  `,
                )}
              </div>
            `
          : ''}
      </div>
    `;
  }

  render() {
    return html`
      <div class="header">
        <h2>${this._connectionName || this.firestoreId}</h2>
      </div>

      ${this._renderBreadcrumbs()}
      ${this._error ? html`<div class="error" role="alert">${this._error}</div>` : ''}
      ${this._loading ? html`<div class="loading">Cargando...</div>` : ''}
      ${this._view === 'collections' && !this._loading ? this._renderCollections() : ''}
      ${this._view === 'documents' && !this._loading ? this._renderDocuments() : ''}
      ${this._view === 'document' && !this._loading ? this._renderDocument() : ''}
    `;
  }
}

customElements.define('fma-page-firestore', FmaPageFirestore);
