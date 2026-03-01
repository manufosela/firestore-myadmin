import { LitElement, html, css } from 'lit';
import { connectionService } from '../services/connection-service.js';
import { permissionsApi } from '../services/permissions-api.js';

const VALID_ROLES = ['admin', 'editor', 'viewer'];

export class FmaPageAdmin extends LitElement {
  static properties = {
    _connections: { type: Array, state: true },
    _selectedConnectionId: { type: String, state: true },
    _users: { type: Array, state: true },
    _loading: { type: Boolean, state: true },
    _error: { type: String, state: true },
    _successMessage: { type: String, state: true },
    _myRole: { type: String, state: true },
    _addUid: { type: String, state: true },
    _addRole: { type: String, state: true },
    _addError: { type: String, state: true },
    _confirmRemoveUid: { type: String, state: true },
  };

  static styles = css`
    :host {
      display: block;
      padding: var(--fma-space-xl, 2rem);
    }

    h2 {
      color: var(--fma-text, #202124);
      margin: 0 0 var(--fma-space-lg, 1.5rem);
      font-size: var(--fma-font-size-xl, 1.5rem);
    }

    /* Connection selector */
    .connection-selector {
      margin-bottom: var(--fma-space-lg, 1.5rem);
    }

    .connection-selector label {
      display: block;
      font-size: var(--fma-font-size-sm, 0.875rem);
      font-weight: 500;
      color: var(--fma-text-secondary, #5f6368);
      margin-bottom: var(--fma-space-xs, 0.25rem);
    }

    .connection-selector select {
      padding: var(--fma-space-sm, 0.5rem);
      font-size: var(--fma-font-size-sm, 0.875rem);
      border: 1px solid var(--fma-border, #dadce0);
      border-radius: var(--fma-radius, 4px);
      background: var(--fma-surface, #fff);
      min-width: 280px;
    }

    /* Status messages */
    .error {
      background: #fce8e6;
      color: var(--fma-error, #d93025);
      padding: var(--fma-space-sm, 0.5rem) var(--fma-space-md, 1rem);
      border-radius: var(--fma-radius, 4px);
      margin-bottom: var(--fma-space-md, 1rem);
    }

    .success {
      background: #e6f4ea;
      color: var(--fma-success, #34a853);
      padding: var(--fma-space-sm, 0.5rem) var(--fma-space-md, 1rem);
      border-radius: var(--fma-radius, 4px);
      margin-bottom: var(--fma-space-md, 1rem);
    }

    .loading {
      text-align: center;
      padding: var(--fma-space-xl, 2rem);
      color: var(--fma-text-secondary, #5f6368);
    }

    .info {
      text-align: center;
      padding: var(--fma-space-xl, 2rem);
      color: var(--fma-text-secondary, #5f6368);
    }

    .denied {
      text-align: center;
      padding: var(--fma-space-xl, 2rem);
      color: var(--fma-text-secondary, #5f6368);
    }

    /* Users table */
    .users-table {
      width: 100%;
      border-collapse: collapse;
      background: var(--fma-surface, #fff);
      border: 1px solid var(--fma-border, #dadce0);
      border-radius: var(--fma-radius-lg, 8px);
      overflow: hidden;
      margin-bottom: var(--fma-space-lg, 1.5rem);
    }

    .users-table th {
      text-align: left;
      padding: var(--fma-space-sm, 0.5rem) var(--fma-space-md, 1rem);
      background: var(--fma-bg, #f8f9fa);
      font-size: var(--fma-font-size-sm, 0.875rem);
      font-weight: 600;
      color: var(--fma-text, #202124);
      border-bottom: 1px solid var(--fma-border, #dadce0);
    }

    .users-table td {
      padding: var(--fma-space-sm, 0.5rem) var(--fma-space-md, 1rem);
      font-size: var(--fma-font-size-sm, 0.875rem);
      border-bottom: 1px solid var(--fma-border, #dadce0);
      color: var(--fma-text, #202124);
    }

    .users-table tr:last-child td {
      border-bottom: none;
    }

    .users-table select {
      padding: 2px var(--fma-space-xs, 0.25rem);
      font-size: var(--fma-font-size-sm, 0.875rem);
      border: 1px solid var(--fma-border, #dadce0);
      border-radius: var(--fma-radius, 4px);
      background: var(--fma-surface, #fff);
    }

    .empty {
      text-align: center;
      padding: var(--fma-space-xl, 2rem);
      color: var(--fma-text-secondary, #5f6368);
    }

    /* Buttons */
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

    .btn-primary {
      background: var(--fma-primary, #1a73e8);
      color: #fff;
      border-color: var(--fma-primary, #1a73e8);
    }

    .btn-primary:hover {
      background: var(--fma-primary-dark, #1557b0);
    }

    .btn-danger {
      color: var(--fma-error, #d93025);
      border-color: var(--fma-error, #d93025);
    }

    .btn-danger:hover {
      background: #fce8e6;
    }

    /* Add user form */
    .add-user-form {
      display: flex;
      gap: var(--fma-space-sm, 0.5rem);
      align-items: flex-end;
      margin-bottom: var(--fma-space-md, 1rem);
      flex-wrap: wrap;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .form-field label {
      font-size: var(--fma-font-size-sm, 0.875rem);
      font-weight: 500;
      color: var(--fma-text-secondary, #5f6368);
    }

    .form-field input,
    .form-field select {
      padding: var(--fma-space-sm, 0.5rem);
      font-size: var(--fma-font-size-sm, 0.875rem);
      border: 1px solid var(--fma-border, #dadce0);
      border-radius: var(--fma-radius, 4px);
      background: var(--fma-surface, #fff);
    }

    .form-field input {
      min-width: 260px;
    }

    .add-error {
      color: var(--fma-error, #d93025);
      font-size: var(--fma-font-size-sm, 0.875rem);
      margin-bottom: var(--fma-space-sm, 0.5rem);
    }

    /* Confirm remove */
    .confirm-remove {
      background: #fce8e6;
      padding: var(--fma-space-md, 1rem);
      border-radius: var(--fma-radius, 4px);
      margin-bottom: var(--fma-space-md, 1rem);
    }

    .confirm-remove p {
      color: var(--fma-error, #d93025);
      font-weight: 500;
      margin: 0 0 var(--fma-space-sm, 0.5rem);
    }

    .confirm-actions {
      display: flex;
      gap: var(--fma-space-sm, 0.5rem);
    }

    .role-badge {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 3px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .role-admin {
      background: rgba(26, 115, 232, 0.1);
      color: var(--fma-primary, #1a73e8);
    }

    .role-editor {
      background: #e6f4ea;
      color: var(--fma-success, #34a853);
    }

    .role-viewer {
      background: var(--fma-bg, #f8f9fa);
      color: var(--fma-text-secondary, #5f6368);
    }
  `;

