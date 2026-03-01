import { LitElement, html, css } from 'lit';
import { initRouter } from '../router/index.js';
import { authService } from '../services/auth-service.js';
import { Router } from '@vaadin/router';

export class FmaApp extends LitElement {
  static properties = {
    sidebarOpen: { type: Boolean, state: true },
    _authenticated: { type: Boolean, state: true },
    _userEmail: { type: String, state: true },
  };

  static styles = css`
    :host {
      display: block;
      font-family: var(--fma-font-family, system-ui, -apple-system, sans-serif);
      color: var(--fma-text, #202124);
      background: var(--fma-bg, #f8f9fa);
      min-height: 100vh;
    }

    /* Header */
    header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: var(--fma-header-height, 56px);
      background: var(--fma-primary, #1a73e8);
      color: #fff;
      display: flex;
      align-items: center;
      padding: 0 var(--fma-space-md, 1rem);
      box-shadow: var(--fma-shadow-md, 0 2px 6px rgba(0, 0, 0, 0.15));
      z-index: 100;
      gap: var(--fma-space-md, 1rem);
    }

    .menu-btn {
      background: none;
      border: none;
      color: #fff;
      font-size: 1.5rem;
      cursor: pointer;
      padding: var(--fma-space-xs, 0.25rem);
      border-radius: var(--fma-radius, 4px);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
    }

    .menu-btn:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    .logo {
      font-size: var(--fma-font-size-lg, 1.25rem);
      font-weight: 600;
      white-space: nowrap;
    }

    .spacer {
      flex: 1;
    }

    .user-info {
      font-size: var(--fma-font-size-sm, 0.875rem);
      opacity: 0.9;
      display: flex;
      align-items: center;
      gap: var(--fma-space-sm, 0.5rem);
    }

    .logout-btn {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #fff;
      padding: var(--fma-space-xs, 0.25rem) var(--fma-space-sm, 0.5rem);
      border-radius: var(--fma-radius, 4px);
      font-size: var(--fma-font-size-sm, 0.875rem);
      cursor: pointer;
      transition: background var(--fma-transition, 200ms ease-in-out);
    }

    .logout-btn:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    /* Sidebar */
    .sidebar {
      position: fixed;
      top: var(--fma-header-height, 56px);
      left: 0;
      bottom: 0;
      width: var(--fma-sidebar-width, 260px);
      background: var(--fma-surface, #fff);
      border-right: 1px solid var(--fma-border, #dadce0);
      overflow-y: auto;
      transition: transform var(--fma-transition, 200ms ease-in-out);
      z-index: 90;
    }

    .sidebar.closed {
      transform: translateX(-100%);
    }

    .sidebar nav {
      padding: var(--fma-space-md, 1rem) 0;
    }

    .sidebar a {
      display: flex;
      align-items: center;
      gap: var(--fma-space-sm, 0.5rem);
      padding: var(--fma-space-sm, 0.5rem) var(--fma-space-lg, 1.5rem);
      color: var(--fma-text, #202124);
      text-decoration: none;
      font-size: var(--fma-font-size-sm, 0.875rem);
      border-radius: 0 var(--fma-radius-lg, 8px) var(--fma-radius-lg, 8px) 0;
      margin-right: var(--fma-space-md, 1rem);
      transition: background var(--fma-transition, 200ms ease-in-out);
    }

    .sidebar a:hover {
      background: var(--fma-bg, #f8f9fa);
    }

    .sidebar .section-title {
      padding: var(--fma-space-md, 1rem) var(--fma-space-lg, 1.5rem) var(--fma-space-xs, 0.25rem);
      font-size: var(--fma-font-size-sm, 0.875rem);
      color: var(--fma-text-secondary, #5f6368);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Overlay for mobile */
    .overlay {
      display: none;
      position: fixed;
      inset: 0;
      top: var(--fma-header-height, 56px);
      background: rgba(0, 0, 0, 0.3);
      z-index: 80;
    }

    /* Main content */
    main {
      margin-top: var(--fma-header-height, 56px);
      margin-left: var(--fma-sidebar-width, 260px);
      min-height: calc(100vh - var(--fma-header-height, 56px));
      transition: margin-left var(--fma-transition, 200ms ease-in-out);
    }

    main.sidebar-closed {
      margin-left: 0;
    }

    /* Login layout (no header/sidebar) */
    .login-layout {
      min-height: 100vh;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
      }

      .sidebar.open {
        transform: translateX(0);
      }

      .sidebar.closed {
        transform: translateX(-100%);
      }

      .overlay.visible {
        display: block;
      }

      main {
        margin-left: 0;
      }
    }
  `;

  constructor() {
    super();
    this.sidebarOpen = true;
    this._authenticated = false;
    this._userEmail = '';
    this._unsubscribe = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._unsubscribe = authService.subscribe((user) => {
      this._authenticated = user !== null;
      this._userEmail = user?.email ?? '';
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
  }

  firstUpdated() {
    this._initRouterOnOutlet();
  }

  updated(changedProperties) {
    if (changedProperties.has('_authenticated')) {
      this._initRouterOnOutlet();
    }
  }

  _initRouterOnOutlet() {
    const outlet = this.shadowRoot.querySelector('#outlet');
    if (outlet) {
      initRouter(outlet);
    }
  }

  _toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  _closeSidebarOnMobile() {
    if (window.innerWidth <= 768) {
      this.sidebarOpen = false;
    }
  }

  async _logout() {
    await authService.logout();
    Router.go('/login');
  }

  render() {
    if (!this._authenticated) {
      return html`
        <div class="login-layout">
          <div id="outlet"></div>
        </div>
      `;
    }

    return html`
      <header>
        <button class="menu-btn" @click=${this._toggleSidebar} aria-label="Toggle menu">
          &#9776;
        </button>
        <span class="logo">Firestore MyAdmin</span>
        <span class="spacer"></span>
        <span class="user-info">
          <span class="user-email">${this._userEmail}</span>
          <button class="logout-btn" @click=${this._logout}>Salir</button>
        </span>
      </header>

      <aside class="sidebar ${this.sidebarOpen ? 'open' : 'closed'}">
        <nav>
          <div class="section-title">General</div>
          <a href="/dashboard" @click=${this._closeSidebarOnMobile}>Dashboard</a>
          <a href="/admin" @click=${this._closeSidebarOnMobile}>Administración</a>

          <div class="section-title">Firestores</div>
          <a href="/firestore/default" @click=${this._closeSidebarOnMobile}>Default Project</a>
        </nav>
      </aside>

      <div class="overlay ${this.sidebarOpen ? 'visible' : ''}" @click=${this._toggleSidebar}></div>

      <main class="${this.sidebarOpen ? '' : 'sidebar-closed'}">
        <div id="outlet"></div>
      </main>
    `;
  }
}

customElements.define('fma-app', FmaApp);
