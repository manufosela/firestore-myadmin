import { html, fixture, expect } from '@open-wc/testing';
import '../src/components/connection-dialog.js';

describe('FmaConnectionDialog', () => {
  describe('when closed', () => {
    it('renders nothing when not open', async () => {
      const el = await fixture(html`<fma-connection-dialog></fma-connection-dialog>`);
      const backdrop = el.shadowRoot.querySelector('.backdrop');
      expect(backdrop).to.not.exist;
    });
  });

  describe('when open', () => {
    it('renders the dialog form', async () => {
      const el = await fixture(html`<fma-connection-dialog open></fma-connection-dialog>`);
      const form = el.shadowRoot.querySelector('form');
      expect(form).to.exist;
    });

    it('displays the title', async () => {
      const el = await fixture(html`<fma-connection-dialog open></fma-connection-dialog>`);
      const h2 = el.shadowRoot.querySelector('h2');
      expect(h2).to.exist;
      expect(h2.textContent).to.equal('Nueva conexión Firestore');
    });

    it('has a name input with label', async () => {
      const el = await fixture(html`<fma-connection-dialog open></fma-connection-dialog>`);
      const label = el.shadowRoot.querySelector('label[for="conn-name"]');
      const input = el.shadowRoot.querySelector('#conn-name');
      expect(label).to.exist;
      expect(input).to.exist;
    });

    it('has a file upload area', async () => {
      const el = await fixture(html`<fma-connection-dialog open></fma-connection-dialog>`);
      const fileUpload = el.shadowRoot.querySelector('.file-upload');
      expect(fileUpload).to.exist;
    });

    it('has cancel and save buttons', async () => {
      const el = await fixture(html`<fma-connection-dialog open></fma-connection-dialog>`);
      const buttons = el.shadowRoot.querySelectorAll('button');
      const texts = Array.from(buttons).map((b) => b.textContent.trim());
      expect(texts).to.include('Cancelar');
      expect(texts.some((t) => t.includes('Guardar'))).to.be.true;
    });

    it('shows error when name is empty on submit', async () => {
      const el = await fixture(html`<fma-connection-dialog open></fma-connection-dialog>`);
      const form = el.shadowRoot.querySelector('form');
      form.dispatchEvent(new Event('submit', { cancelable: true }));
      await el.updateComplete;

      const error = el.shadowRoot.querySelector('[role="alert"]');
      expect(error).to.exist;
      expect(error.textContent).to.equal('El nombre de la conexión es obligatorio.');
    });

    it('shows error when no file selected on submit', async () => {
      const el = await fixture(html`<fma-connection-dialog open></fma-connection-dialog>`);
      el._name = 'Test Connection';
      await el.updateComplete;

      const form = el.shadowRoot.querySelector('form');
      form.dispatchEvent(new Event('submit', { cancelable: true }));
      await el.updateComplete;

      const error = el.shadowRoot.querySelector('[role="alert"]');
      expect(error).to.exist;
      expect(error.textContent).to.equal('Debes seleccionar un archivo serviceAccountKey.json.');
    });

    it('dispatches dialog-close on cancel', async () => {
      const el = await fixture(html`<fma-connection-dialog open></fma-connection-dialog>`);
      let closed = false;
      el.addEventListener('dialog-close', () => {
        closed = true;
      });

      const cancelBtn = el.shadowRoot.querySelector('button[type="button"]');
      cancelBtn.click();
      expect(closed).to.be.true;
    });
  });
});
