import { LitElement, html, css } from 'lit';
import '../components/connection-dialog.js';
import '../components/connection-list.js';

export class FmaPageDashboard extends LitElement {
  static properties = {
    _dialogOpen: { type: Boolean, state: true },
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
  `;

  constructor() {
    super();
    this._dialogOpen = false;
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
    window.history.pushState({}, '', `/firestore/${conn.id}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
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
    `;
  }
}

customElements.define('fma-page-dashboard', FmaPageDashboard);
