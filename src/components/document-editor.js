import { LitElement, html, css } from 'lit';

export class FmaDocumentEditor extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    mode: { type: String }, // 'create' | 'edit'
    documentId: { type: String },
    fields: { type: Array },
    _docId: { type: String, state: true },
    _fields: { type: Array, state: true },
    _error: { type: String, state: true },
    _loading: { type: Boolean, state: true },
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
      align-items: flex-start;
      justify-content: center;
      padding-top: 5vh;
      overflow-y: auto;
    }

    .dialog {
      background: var(--fma-surface, #fff);
      border-radius: var(--fma-radius-lg, 8px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      padding: var(--fma-space-xl, 2rem);
      width: 100%;
      max-width: 600px;
      margin: var(--fma-space-md, 1rem);
      max-height: 85vh;
      overflow-y: auto;
    }

    h2 {
      margin: 0 0 var(--fma-space-lg, 1.5rem);
      color: var(--fma-text, #202124);
      font-size: var(--fma-font-size-lg, 1.25rem);
    }

    .field-group {
      margin-bottom: var(--fma-space-md, 1rem);
    }

    label {
      display: block;
      font-size: var(--fma-font-size-sm, 0.875rem);
      color: var(--fma-text, #202124);
      margin-bottom: var(--fma-space-xs, 0.25rem);
      font-weight: 500;
    }

    input,
    textarea,
    select {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--fma-border, #dadce0);
      border-radius: var(--fma-radius, 4px);
      font-size: var(--fma-font-size-base, 1rem);
      font-family: inherit;
      color: var(--fma-text, #202124);
      box-sizing: border-box;
    }

    input:focus,
    textarea:focus,
    select:focus {
      outline: none;
      border-color: var(--fma-primary, #1a73e8);
      box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
    }

    textarea {
      min-height: 80px;
      resize: vertical;
    }

    .field-entry {
      display: grid;
      grid-template-columns: 1fr 100px 2fr auto;
      gap: var(--fma-space-xs, 0.25rem);
      align-items: start;
      margin-bottom: var(--fma-space-sm, 0.5rem);
      padding: var(--fma-space-sm, 0.5rem);
      background: var(--fma-bg, #f8f9fa);
      border-radius: var(--fma-radius, 4px);
    }

    .field-entry input,
    .field-entry select,
    .field-entry textarea {
      font-size: var(--fma-font-size-sm, 0.875rem);
      padding: 0.375rem 0.5rem;
    }

    .btn-remove {
      background: none;
      border: none;
      color: var(--fma-error, #d93025);
      cursor: pointer;
      font-size: 1.2rem;
      padding: 0.375rem;
      line-height: 1;
    }

    .btn-add {
      display: inline-flex;
      align-items: center;
      gap: var(--fma-space-xs, 0.25rem);
      padding: var(--fma-space-xs, 0.25rem) var(--fma-space-sm, 0.5rem);
      border: 1px dashed var(--fma-border, #dadce0);
      border-radius: var(--fma-radius, 4px);
      background: transparent;
      cursor: pointer;
      color: var(--fma-primary, #1a73e8);
      font-size: var(--fma-font-size-sm, 0.875rem);
      margin-bottom: var(--fma-space-md, 1rem);
    }

    .btn-add:hover {
      background: rgba(26, 115, 232, 0.05);
    }

    .error-message {
      background: #fce8e6;
      color: var(--fma-error, #d93025);
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
  `;

  constructor() {
    super();
    this.open = false;
    this.mode = 'create';
    this.documentId = '';
    this.fields = [];
    this._docId = '';
    this._fields = [];
    this._error = '';
    this._loading = false;
  }

  updated(changed) {
    if (changed.has('open') && this.open) {
      this._docId = this.documentId ?? '';
      this._fields =
        this.fields?.length > 0
          ? this.fields.map((f) => ({ ...f }))
          : [{ key: '', type: 'string', value: '' }];
      this._error = '';
      this._loading = false;
    }
  }

  _close() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('editor-close'));
  }

  _addField() {
    this._fields = [...this._fields, { key: '', type: 'string', value: '' }];
  }

  _removeField(index) {
    this._fields = this._fields.filter((_, i) => i !== index);
  }

  _updateField(index, prop, value) {
    this._fields = this._fields.map((f, i) => (i === index ? { ...f, [prop]: value } : f));
  }

  _buildData() {
    const data = {};
    for (const field of this._fields) {
      if (!field.key.trim()) continue;
      data[field.key.trim()] = this._parseValue(field.type, field.value);
    }
    return data;
  }

  _parseValue(type, value) {
    switch (type) {
      case 'number':
        return Number(value);
      case 'boolean':
        return value === 'true';
      case 'null':
        return null;
      case 'array':
      case 'map':
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      default:
        return value;
    }
  }

  _validate() {
    const keys = this._fields.filter((f) => f.key.trim()).map((f) => f.key.trim());
    if (keys.length === 0) {
      return 'El documento debe tener al menos un campo.';
    }
    const unique = new Set(keys);
    if (unique.size !== keys.length) {
      return 'Los nombres de campo deben ser únicos.';
    }
    return null;
  }

  _onSubmit(e) {
    e.preventDefault();
    const validationError = this._validate();
    if (validationError) {
      this._error = validationError;
      return;
    }

    this._error = '';
    const data = this._buildData();
    this.dispatchEvent(
      new CustomEvent('editor-save', {
        detail: {
          mode: this.mode,
          documentId: this._docId.trim() || undefined,
          data,
        },
      }),
    );
  }

  _renderFieldEntry(field, index) {
    return html`
      <div class="field-entry">
        <input
          placeholder="Campo"
          .value=${field.key}
          @input=${(e) => this._updateField(index, 'key', e.target.value)}
          ?disabled=${this._loading}
        />
        <select .value=${field.type} @change=${(e) => this._updateField(index, 'type', e.target.value)}>
          <option value="string">string</option>
          <option value="number">number</option>
          <option value="boolean">boolean</option>
          <option value="null">null</option>
          <option value="map">map</option>
          <option value="array">array</option>
        </select>
        ${field.type === 'boolean'
          ? html`
              <select .value=${field.value} @change=${(e) => this._updateField(index, 'value', e.target.value)}>
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            `
          : field.type === 'null'
            ? html`<input value="null" disabled />`
            : field.type === 'map' || field.type === 'array'
              ? html`
                  <textarea
                    placeholder="${field.type === 'map' ? '{"key": "value"}' : '[1, 2, 3]'}"
                    .value=${field.value}
                    @input=${(e) => this._updateField(index, 'value', e.target.value)}
                    ?disabled=${this._loading}
                  ></textarea>
                `
              : html`
                  <input
                    placeholder="Valor"
                    .value=${field.value}
                    @input=${(e) => this._updateField(index, 'value', e.target.value)}
                    ?disabled=${this._loading}
                  />
                `}
        <button class="btn-remove" @click=${() => this._removeField(index)} ?disabled=${this._loading}>
          &times;
        </button>
      </div>
    `;
  }

  render() {
    if (!this.open) return html``;

    const title = this.mode === 'create' ? 'Nuevo documento' : 'Editar documento';
    const submitLabel = this.mode === 'create' ? 'Crear' : 'Guardar';

    return html`
      <div class="backdrop" @click=${this._close}>
        <div class="dialog" @click=${(e) => e.stopPropagation()}>
          <h2>${title}</h2>

          ${this._error ? html`<div class="error-message" role="alert">${this._error}</div>` : ''}

          <form @submit=${this._onSubmit}>
            ${this.mode === 'create'
              ? html`
                  <div class="field-group">
                    <label>ID del documento (vacío = autogenerado)</label>
                    <input
                      type="text"
                      .value=${this._docId}
                      @input=${(e) => (this._docId = e.target.value)}
                      placeholder="(autogenerado)"
                      ?disabled=${this._loading}
                    />
                  </div>
                `
              : ''}

            <label>Campos</label>
            ${this._fields.map((f, i) => this._renderFieldEntry(f, i))}

            <button type="button" class="btn-add" @click=${this._addField} ?disabled=${this._loading}>
              + Añadir campo
            </button>

            <div class="actions">
              <button type="button" @click=${this._close} ?disabled=${this._loading}>Cancelar</button>
              <button type="submit" class="primary" ?disabled=${this._loading}>${submitLabel}</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }
}

customElements.define('fma-document-editor', FmaDocumentEditor);
