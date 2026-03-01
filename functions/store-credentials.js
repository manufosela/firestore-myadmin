import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { encrypt } from './kms-service.js';

const REQUIRED_SA_FIELDS = [
  'type',
  'project_id',
  'private_key_id',
  'private_key',
  'client_email',
  'client_id',
  'auth_uri',
  'token_uri',
];

/**
 * Validate that the provided JSON has the structure of a Firebase serviceAccountKey.
 * @param {object} json
 * @returns {string|null} Error message or null if valid
 */
export function validateServiceAccountKey(json) {
  if (!json || typeof json !== 'object') {
    return 'El archivo debe ser un objeto JSON válido.';
  }
  if (json.type !== 'service_account') {
    return 'El campo "type" debe ser "service_account".';
  }
  const missing = REQUIRED_SA_FIELDS.filter((field) => !json[field]);
  if (missing.length > 0) {
    return `Faltan campos obligatorios: ${missing.join(', ')}`;
  }
  return null;
}

/**
 * Cloud Function (v2 callable) to encrypt and store a serviceAccountKey.
 *
 * Expects authenticated user and data:
 *   - connectionName: string - Display name for the connection
 *   - serviceAccountKey: object - The parsed serviceAccountKey.json
 */
export const storeCredentials = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Debes iniciar sesión para realizar esta acción.');
  }

  const { connectionName, serviceAccountKey } = request.data;

  if (!connectionName || typeof connectionName !== 'string' || !connectionName.trim()) {
    throw new HttpsError('invalid-argument', 'El nombre de la conexión es obligatorio.');
  }

  const validationError = validateServiceAccountKey(serviceAccountKey);
  if (validationError) {
    throw new HttpsError('invalid-argument', validationError);
  }

  const plaintext = JSON.stringify(serviceAccountKey);
  const encryptedCredentials = await encrypt(plaintext);

  const db = getFirestore();
  const connectionRef = db.collection('connections').doc();

  await connectionRef.set({
    name: connectionName.trim(),
    projectId: serviceAccountKey.project_id,
    clientEmail: serviceAccountKey.client_email,
    encryptedCredentials,
    createdBy: request.auth.uid,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return {
    connectionId: connectionRef.id,
    projectId: serviceAccountKey.project_id,
    message: 'Conexión creada correctamente.',
  };
});
