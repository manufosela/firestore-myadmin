import { LitElement, html, css } from 'lit';

export class FmaApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family:
        system-ui,
        -apple-system,
        sans-serif;
      padding: 2rem;
    }

    h1 {
      color: #1a73e8;
      margin: 0 0 1rem;
    }

    p {
      color: #5f6368;
    }
  `;

  render() {
    return html`
      <h1>Firestore MyAdmin</h1>
      <p>Gestor multi-Firestore en desarrollo.</p>
    `;
  }
}

customElements.define('fma-app', FmaApp);
