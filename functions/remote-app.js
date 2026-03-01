import { initializeApp, getApp, deleteApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const remoteApps = new Map();

/**
 * Get or create a Firebase Admin app for a remote project.
 * @param {string} connectionId - Unique connection identifier
 * @param {object} credentials - Parsed serviceAccountKey object
 * @returns {import('firebase-admin/firestore').Firestore}
 */
export function getRemoteFirestore(connectionId, credentials) {
  const appName = `remote-${connectionId}`;

  if (remoteApps.has(appName)) {
    try {
      const app = getApp(appName);
      return getFirestore(app);
    } catch {
      remoteApps.delete(appName);
    }
  }

  const app = initializeApp({ credential: cert(credentials) }, appName);
  remoteApps.set(appName, app);
  return getFirestore(app);
}

/**
 * Cleanup a remote app instance.
 * @param {string} connectionId
 */
export async function cleanupRemoteApp(connectionId) {
  const appName = `remote-${connectionId}`;
  if (remoteApps.has(appName)) {
    try {
      const app = getApp(appName);
      await deleteApp(app);
    } catch {
      // App already deleted
    }
    remoteApps.delete(appName);
  }
}
