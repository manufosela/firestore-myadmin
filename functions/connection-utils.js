import { HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { decrypt } from './kms-service.js';
import { getRemoteFirestore } from './remote-app.js';

/**
 * Get the connection document and verify the user has access.
 * @param {string} connectionId
 * @param {string} uid - Authenticated user's UID
 * @returns {Promise<object>} Connection data
 */
export async function getConnection(connectionId, uid) {
  const db = getFirestore();
  const doc = await db.collection('connections').doc(connectionId).get();

  if (!doc.exists) {
    throw new HttpsError('not-found', 'Conexión no encontrada.');
  }

  const connection = doc.data();

  if (connection.createdBy !== uid) {
    throw new HttpsError('permission-denied', 'No tienes acceso a esta conexión.');
  }

  return connection;
}

/**
 * Initialize a remote Firestore instance from encrypted credentials.
 * @param {string} connectionId
 * @param {object} connection - Connection document data
 * @returns {Promise<import('firebase-admin/firestore').Firestore>}
 */
export async function getRemoteDb(connectionId, connection) {
  let credentials;
  try {
    const decrypted = await decrypt(connection.encryptedCredentials);
    credentials = JSON.parse(decrypted);
  } catch {
    throw new HttpsError(
      'internal',
      'Error al desencriptar las credenciales. La conexión puede estar corrupta.',
    );
  }

  try {
    return getRemoteFirestore(connectionId, credentials);
  } catch {
    throw new HttpsError(
      'internal',
      'Error al conectar con el Firestore remoto. Verifica las credenciales.',
    );
  }
}

/**
 * Validate authentication.
 * @param {object} request - Cloud Function request
 */
export function requireAuth(request) {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Debes iniciar sesión.');
  }
}

/**
 * Validate a required string parameter.
 * @param {*} value
 * @param {string} name
 */
export function requireParam(value, name) {
  if (!value || typeof value !== 'string') {
    throw new HttpsError('invalid-argument', `${name} es obligatorio.`);
  }
}
