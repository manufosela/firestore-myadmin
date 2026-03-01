import { onRequest } from 'firebase-functions/v2/https';

export const helloWorld = onRequest((req, res) => {
  res.json({ status: 'ok', message: 'Firestore MyAdmin Functions running' });
});
