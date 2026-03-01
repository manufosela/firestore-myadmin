import { LitElement, html, css } from 'lit';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../services/firebase.js';

const REQUIRED_SA_FIELDS = [
  'type',
  'project_id',
  'private_key_id',
  'private_key',
  'client_email',
  'client_id',
  'auth_uri',
  'token_uri',
];

export class FmaConnectionDialog extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    _name: { type: String, state: true },
    _file: { type: Object, state: true },
    _fileName: { type: String, state: true },
    _error: { type: String, state: true },
    _loading: { type: Boolean, state: true },
    _success: { type: Boolean, state: true },
  };

  static styles = css`
    :host {
      display: none;
    }

    :host([open]) {
      display: block;
    }

    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 200;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .dialog {
      background: var(--fma-surface, #fff);
      border-radius: var(--fma-radius-lg, 8px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      padding: var(--fma-space-xl, 2rem);
      width: 100%;
      max-width: 480px;
      margin: var(--fma-space-md, 1rem);
    }

    h2 {
      margin: 0 0 var(--fma-space-lg, 1.5rem);
      color: var(--fma-text, #202124);
      font-size: var(--fma-font-size-lg, 1.25rem);
    }

    .field {
      margin-bottom: var(--fma-space-md, 1rem);
    }

    label {
      display: block;
      font-size: var(--fma-font-size-sm, 0.875rem);
      color: var(--fma-text, #202124);
      margin-bottom: var(--fma-space-xs, 0.25rem);
      font-weight: 500;
    }

    input[type='text'] {
      width: 100%;
      padding: 0.625rem 0.75rem;
      border: 1px solid var(--fma-border, #dadce0);
      border-radius: var(--fma-radius, 4px);
      font-size: var(--fma-font-size-base, 1rem);
      font-family: inherit;
      color: var(--fma-text, #202124);
      box-sizing: border-box;
    }

    input[type='text']:focus {
      outline: none;
      border-color: var(--fma-primary, #1a73e8);
      box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
    }

    .file-upload {
      border: 2px dashed var(--fma-border, #dadce0);
      border-radius: var(--fma-radius, 4px);
      padding: var(--fma-space-lg, 1.5rem);
      text-align: center;
      cursor: pointer;
      transition: border-color var(--fma-transition, 200ms ease-in-out);
    }

    .file-upload:hover {
      border-color: var(--fma-primary, #1a73e8);
    }

    .file-upload.has-file {
      border-color: var(--fma-success, #34a853);
      background: #e6f4ea;
    }

    .file-upload input[type='file'] {
      display: none;
    }

    .file-upload-text {
      color: var(--fma-text-secondary, #5f6368);
      font-size: var(--fma-font-size-sm, 0.875rem);
    }

    .file-name {
      color: var(--fma-success, #34a853);
      font-weight: 500;
      font-size: var(--fma-font-size-sm, 0.875rem);
    }

    .error-message {
      background: #fce8e6;
      color: var(--fma-error, #d93025);
      padding: var(--fma-space-sm, 0.5rem) var(--fma-space-md, 1rem);
      border-radius: var(--fma-radius, 4px);
      font-size: var(--fma-font-size-sm, 0.875rem);
      margin-bottom: var(--fma-space-md, 1rem);
    }

    .success-message {
      background: #e6f4ea;
      color: var(--fma-success, #34a853);
      padding: var(--fma-space-sm, 0.5rem) var(--fma-space-md, 1rem);
      border-radius: var(--fma-radius, 4px);
      font-size: var(--fma-font-size-sm, 0.875rem);
      margin-bottom: var(--fma-space-md, 1rem);
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--fma-space-sm, 0.5rem);
      margin-top: var(--fma-space-lg, 1.5rem);
    }

    button {
      padding: 0.5rem 1rem;
      border-radius: var(--fma-radius, 4px);
      font-size: var(--fma-font-size-sm, 0.875rem);
      font-weight: 500;
      cursor: pointer;
      border: 1px solid var(--fma-border, #dadce0);
      background: var(--fma-surface, #fff);
      color: var(--fma-text, #202124);
      transition: background var(--fma-transition, 200ms ease-in-out);
    }

    button:hover:not(:disabled) {
      background: var(--fma-bg, #f8f9fa);
    }

    button.primary {
      background: var(--fma-primary, #1a73e8);
      color: #fff;
      border-color: var(--fma-primary, #1a73e8);
    }

    button.primary:hover:not(:disabled) {
      background: var(--fma-primary-dark, #1557b0);
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;

  constructor() {
    super();
    this.open = false;
    this._name = '';
    this._file = null;
    this._fileName = '';
    this._error = '';
    this._loading = false;
    this._success = false;
  }

  _reset() {
    this._name = '';
    this._file = null;
    this._fileName = '';
    this._error = '';
    this._loading = false;
    this._success = false;
  }

  _close() {
    this._reset();
    this.open = false;
    this.dispatchEvent(new CustomEvent('dialog-close'));
  }

  _onFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    this._error = '';
    this._fileName = file.name;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        this._file = JSON.parse(evt.target.result);
      } catch {
        this._error = 'El archivo no es un JSON válido.';
        this._file = null;
      }
    };
    reader.readAsText(file);
  }

  _triggerFileInput() {
    this.shadowRoot.querySelector('#file-input').click();
  }

  _validateForm() {
    if (!this._name.trim()) {
      return 'El nombre de la conexión es obligatorio.';
    }
    if (!this._file) {
      return 'Debes seleccionar un archivo serviceAccountKey.json.';
    }
    if (this._file.type !== 'service_account') {
      return 'El campo "type" debe ser "service_account".';
    }
    const missing = REQUIRED_SA_FIELDS.filter((f) => !this._file[f]);
    if (missing.length > 0) {
      return `Faltan campos obligatorios: ${missing.join(', ')}`;
    }
    return null;
  }

  async _onSubmit(e) {
    e.preventDefault();

    const validationError = this._validateForm();
    if (validationError) {
      this._error = validationError;
      return;
    }

    this._loading = true;
    this._error = '';

    try {
      const functions = getFunctions(app);
      const storeCredentials = httpsCallable(functions, 'storeCredentials');
      await storeCredentials({
        connectionName: this._name.trim(),
        serviceAccountKey: this._file,
      });

      this._success = true;
      this.dispatchEvent(new CustomEvent('connection-created'));

      setTimeout(() => this._close(), 1500);
    } catch (err) {
      this._error = err.message ?? 'Error al crear la conexión.';
    } finally {
      this._loading = false;
    }
  }

  render() {
    if (!this.open) return html``;

    return html`
      <div class="backdrop" @click=${this._close}>
        <div class="dialog" @click=${(e) => e.stopPropagation()}>
          <h2>Nueva conexión Firestore</h2>

          ${this._success
            ? html`<div class="success-message" role="alert">Conexión creada correctamente.</div>`
            : ''}

          ${this._error
            ? html`<div class="error-message" role="alert">${this._error}</div>`
            : ''}

          <form @submit=${this._onSubmit}>
            <div class="field">
              <label for="conn-name">Nombre de la conexión</label>
              <input
                id="conn-name"
                type="text"
                .value=${this._name}
                @input=${(e) => {
                  this._name = e.target.value;
                  this._error = '';
                }}
                placeholder="Ej: Producción, Staging..."
                ?disabled=${this._loading || this._success}
              />
            </div>

            <div class="field">
              <label>Service Account Key</label>
              <div
                class="file-upload ${this._fileName ? 'has-file' : ''}"
                @click=${this._triggerFileInput}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".json"
                  @change=${this._onFileChange}
                  ?disabled=${this._loading || this._success}
                />
                ${this._fileName
                  ? html`<span class="file-name">${this._fileName}</span>`
                  : html`<span class="file-upload-text"
                      >Haz clic para seleccionar serviceAccountKey.json</span
                    >`}
              </div>
            </div>

            <div class="actions">
              <button type="button" @click=${this._close} ?disabled=${this._loading}>
                Cancelar
              </button>
              <button
                type="submit"
                class="primary"
                ?disabled=${this._loading || this._success}
              >
                ${this._loading ? html`<span class="spinner"></span>` : ''}
                ${this._loading ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }
}

customElements.define('fma-connection-dialog', FmaConnectionDialog);
