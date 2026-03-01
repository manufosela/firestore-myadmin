import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getConnection, getRemoteDb, requireAuth, requireParam, requireRole } from './connection-utils.js';

/**
 * Create a document in a remote Firestore collection.
 */
export const createDocument = onCall(async (request) => {
  requireAuth(request);

  const { connectionId, collectionPath, data, documentId } = request.data;
  requireParam(connectionId, 'connectionId');
  requireParam(collectionPath, 'collectionPath');

  if (!data || typeof data !== 'object') {
    throw new HttpsError('invalid-argument', 'data debe ser un objeto con los campos del documento.');
  }

  const connection = await getConnection(connectionId, request.auth.uid);
  requireRole(connection, 'editor');
  const remoteDb = await getRemoteDb(connectionId, connection);

  let docRef;
  if (documentId) {
    docRef = remoteDb.collection(collectionPath).doc(documentId);
    await docRef.set(data);
  } else {
    docRef = await remoteDb.collection(collectionPath).add(data);
  }

  return {
    id: docRef.id,
    path: docRef.path,
    message: 'Documento creado correctamente.',
  };
});

/**
 * Update a document in a remote Firestore.
 */
export const updateDocument = onCall(async (request) => {
  requireAuth(request);

  const { connectionId, documentPath, data } = request.data;
  requireParam(connectionId, 'connectionId');
  requireParam(documentPath, 'documentPath');

  if (!data || typeof data !== 'object') {
    throw new HttpsError('invalid-argument', 'data debe ser un objeto con los campos a actualizar.');
  }

  const connection = await getConnection(connectionId, request.auth.uid);
  requireRole(connection, 'editor');
  const remoteDb = await getRemoteDb(connectionId, connection);

  const docRef = remoteDb.doc(documentPath);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new HttpsError('not-found', 'Documento no encontrado.');
  }

  await docRef.update(data);

  return {
    id: doc.id,
    path: documentPath,
    message: 'Documento actualizado correctamente.',
  };
});

/**
 * Delete a document from a remote Firestore.
 */
export const deleteDocument = onCall(async (request) => {
  requireAuth(request);

  const { connectionId, documentPath } = request.data;
  requireParam(connectionId, 'connectionId');
  requireParam(documentPath, 'documentPath');

  const connection = await getConnection(connectionId, request.auth.uid);
  requireRole(connection, 'editor');
  const remoteDb = await getRemoteDb(connectionId, connection);

  const docRef = remoteDb.doc(documentPath);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new HttpsError('not-found', 'Documento no encontrado.');
  }

  await docRef.delete();

  return {
    path: documentPath,
    message: 'Documento eliminado correctamente.',
  };
});
