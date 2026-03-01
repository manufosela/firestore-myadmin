import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebase.js';

const functions = getFunctions(app);

const listCollectionsFn = httpsCallable(functions, 'listCollections');
const listDocumentsFn = httpsCallable(functions, 'listDocuments');
const getDocumentFn = httpsCallable(functions, 'getDocument');

export const firestoreApi = {
  async listCollections(connectionId) {
    const result = await listCollectionsFn({ connectionId });
    return result.data.collections;
  },

  async listDocuments(connectionId, collectionPath, { limit = 25, startAfter } = {}) {
    const result = await listDocumentsFn({ connectionId, collectionPath, limit, startAfter });
    return result.data;
  },

  async getDocument(connectionId, documentPath) {
    const result = await getDocumentFn({ connectionId, documentPath });
    return result.data;
  },
};