  constructor() {
    super();
    this._connections = [];
    this._selectedConnectionId = '';
    this._users = [];
    this._loading = false;
    this._error = '';
    this._successMessage = '';
    this._myRole = null;
    this._addUid = '';
    this._addRole = 'viewer';
    this._addError = '';
    this._confirmRemoveUid = '';
    this._unsubscribeConnections = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._unsubscribeConnections = connectionService.subscribe(({ connections }) => {
      this._connections = connections;
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._unsubscribeConnections) {
      this._unsubscribeConnections();
      this._unsubscribeConnections = null;
    }
  }

  async _onConnectionChange(e) {
    this._selectedConnectionId = e.target.value;
    this._users = [];
    this._error = '';
    this._successMessage = '';
    this._confirmRemoveUid = '';
    this._addUid = '';
    this._addRole = 'viewer';
    this._addError = '';

    if (!this._selectedConnectionId) {
      this._myRole = null;
      return;
    }

    await this._loadConnectionData();
  }

  async _loadConnectionData() {
    this._loading = true;
    this._error = '';

    try {
      this._myRole = await permissionsApi.getMyRole(this._selectedConnectionId);

      if (this._myRole !== 'admin') {
        this._users = [];
        return;
      }

      const users = await permissionsApi.listConnectionUsers(this._selectedConnectionId);
      this._users = users;
    } catch (err) {
      this._error = err.message ?? 'Error al cargar datos de la conexión.';
    } finally {
      this._loading = false;
    }
  }

  async _changeRole(userId, newRole) {
    this._error = '';
    this._successMessage = '';

    try {
      const result = await permissionsApi.setUserRole(this._selectedConnectionId, userId, newRole);
      this._successMessage = result.message;
      await this._loadConnectionData();
      setTimeout(() => (this._successMessage = ''), 3000);
    } catch (err) {
      this._error = err.message ?? 'Error al cambiar rol.';
    }
  }

  _showRemoveConfirm(userId) {
    this._confirmRemoveUid = userId;
  }

  _cancelRemove() {
    this._confirmRemoveUid = '';
  }

  async _removeUser() {
    const uid = this._confirmRemoveUid;
    this._confirmRemoveUid = '';
    this._error = '';
    this._successMessage = '';

    try {
      const result = await permissionsApi.removeUserRole(this._selectedConnectionId, uid);
      this._successMessage = result.message;
      await this._loadConnectionData();
      setTimeout(() => (this._successMessage = ''), 3000);
    } catch (err) {
      this._error = err.message ?? 'Error al revocar acceso.';
    }
  }

  async _addUser(e) {
    e.preventDefault();
    this._addError = '';
    this._error = '';
    this._successMessage = '';

    if (!this._addUid.trim()) {
      this._addError = 'El UID del usuario es obligatorio.';
      return;
    }

    try {
      const result = await permissionsApi.setUserRole(
        this._selectedConnectionId,
        this._addUid.trim(),
        this._addRole,
      );
      this._successMessage = result.message;
      this._addUid = '';
      this._addRole = 'viewer';
      await this._loadConnectionData();
      setTimeout(() => (this._successMessage = ''), 3000);
    } catch (err) {
      this._addError = err.message ?? 'Error al añadir usuario.';
    }
  }

  _renderConnectionSelector() {
    return html`
      <div class="connection-selector">
        <label for="conn-select">Conexión</label>
        <select id="conn-select" @change=${this._onConnectionChange} .value=${this._selectedConnectionId}>
          <option value="">Seleccionar conexión...</option>
          ${this._connections.map(
            (conn) => html` <option value=${conn.id}>${conn.name} (${conn.projectId})</option> `,
          )}
        </select>
      </div>
    `;
  }

  _renderAddUserForm() {
    return html`
      <form class="add-user-form" @submit=${this._addUser}>
        <div class="form-field">
          <label for="add-uid">UID del usuario</label>
          <input
            id="add-uid"
            type="text"
            placeholder="UID de Firebase Auth"
            .value=${this._addUid}
            @input=${(e) => (this._addUid = e.target.value)}
          />
        </div>
        <div class="form-field">
          <label for="add-role">Rol</label>
          <select id="add-role" .value=${this._addRole} @change=${(e) => (this._addRole = e.target.value)}>
            ${VALID_ROLES.map((role) => html`<option value=${role}>${role}</option>`)}
          </select>
        </div>
        <button type="submit" class="btn btn-primary">Añadir usuario</button>
      </form>
      ${this._addError ? html`<div class="add-error" role="alert">${this._addError}</div>` : ''}
    `;
  }

  _renderUsersTable() {
    if (this._users.length === 0) {
      return html`<div class="empty">No hay usuarios con acceso a esta conexión.</div>`;
    }

    return html`
      <table class="users-table">
        <thead>
          <tr>
            <th>Usuario (UID)</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${this._users.map(
            (user) => html`
              <tr>
                <td>${user.userId}</td>
                <td>
                  <span class="role-badge role-${user.role}">${user.role}</span>
                </td>
                <td>
                  <select
                    .value=${user.role}
                    @change=${(e) => this._changeRole(user.userId, e.target.value)}
                    aria-label="Cambiar rol de ${user.userId}"
                  >
                    ${VALID_ROLES.map((role) => html`<option value=${role}>${role}</option>`)}
                  </select>
                  <button class="btn btn-danger" @click=${() => this._showRemoveConfirm(user.userId)}>
                    Revocar
                  </button>
                </td>
              </tr>
            `,
          )}
        </tbody>
      </table>
    `;
  }

  render() {
    return html`
      <h2>Administración de permisos</h2>

      ${this._renderConnectionSelector()}
      ${this._successMessage ? html`<div class="success" role="status">${this._successMessage}</div>` : ''}
      ${this._error ? html`<div class="error" role="alert">${this._error}</div>` : ''}
      ${this._loading ? html`<div class="loading">Cargando...</div>` : ''}
      ${!this._selectedConnectionId && !this._loading
        ? html`<div class="info">Selecciona una conexión para gestionar sus permisos.</div>`
        : ''}
      ${this._selectedConnectionId && this._myRole && this._myRole !== 'admin' && !this._loading
        ? html`<div class="denied">Solo los administradores pueden gestionar permisos de esta conexión.</div>`
        : ''}
      ${this._selectedConnectionId && this._myRole === 'admin' && !this._loading
        ? html` ${this._renderAddUserForm()} ${this._renderUsersTable()} `
        : ''}
      ${this._confirmRemoveUid
        ? html`
            <div class="confirm-remove">
              <p>¿Revocar acceso del usuario "${this._confirmRemoveUid}"?</p>
              <div class="confirm-actions">
                <button class="btn btn-danger" @click=${this._removeUser}>Revocar</button>
                <button class="btn" @click=${this._cancelRemove}>Cancelar</button>
              </div>
            </div>
          `
        : ''}
    `;
  }
}

customElements.define('fma-page-admin', FmaPageAdmin);
