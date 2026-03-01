import { LitElement, html, css } from 'lit';

export class FmaPageFirestore extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 2rem;
    }
    h2 {
      color: #1a73e8;
    }
  `;

  static properties = {
    firestoreId: { type: String },
  };

  constructor() {
    super();
    this.firestoreId = '';
  }

  onBeforeEnter(location) {
    this.firestoreId = location.params.id;
  }

  render() {
    return html`
      <h2>Firestore: ${this.firestoreId}</h2>
      <p>Explorador de Firestore (pendiente de implementar).</p>
    `;
  }
}

customElements.define('fma-page-firestore', FmaPageFirestore);
