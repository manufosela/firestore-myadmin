import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { decrypt } from './kms-service.js';
import { getRemoteFirestore } from './remote-app.js';

/**
 * Get the connection document and verify the user has access.
 * @param {string} connectionId
 * @param {string} uid - Authenticated user's UID
 * @returns {Promise<object>} Connection data
 */
async function getConnection(connectionId, uid) {
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
async function getRemoteDb(connectionId, connection) {
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
 * Serialize Firestore field values to JSON-safe types.
 */
function serializeValue(value) {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return { _type: 'timestamp', value: value.toISOString() };
  if (value.toDate) return { _type: 'timestamp', value: value.toDate().toISOString() };
  if (value._path) return { _type: 'reference', value: value.path };
  if (Array.isArray(value)) return value.map(serializeValue);
  if (typeof value === 'object') {
    const result = {};
    for (const [k, v] of Object.entries(value)) {
      result[k] = serializeValue(v);
    }
    return result;
  }
  return value;
}

/**
 * List top-level collections of a remote Firestore.
 */
export const listCollections = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Debes iniciar sesión.');
  }

  const { connectionId } = request.data;
  if (!connectionId) {
    throw new HttpsError('invalid-argument', 'connectionId es obligatorio.');
  }

  const connection = await getConnection(connectionId, request.auth.uid);
  const remoteDb = await getRemoteDb(connectionId, connection);

  const collections = await remoteDb.listCollections();
  return {
    collections: collections.map((col) => ({
      id: col.id,
      path: col.path,
    })),
  };
});

/**
 * List documents in a collection of a remote Firestore.
 */
export const listDocuments = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Debes iniciar sesión.');
  }

  const { connectionId, collectionPath, limit = 25, startAfter } = request.data;

  if (!connectionId) {
    throw new HttpsError('invalid-argument', 'connectionId es obligatorio.');
  }
  if (!collectionPath) {
    throw new HttpsError('invalid-argument', 'collectionPath es obligatorio.');
  }

  const connection = await getConnection(connectionId, request.auth.uid);
  const remoteDb = await getRemoteDb(connectionId, connection);

  let query = remoteDb.collection(collectionPath).orderBy('__name__').limit(limit);

  if (startAfter) {
    const startDoc = await remoteDb.collection(collectionPath).doc(startAfter).get();
    if (startDoc.exists) {
      query = query.startAfter(startDoc);
    }
  }

  const snapshot = await query.get();

  return {
    documents: snapshot.docs.map((doc) => ({
      id: doc.id,
      path: doc.ref.path,
      data: serializeValue(doc.data()),
    })),
    hasMore: snapshot.docs.length === limit,
  };
});

/**
 * Get a single document from a remote Firestore.
 */
export const getDocument = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Debes iniciar sesión.');
  }

  const { connectionId, documentPath } = request.data;

  if (!connectionId) {
    throw new HttpsError('invalid-argument', 'connectionId es obligatorio.');
  }
  if (!documentPath) {
    throw new HttpsError('invalid-argument', 'documentPath es obligatorio.');
  }

  const connection = await getConnection(connectionId, request.auth.uid);
  const remoteDb = await getRemoteDb(connectionId, connection);

  const doc = await remoteDb.doc(documentPath).get();

  if (!doc.exists) {
    throw new HttpsError('not-found', 'Documento no encontrado.');
  }

  const subcollections = await doc.ref.listCollections();

  return {
    id: doc.id,
    path: doc.ref.path,
    data: serializeValue(doc.data()),
    subcollections: subcollections.map((col) => ({
      id: col.id,
      path: col.path,
    })),
  };
});
