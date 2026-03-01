/**
 * @typedef {Object} FirestoreConnection
 * @property {string} id - Connection ID (auto-generated)
 * @property {string} name - Display name for this connection
 * @property {string} projectId - Firebase project ID
 * @property {Object} credentials - Encrypted service account credentials
 * @property {string} credentials.encrypted - Encrypted JSON string
 * @property {string} createdBy - UID of the user who created this connection
 * @property {string} createdAt - ISO date string
 * @property {string} [updatedAt] - ISO date string
 * @property {boolean} active - Whether the connection is active
 */

export const COLLECTION = 'firestoreConnections';

/**
 * Create a new FirestoreConnection document with defaults
 * @param {Partial<FirestoreConnection> & {name: string, projectId: string, createdBy: string}} data
 * @returns {FirestoreConnection}
 */
export function createFirestoreConnection(data) {
  return {
    id: data.id || '',
    name: data.name,
    projectId: data.projectId,
    credentials: data.credentials || { encrypted: '' },
    createdBy: data.createdBy,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || null,
    active: data.active !== undefined ? data.active : true,
  };
}
