import { LitElement, html, css } from 'lit';

export class FmaPageLogin extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 2rem;
      text-align: center;
    }
    h2 {
      color: #1a73e8;
    }
  `;

  render() {
    return html`
      <h2>Login</h2>
      <p>Página de autenticación (pendiente de implementar).</p>
    `;
  }
}

customElements.define('fma-page-login', FmaPageLogin);
