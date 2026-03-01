import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';

initializeApp();

export const helloWorld = onRequest((req, res) => {
  res.json({ status: 'ok', message: 'Firestore MyAdmin Functions running' });
});

export { storeCredentials } from './store-credentials.js';
export { listCollections, listDocuments, getDocument } from './firestore-proxy.js';
