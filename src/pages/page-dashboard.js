import { LitElement, html, css } from 'lit';
import { Router } from '@vaadin/router';
import { connectionService } from '../services/connection-service.js';
import { userAccessApi } from '../services/user-access-api.js';
import { authService } from '../services/auth-service.js';
import '../components/connection-dialog.js';
import '../components/connection-list.js';

export class FmaPageDashboard extends LitElement {
  static properties = {
    _dialogOpen: { type: Boolean, state: true },
    _isSuperadmin: { type: Boolean, state: true },
    _appUsers: { type: Array, state: true },
    _usersLoading: { type: Boolean, state: true },
    _usersError: { type: String, state: true },
  };

  static styles = css`
    :host {
      display: block;
      padding: var(--fma-space-xl, 2rem);
    }

    .header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--fma-space-lg, 1.5rem);
    }

    h2 {
      color: var(--fma-text, #202124);
      margin: 0;
      font-size: var(--fma-font-size-xl, 1.5rem);
    }

    .btn-new {
      display: inline-flex;
      align-items: center;
      gap: var(--fma-space-xs, 0.25rem);
      padding: 0.5rem 1rem;
      background: var(--fma-primary, #1a73e8);
      color: #fff;
      border: none;
      border-radius: var(--fma-radius, 4px);
      font-size: var(--fma-font-size-sm, 0.875rem);
      font-weight: 500;
      cursor: pointer;
      transition: background var(--fma-transition, 200ms ease-in-out);
    }

    .btn-new:hover {
      background: var(--fma-primary-dark, #1557b0);
    }

    .empty-state {
      text-align: center;
      padding: var(--fma-space-xl, 2rem);
      color: var(--fma-text-secondary, #5f6368);
    }

    .empty-state p {
      margin: var(--fma-space-sm, 0.5rem) 0;
    }

    /* User management section */
    .users-section {
      margin-top: var(--fma-space-xl, 2rem);
      border-top: 1px solid var(--fma-border, #dadce0);
      padding-top: var(--fma-space-xl, 2rem);
    }

    .users-section h2 {
      margin-bottom: var(--fma-space-md, 1rem);
    }

    .users-error {
      background: #fce8e6;
      color: var(--fma-error, #d93025);
      padding: var(--fma-space-sm, 0.5rem) var(--fma-space-md, 1rem);
      border-radius: var(--fma-radius, 4px);
      font-size: var(--fma-font-size-sm, 0.875rem);
      margin-bottom: var(--fma-space-md, 1rem);
    }

    .users-table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--fma-font-size-sm, 0.875rem);
    }

    .users-table th,
    .users-table td {
      text-align: left;
      padding: var(--fma-space-sm, 0.5rem) var(--fma-space-md, 1rem);
      border-bottom: 1px solid var(--fma-border, #dadce0);
    }

    .users-table th {
      background: var(--fma-bg, #f8f9fa);
      font-weight: 600;
      color: var(--fma-text-secondary, #5f6368);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .status-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-badge.pending {
      background: #fef7e0;
      color: #b06000;
    }

    .status-badge.approved {
      background: #e6f4ea;
      color: #137333;
    }

    .role-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      background: #e8eaf6;
      color: #3f51b5;
    }

    .role-badge.superadmin {
      background: #fce4ec;
      color: #c62828;
    }

    .btn-approve {
      padding: 4px 12px;
      background: #137333;
      color: #fff;
      border: none;
      border-radius: var(--fma-radius, 4px);
      font-size: 0.75rem;
      cursor: pointer;
      margin-right: 4px;
    }

    .btn-approve:hover {
      background: #0d5c2a;
    }

    .btn-delete {
      padding: 4px 12px;
      background: var(--fma-error, #d93025);
      color: #fff;
      border: none;
      border-radius: var(--fma-radius, 4px);
      font-size: 0.75rem;
      cursor: pointer;
    }

    .btn-delete:hover {
      background: #b71c1c;
    }

    .users-loading {
      text-align: center;
      padding: var(--fma-space-md, 1rem);
      color: var(--fma-text-secondary, #5f6368);
    }
  `;

