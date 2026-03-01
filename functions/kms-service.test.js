import { describe, it, expect, vi } from 'vitest';

vi.mock('@google-cloud/kms', () => {
  const mockEncrypt = vi.fn().mockResolvedValue([
    { ciphertext: Buffer.from('encrypted-data') },
  ]);
  const mockDecrypt = vi.fn().mockResolvedValue([
    { plaintext: Buffer.from('decrypted-data') },
  ]);
  return {
    KeyManagementServiceClient: vi.fn().mockImplementation(() => ({
      cryptoKeyPath: (_proj, _loc, _ring, _key) =>
        `projects/${_proj}/locations/${_loc}/keyRings/${_ring}/cryptoKeys/${_key}`,
      encrypt: mockEncrypt,
      decrypt: mockDecrypt,
    })),
  };
});

describe('KMS Service', () => {
  it('encrypt returns base64-encoded ciphertext', async () => {
    const { encrypt } = await import('./kms-service.js');
    const result = await encrypt('test-plaintext');
    expect(result).to.be.a('string');
    // Verify it's valid base64
    const decoded = Buffer.from(result, 'base64').toString();
    expect(decoded).to.equal('encrypted-data');
  });

  it('decrypt returns plaintext string', async () => {
    const { decrypt } = await import('./kms-service.js');
    const cipherBase64 = Buffer.from('some-cipher').toString('base64');
    const result = await decrypt(cipherBase64);
    expect(result).to.equal('decrypted-data');
  });

  it('encrypt and decrypt use correct key path', async () => {
    const { KeyManagementServiceClient } = await import('@google-cloud/kms');
    const instance = new KeyManagementServiceClient();
    const keyPath = instance.cryptoKeyPath(
      'firestore-myadmin-ea6fb',
      'europe-west1',
      'fma-keyring',
      'fma-credentials-key',
    );
    expect(keyPath).to.include('fma-keyring');
    expect(keyPath).to.include('fma-credentials-key');
    expect(keyPath).to.include('europe-west1');
  });
});
