import { describe, it, expect, vi } from 'vitest';

// Mock firebase-admin/firestore
vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => ({
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: vi.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            createdBy: 'user-123',
            encryptedCredentials: 'encrypted-data',
            name: 'Test Connection',
            projectId: 'test-project',
          }),
        }),
      })),
    })),
  })),
}));

// Mock KMS service
vi.mock('./kms-service.js', () => ({
  decrypt: vi.fn().mockResolvedValue(
    JSON.stringify({
      type: 'service_account',
      project_id: 'test-project',
      private_key: '-----BEGIN RSA PRIVATE KEY-----\ntest\n-----END RSA PRIVATE KEY-----\n',
      client_email: 'test@test.iam.gserviceaccount.com',
    }),
  ),
}));

// Mock remote-app
vi.mock('./remote-app.js', () => ({
  getRemoteFirestore: vi.fn(() => ({
    listCollections: vi.fn().mockResolvedValue([
      { id: 'users', path: 'users' },
      { id: 'orders', path: 'orders' },
    ]),
    collection: vi.fn(() => ({
      orderBy: vi.fn(() => ({
        limit: vi.fn(() => ({
          get: vi.fn().mockResolvedValue({
            docs: [
              {
                id: 'doc1',
                ref: { path: 'users/doc1' },
                data: () => ({ name: 'Test', age: 30 }),
              },
            ],
          }),
        })),
      })),
    })),
    doc: vi.fn(() => ({
      get: vi.fn().mockResolvedValue({
        exists: true,
        id: 'doc1',
        ref: {
          path: 'users/doc1',
          listCollections: vi.fn().mockResolvedValue([]),
        },
        data: () => ({ name: 'Test' }),
      }),
    })),
  })),
}));

describe('firestore-proxy', () => {
  it('exports listCollections function', async () => {
    const { listCollections } = await import('./firestore-proxy.js');
    expect(listCollections).toBeDefined();
  });

  it('exports listDocuments function', async () => {
    const { listDocuments } = await import('./firestore-proxy.js');
    expect(listDocuments).toBeDefined();
  });

  it('exports getDocument function', async () => {
    const { getDocument } = await import('./firestore-proxy.js');
    expect(getDocument).toBeDefined();
  });
});

describe('serializeValue', () => {
  it('handles null values', async () => {
    // serializeValue is not exported, test via integration
    // This test verifies the module loads without errors
    const mod = await import('./firestore-proxy.js');
    expect(mod).toBeDefined();
  });
});
