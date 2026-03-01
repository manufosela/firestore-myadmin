import { LitElement, html, css } from 'lit';
import { connectionService } from '../services/connection-service.js';

export class FmaPageFirestore extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: var(--fma-space-xl, 2rem);
    }

    h2 {
      color: var(--fma-text, #202124);
      margin: 0 0 var(--fma-space-md, 1rem);
      font-size: var(--fma-font-size-xl, 1.5rem);
    }

    .connection-info {
      color: var(--fma-text-secondary, #5f6368);
      font-size: var(--fma-font-size-sm, 0.875rem);
    }
  `;

  static properties = {
    firestoreId: { type: String },
    _connectionName: { type: String, state: true },
  };

  constructor() {
    super();
    this.firestoreId = '';
    this._connectionName = '';
  }

  onBeforeEnter(location) {
    this.firestoreId = location.params.id;
    connectionService.setActive(this.firestoreId);
    const conn = connectionService.activeConnection;
    this._connectionName = conn?.name ?? '';
  }

  render() {
    return html`
      <h2>${this._connectionName || this.firestoreId}</h2>
      <p class="connection-info">Explorador de Firestore (pendiente de implementar).</p>
    `;
  }
}

customElements.define('fma-page-firestore', FmaPageFirestore);
