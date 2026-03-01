import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getConnection, getRemoteDb, requireAuth, requireParam } from './connection-utils.js';

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
  requireAuth(request);

  const { connectionId } = request.data;
  requireParam(connectionId, 'connectionId');

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
  requireAuth(request);

  const { connectionId, collectionPath, limit = 25, startAfter } = request.data;
  requireParam(connectionId, 'connectionId');
  requireParam(collectionPath, 'collectionPath');

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
  requireAuth(request);

  const { connectionId, documentPath } = request.data;
  requireParam(connectionId, 'connectionId');
  requireParam(documentPath, 'documentPath');

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
