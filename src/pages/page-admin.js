import { LitElement, html, css } from 'lit';

export class FmaPageAdmin extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 2rem;
    }
    h2 {
      color: #1a73e8;
    }
  `;

  render() {
    return html`
      <h2>Administración</h2>
      <p>Panel de administración (pendiente de implementar).</p>
    `;
  }
}

customElements.define('fma-page-admin', FmaPageAdmin);
