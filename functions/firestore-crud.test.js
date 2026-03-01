import { describe, it, expect, vi } from 'vitest';

// Mock connection-utils
vi.mock('./connection-utils.js', () => ({
  requireAuth: vi.fn(),
  requireParam: vi.fn(),
  getConnection: vi.fn().mockResolvedValue({
    encryptedCredentials: 'encrypted',
    createdBy: 'user-123',
  }),
  getRemoteDb: vi.fn().mockResolvedValue({
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        set: vi.fn().mockResolvedValue(undefined),
        id: 'custom-id',
        path: 'test-collection/custom-id',
      })),
      add: vi.fn().mockResolvedValue({
        id: 'auto-id',
        path: 'test-collection/auto-id',
      }),
    })),
    doc: vi.fn(() => ({
      get: vi.fn().mockResolvedValue({
        exists: true,
        id: 'doc1',
        data: () => ({ name: 'Test' }),
      }),
      update: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    })),
  }),
}));

describe('firestore-crud', () => {
  it('exports createDocument function', async () => {
    const { createDocument } = await import('./firestore-crud.js');
    expect(createDocument).toBeDefined();
  });

  it('exports updateDocument function', async () => {
    const { updateDocument } = await import('./firestore-crud.js');
    expect(updateDocument).toBeDefined();
  });

  it('exports deleteDocument function', async () => {
    const { deleteDocument } = await import('./firestore-crud.js');
    expect(deleteDocument).toBeDefined();
  });
});
