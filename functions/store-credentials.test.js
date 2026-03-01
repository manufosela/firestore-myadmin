import { describe, it, expect } from 'vitest';
import { validateServiceAccountKey } from './store-credentials.js';

const validKey = {
  type: 'service_account',
  project_id: 'test-project',
  private_key_id: 'key123',
  private_key: '-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----\n',
  client_email: 'test@test-project.iam.gserviceaccount.com',
  client_id: '123456789',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
};

describe('validateServiceAccountKey', () => {
  it('returns null for a valid serviceAccountKey', () => {
    expect(validateServiceAccountKey(validKey)).to.be.null;
  });

  it('rejects null input', () => {
    const error = validateServiceAccountKey(null);
    expect(error).to.equal('El archivo debe ser un objeto JSON válido.');
  });

  it('rejects non-object input', () => {
    const error = validateServiceAccountKey('not-an-object');
    expect(error).to.equal('El archivo debe ser un objeto JSON válido.');
  });

  it('rejects wrong type field', () => {
    const error = validateServiceAccountKey({ ...validKey, type: 'user' });
    expect(error).to.equal('El campo "type" debe ser "service_account".');
  });

  it('reports missing required fields', () => {
    const { private_key, client_email, ...incomplete } = validKey;
    const error = validateServiceAccountKey(incomplete);
    expect(error).to.include('private_key');
    expect(error).to.include('client_email');
  });

  it('accepts key with extra fields', () => {
    const extended = { ...validKey, extra_field: 'value' };
    expect(validateServiceAccountKey(extended)).to.be.null;
  });
});