  constructor() {
    super();
    this._dialogOpen = false;
    this._isSuperadmin = false;
    this._appUsers = [];
    this._usersLoading = false;
    this._usersError = '';
  }

  connectedCallback() {
    super.connectedCallback();
    this._checkSuperadminAndLoadUsers();
  }

  async _checkSuperadminAndLoadUsers() {
    try {
      const access = await userAccessApi.checkUserAccess();
      if (access.role === 'superadmin') {
        this._isSuperadmin = true;
        await this._loadUsers();
      }
    } catch {
      // Not superadmin or error - just don't show the section
    }
  }

  async _loadUsers() {
    this._usersLoading = true;
    this._usersError = '';
    try {
      this._appUsers = await userAccessApi.listAppUsers();
    } catch {
      this._usersError = 'Error al cargar usuarios.';
    } finally {
      this._usersLoading = false;
    }
  }

  async _approveUser(uid) {
    try {
      await userAccessApi.approveUser(uid);
      await this._loadUsers();
    } catch {
      this._usersError = 'Error al aprobar usuario.';
    }
  }

  async _deleteUser(uid) {
    try {
      await userAccessApi.deleteAppUser(uid);
      await this._loadUsers();
    } catch {
      this._usersError = 'Error al eliminar usuario.';
    }
  }

  _openDialog() {
    this._dialogOpen = true;
  }

  _onDialogClose() {
    this._dialogOpen = false;
  }

  _onConnectionCreated() {
    this._dialogOpen = false;
  }

  _onConnectionSelect(e) {
    const conn = e.detail;
    connectionService.setActive(conn.id);
    Router.go(`/firestore/${conn.id}`);
  }

  _renderUsersSection() {
    if (!this._isSuperadmin) return '';

    const currentUid = authService.currentUser?.uid;

    return html`
      <div class="users-section">
        <h2>Gestión de usuarios</h2>

        ${this._usersError ? html`<div class="users-error" role="alert">${this._usersError}</div>` : ''}

        ${this._usersLoading
          ? html`<div class="users-loading">Cargando usuarios...</div>`
          : html`
              <table class="users-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Nombre</th>
                    <th>Estado</th>
                    <th>Rol</th>
                    <th>Registro</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${this._appUsers.map(
                    (user) => html`
                      <tr>
                        <td>${user.email}</td>
                        <td>${user.displayName}</td>
                        <td>
                          <span class="status-badge ${user.status}">${user.status}</span>
                        </td>
                        <td>
                          <span class="role-badge ${user.role}">${user.role}</span>
                        </td>
                        <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                        <td>
                          ${user.status === 'pending'
                            ? html`<button class="btn-approve" @click=${() => this._approveUser(user.uid)}>
                                Aprobar
                              </button>`
                            : ''}
                          ${user.uid !== currentUid
                            ? html`<button class="btn-delete" @click=${() => this._deleteUser(user.uid)}>
                                Eliminar
                              </button>`
                            : ''}
                        </td>
                      </tr>
                    `,
                  )}
                </tbody>
              </table>
            `}
      </div>
    `;
  }

  render() {
    return html`
      <div class="header-row">
        <h2>Conexiones Firestore</h2>
        <button class="btn-new" @click=${this._openDialog}>+ Nueva conexión</button>
      </div>

      <fma-connection-list
        @connection-select=${this._onConnectionSelect}
      ></fma-connection-list>

      <fma-connection-dialog
        ?open=${this._dialogOpen}
        @dialog-close=${this._onDialogClose}
        @connection-created=${this._onConnectionCreated}
      ></fma-connection-dialog>

      ${this._renderUsersSection()}
    `;
  }
}

customElements.define('fma-page-dashboard', FmaPageDashboard);
