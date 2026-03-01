import { html, fixture, expect } from '@open-wc/testing';
import '../src/components/document-editor.js';

describe('FmaDocumentEditor', () => {
  describe('when closed', () => {
    it('renders nothing', async () => {
      const el = await fixture(html`<fma-document-editor></fma-document-editor>`);
      const backdrop = el.shadowRoot.querySelector('.backdrop');
      expect(backdrop).to.not.exist;
    });
  });

  describe('create mode', () => {
    it('renders create dialog with title', async () => {
      const el = await fixture(html`<fma-document-editor open mode="create"></fma-document-editor>`);
      const h2 = el.shadowRoot.querySelector('h2');
      expect(h2.textContent).to.equal('Nuevo documento');
    });

    it('has document ID input', async () => {
      const el = await fixture(html`<fma-document-editor open mode="create"></fma-document-editor>`);
      const inputs = el.shadowRoot.querySelectorAll('input[type="text"]');
      expect(inputs.length).to.be.greaterThan(0);
    });

    it('has add field button', async () => {
      const el = await fixture(html`<fma-document-editor open mode="create"></fma-document-editor>`);
      const addBtn = el.shadowRoot.querySelector('.btn-add');
      expect(addBtn).to.exist;
      expect(addBtn.textContent).to.include('Añadir campo');
    });

    it('adds a new field row on add button click', async () => {
      const el = await fixture(html`<fma-document-editor open mode="create"></fma-document-editor>`);
      const initialFields = el.shadowRoot.querySelectorAll('.field-entry');
      const count = initialFields.length;

      el._addField();
      await el.updateComplete;

      const afterFields = el.shadowRoot.querySelectorAll('.field-entry');
      expect(afterFields.length).to.equal(count + 1);
    });

    it('removes a field row on remove click', async () => {
      const el = await fixture(html`<fma-document-editor open mode="create"></fma-document-editor>`);
      el._fields = [
        { key: 'name', type: 'string', value: 'test' },
        { key: 'age', type: 'number', value: '25' },
      ];
      await el.updateComplete;

      el._removeField(0);
      await el.updateComplete;

      const fields = el.shadowRoot.querySelectorAll('.field-entry');
      expect(fields.length).to.equal(1);
    });

    it('shows error when no fields have keys', async () => {
      const el = await fixture(html`<fma-document-editor open mode="create"></fma-document-editor>`);
      el._fields = [{ key: '', type: 'string', value: '' }];
      await el.updateComplete;

      const form = el.shadowRoot.querySelector('form');
      form.dispatchEvent(new Event('submit', { cancelable: true }));
      await el.updateComplete;

      const error = el.shadowRoot.querySelector('.error-message');
      expect(error).to.exist;
      expect(error.textContent).to.include('al menos un campo');
    });

    it('shows error for duplicate field keys', async () => {
      const el = await fixture(html`<fma-document-editor open mode="create"></fma-document-editor>`);
      el._fields = [
        { key: 'name', type: 'string', value: 'a' },
        { key: 'name', type: 'string', value: 'b' },
      ];
      await el.updateComplete;

      const form = el.shadowRoot.querySelector('form');
      form.dispatchEvent(new Event('submit', { cancelable: true }));
      await el.updateComplete;

      const error = el.shadowRoot.querySelector('.error-message');
      expect(error).to.exist;
      expect(error.textContent).to.include('únicos');
    });

    it('dispatches editor-save with correct data', async () => {
      const el = await fixture(html`<fma-document-editor open mode="create"></fma-document-editor>`);
      el._docId = 'my-doc';
      el._fields = [
        { key: 'name', type: 'string', value: 'Alice' },
        { key: 'age', type: 'number', value: '30' },
      ];
      await el.updateComplete;

      let savedData = null;
      el.addEventListener('editor-save', (e) => {
        savedData = e.detail;
      });

      const form = el.shadowRoot.querySelector('form');
      form.dispatchEvent(new Event('submit', { cancelable: true }));

      expect(savedData).to.not.be.null;
      expect(savedData.mode).to.equal('create');
      expect(savedData.documentId).to.equal('my-doc');
      expect(savedData.data.name).to.equal('Alice');
      expect(savedData.data.age).to.equal(30);
    });

    it('dispatches editor-close on cancel', async () => {
      const el = await fixture(html`<fma-document-editor open mode="create"></fma-document-editor>`);
      let closed = false;
      el.addEventListener('editor-close', () => {
        closed = true;
      });

      const cancelBtn = el.shadowRoot.querySelector('button[type="button"]:not(.btn-add):not(.btn-remove)');
      cancelBtn.click();
      expect(closed).to.be.true;
    });
  });

  describe('edit mode', () => {
    it('renders edit dialog with title', async () => {
      const el = await fixture(html`<fma-document-editor open mode="edit"></fma-document-editor>`);
      const h2 = el.shadowRoot.querySelector('h2');
      expect(h2.textContent).to.equal('Editar documento');
    });

    it('does not show document ID input in edit mode', async () => {
      const el = await fixture(html`<fma-document-editor open mode="edit"></fma-document-editor>`);
      const labels = Array.from(el.shadowRoot.querySelectorAll('label'));
      const idLabel = labels.find((l) => l.textContent.includes('ID del documento'));
      expect(idLabel).to.not.exist;
    });
  });

  describe('field types', () => {
    it('renders boolean as select', async () => {
      const el = await fixture(html`<fma-document-editor open mode="create"></fma-document-editor>`);
      el._fields = [{ key: 'active', type: 'boolean', value: 'true' }];
      await el.updateComplete;

      const selects = el.shadowRoot.querySelectorAll('.field-entry select');
      // One for type, one for boolean value
      expect(selects.length).to.equal(2);
    });

    it('renders null as disabled input', async () => {
      const el = await fixture(html`<fma-document-editor open mode="create"></fma-document-editor>`);
      el._fields = [{ key: 'deleted', type: 'null', value: '' }];
      await el.updateComplete;

      const disabledInputs = el.shadowRoot.querySelectorAll('.field-entry input[disabled]');
      expect(disabledInputs.length).to.be.greaterThan(0);
    });

    it('renders map as textarea', async () => {
      const el = await fixture(html`<fma-document-editor open mode="create"></fma-document-editor>`);
      el._fields = [{ key: 'meta', type: 'map', value: '{}' }];
      await el.updateComplete;

      const textarea = el.shadowRoot.querySelector('.field-entry textarea');
      expect(textarea).to.exist;
    });
  });
});
