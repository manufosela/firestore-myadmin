import { HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { decrypt } from './kms-service.js';
import { getRemoteFirestore } from './remote-app.js';

/**
 * Get the user's role for a connection.
 * @param {string} connectionId
 * @param {string} uid
 * @returns {Promise<string|null>} Role: 'admin' | 'editor' | 'viewer' | null
 */
export async function getUserRole(connectionId, uid) {
  const db = getFirestore();
  const permDoc = await db.collection('permissions').doc(`${connectionId}_${uid}`).get();
  if (permDoc.exists) {
    return permDoc.data().role;
  }
  // Fallback: check if user is the creator (legacy connections without permissions)
  const connDoc = await db.collection('connections').doc(connectionId).get();
  if (connDoc.exists && connDoc.data().createdBy === uid) {
    return 'admin';
  }
  return null;
}

/**
 * Get the connection document and verify the user has access.
 * @param {string} connectionId
 * @param {string} uid - Authenticated user's UID
 * @returns {Promise<object>} Connection data with role
 */
export async function getConnection(connectionId, uid) {
  const db = getFirestore();
  const doc = await db.collection('connections').doc(connectionId).get();

  if (!doc.exists) {
    throw new HttpsError('not-found', 'Conexión no encontrada.');
  }

  const connection = doc.data();
  const role = await getUserRole(connectionId, uid);

  if (!role) {
    throw new HttpsError('permission-denied', 'No tienes acceso a esta conexión.');
  }

  connection._role = role;
  return connection;
}

/**
 * Check that the user has at least the required role.
 * Role hierarchy: admin > editor > viewer
 * @param {object} connection - Connection data with _role
 * @param {string} requiredRole - 'viewer' | 'editor' | 'admin'
 */
export function requireRole(connection, requiredRole) {
  const hierarchy = { viewer: 1, editor: 2, admin: 3 };
  const userLevel = hierarchy[connection._role] ?? 0;
  const requiredLevel = hierarchy[requiredRole] ?? 0;

  if (userLevel < requiredLevel) {
    throw new HttpsError('permission-denied', `Se requiere rol "${requiredRole}" para esta operación.`);
  }
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
