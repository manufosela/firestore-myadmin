import { LitElement, html, css } from 'lit';

export class FmaPageNotFound extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 2rem;
      text-align: center;
    }
    h2 {
      color: #d93025;
    }
    a {
      color: #1a73e8;
    }
  `;

  render() {
    return html`
      <h2>404 - Página no encontrada</h2>
      <p>La ruta solicitada no existe.</p>
      <a href="/dashboard">Volver al dashboard</a>
    `;
  }
}

customElements.define('fma-page-not-found', FmaPageNotFound);
