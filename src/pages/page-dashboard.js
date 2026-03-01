import { LitElement, html, css } from 'lit';

export class FmaPageDashboard extends LitElement {
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
      <h2>Dashboard</h2>
      <p>Panel principal (pendiente de implementar).</p>
    `;
  }
}

customElements.define('fma-page-dashboard', FmaPageDashboard);
