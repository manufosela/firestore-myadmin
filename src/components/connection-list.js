import { LitElement, html, css } from 'lit';
import { collection, query, where, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase.js';
import { authService } from '../services/auth-service.js';

export class FmaConnectionList extends LitElement {
  static properties = {
    connections: { type: Array, state: true },
    _loading: { type: Boolean, state: true },
    _editingId: { type: String, state: true },
    _editName: { type: String, state: true },
    _confirmDeleteId: { type: String, state: true },
  };

  static styles = css`
    :host {
      display: block;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--fma-space-md, 1rem);
    }

    .card {
      background: var(--fma-surface, #fff);
      border: 1px solid var(--fma-border, #dadce0);
      border-radius: var(--fma-radius-lg, 8px);
      padding: var(--fma-space-md, 1rem);
      transition: box-shadow var(--fma-transition, 200ms ease-in-out);
    }

    .card:hover {
      box-shadow: var(--fma-shadow-md, 0 2px 6px rgba(0, 0, 0, 0.15));
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--fma-space-sm, 0.5rem);
    }

    .card-name {
      font-weight: 600;
      color: var(--fma-text, #202124);
      font-size: var(--fma-font-size-base, 1rem);
    }

    .card-project {
      font-size: var(--fma-font-size-sm, 0.875rem);
      color: var(--fma-text-secondary, #5f6368);
      margin-bottom: var(--fma-space-sm, 0.5rem);
    }

    .card-email {
      font-size: var(--fma-font-size-sm, 0.875rem);
      color: var(--fma-text-secondary, #5f6368);
      word-break: break-all;
    }

    .card-actions {
      display: flex;
      gap: var(--fma-space-xs, 0.25rem);
      margin-top: var(--fma-space-md, 1rem);
      border-top: 1px solid var(--fma-border, #dadce0);
      padding-top: var(--fma-space-sm, 0.5rem);
    }

    .btn {
      padding: var(--fma-space-xs, 0.25rem) var(--fma-space-sm, 0.5rem);
      border: 1px solid var(--fma-border, #dadce0);
      border-radius: var(--fma-radius, 4px);
      background: var(--fma-surface, #fff);
      font-size: var(--fma-font-size-sm, 0.875rem);
      cursor: pointer;
      color: var(--fma-text, #202124);
      transition: background var(--fma-transition, 200ms ease-in-out);
    }

    .btn:hover {
      background: var(--fma-bg, #f8f9fa);
    }

    .btn-danger {
      color: var(--fma-error, #d93025);
      border-color: var(--fma-error, #d93025);
    }

    .btn-danger:hover {
      background: #fce8e6;
    }

    .btn-primary {
      background: var(--fma-primary, #1a73e8);
      color: #fff;
      border-color: var(--fma-primary, #1a73e8);
    }

    .btn-primary:hover {
      background: var(--fma-primary-dark, #1557b0);
    }

    .edit-input {
      width: 100%;
      padding: 0.375rem 0.5rem;
      border: 1px solid var(--fma-primary, #1a73e8);
      border-radius: var(--fma-radius, 4px);
      font-size: var(--fma-font-size-base, 1rem);
      font-family: inherit;
      box-sizing: border-box;
    }

    .confirm-delete {
      background: #fce8e6;
      padding: var(--fma-space-sm, 0.5rem);
      border-radius: var(--fma-radius, 4px);
      margin-top: var(--fma-space-sm, 0.5rem);
      font-size: var(--fma-font-size-sm, 0.875rem);
      color: var(--fma-error, #d93025);
    }

    .confirm-actions {
      display: flex;
      gap: var(--fma-space-xs, 0.25rem);
      margin-top: var(--fma-space-xs, 0.25rem);
    }

    .loading {
      text-align: center;
      padding: var(--fma-space-xl, 2rem);
      color: var(--fma-text-secondary, #5f6368);
    }
  `;

  constructor() {
    super();
    this.connections = [];
    this._loading = true;
    this._editingId = null;
    this._editName = '';
    this._confirmDeleteId = null;
    this._unsubscribe = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._subscribeToConnections();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
  }

  _subscribeToConnections() {
    const user = authService.currentUser;
    if (!user) {
      this._loading = false;
      return;
    }

    const q = query(collection(db, 'connections'), where('createdBy', '==', user.uid));

    this._unsubscribe = onSnapshot(q, (snapshot) => {
      this.connections = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      this._loading = false;
    });
  }

  _startEdit(conn) {
    this._editingId = conn.id;
    this._editName = conn.name;
  }

  _cancelEdit() {
    this._editingId = null;
    this._editName = '';
  }

  async _saveEdit(connId) {
    if (!this._editName.trim()) return;
    await updateDoc(doc(db, 'connections', connId), {
      name: this._editName.trim(),
      updatedAt: new Date().toISOString(),
    });
    this._editingId = null;
  }

  _confirmDelete(connId) {
    this._confirmDeleteId = connId;
  }

  _cancelDelete() {
    this._confirmDeleteId = null;
  }

  async _deleteConnection(connId) {
    await deleteDoc(doc(db, 'connections', connId));
    this._confirmDeleteId = null;
    this.dispatchEvent(new CustomEvent('connection-deleted', { detail: { connectionId: connId } }));
  }

  _selectConnection(conn) {
    this.dispatchEvent(new CustomEvent('connection-select', { detail: conn }));
  }

  _renderCard(conn) {
    const isEditing = this._editingId === conn.id;
    const isDeleting = this._confirmDeleteId === conn.id;

    return html`
      <div class="card">
        <div class="card-header">
          ${isEditing
            ? html`<input
                class="edit-input"
                .value=${this._editName}
                @input=${(e) => (this._editName = e.target.value)}
                @keydown=${(e) => e.key === 'Enter' && this._saveEdit(conn.id)}
              />`
            : html`<span class="card-name">${conn.name}</span>`}
        </div>
        <div class="card-project">${conn.projectId}</div>
        <div class="card-email">${conn.clientEmail}</div>

        ${isDeleting
          ? html`
              <div class="confirm-delete">
                Eliminar esta conexion permanentemente?
                <div class="confirm-actions">
                  <button class="btn btn-danger" @click=${() => this._deleteConnection(conn.id)}>
                    Eliminar
                  </button>
                  <button class="btn" @click=${this._cancelDelete}>Cancelar</button>
                </div>
              </div>
            `
          : html`
              <div class="card-actions">
                <button class="btn btn-primary" @click=${() => this._selectConnection(conn)}>
                  Abrir
                </button>
                ${isEditing
                  ? html`
                      <button class="btn" @click=${() => this._saveEdit(conn.id)}>Guardar</button>
                      <button class="btn" @click=${this._cancelEdit}>Cancelar</button>
                    `
                  : html`
                      <button class="btn" @click=${() => this._startEdit(conn)}>Editar</button>
                      <button class="btn btn-danger" @click=${() => this._confirmDelete(conn.id)}>
                        Eliminar
                      </button>
                    `}
              </div>
            `}
      </div>
    `;
  }

  render() {
    if (this._loading) {
      return html`<div class="loading">Cargando conexiones...</div>`;
    }

    if (this.connections.length === 0) {
      return html``;
    }

    return html` <div class="grid">${this.connections.map((c) => this._renderCard(c))}</div> `;
  }
}

customElements.define('fma-connection-list', FmaConnectionList);
