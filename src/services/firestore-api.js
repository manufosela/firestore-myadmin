import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebase.js';

const functions = getFunctions(app);

const listCollectionsFn = httpsCallable(functions, 'listCollections');
const listDocumentsFn = httpsCallable(functions, 'listDocuments');
const getDocumentFn = httpsCallable(functions, 'getDocument');
const createDocumentFn = httpsCallable(functions, 'createDocument');
const updateDocumentFn = httpsCallable(functions, 'updateDocument');
const deleteDocumentFn = httpsCallable(functions, 'deleteDocument');

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

  async createDocument(connectionId, collectionPath, data, documentId) {
    const result = await createDocumentFn({ connectionId, collectionPath, data, documentId });
    return result.data;
  },

  async updateDocument(connectionId, documentPath, data) {
    const result = await updateDocumentFn({ connectionId, documentPath, data });
    return result.data;
  },

  async deleteDocument(connectionId, documentPath) {
    const result = await deleteDocumentFn({ connectionId, documentPath });
    return result.data;
  },
};
