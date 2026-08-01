import { describe, it, expect, afterEach, vi } from 'vitest';

vi.mock('./connection-utils.js', () => ({
  requireAuth: vi.fn(),
  requireParam: vi.fn(),
}));

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(),
}));

vi.mock('firebase-functions/v2/https', () => ({
  onCall: (handler) => handler,
  HttpsError: class HttpsError extends Error {
    constructor(code, message) {
      super(message);
      this.code = code;
    }
  },
}));

const ORIGINAL = process.env.SUPERADMIN_EMAIL;

/** Re-imports the module so the module-level env read is re-evaluated. */
async function loadWith(superadminEmail) {
  if (superadminEmail === undefined) {
    delete process.env.SUPERADMIN_EMAIL;
  } else {
    process.env.SUPERADMIN_EMAIL = superadminEmail;
  }
  vi.resetModules();
  return import('./user-access.js');
}

afterEach(() => {
  if (ORIGINAL === undefined) {
    delete process.env.SUPERADMIN_EMAIL;
  } else {
    process.env.SUPERADMIN_EMAIL = ORIGINAL;
  }
  vi.resetModules();
});

describe('isSuperadminEmail', () => {
  it('matches the configured superadmin', async () => {
    const { isSuperadminEmail } = await loadWith('admin@example.com');
    expect(isSuperadminEmail('admin@example.com')).toBe(true);
  });

  it('rejects any other address', async () => {
    const { isSuperadminEmail } = await loadWith('admin@example.com');
    expect(isSuperadminEmail('someone@example.com')).toBe(false);
  });

  // Guards the dangerous case: with the env var unset, a token carrying no
  // email must never be treated as the superadmin.
  it('rejects an empty email instead of matching an unset value', async () => {
    const { isSuperadminEmail } = await loadWith('admin@example.com');
    expect(isSuperadminEmail(undefined)).toBe(false);
    expect(isSuperadminEmail('')).toBe(false);
  });

  it('fails loudly when SUPERADMIN_EMAIL is not configured', async () => {
    const { isSuperadminEmail } = await loadWith(undefined);
    expect(() => isSuperadminEmail('admin@example.com')).toThrow(
      /SUPERADMIN_EMAIL is not configured/
    );
  });

  it('does not silently grant access when the config is missing', async () => {
    const { isSuperadminEmail } = await loadWith(undefined);
    expect(() => isSuperadminEmail(undefined)).toThrow();
  });
});
