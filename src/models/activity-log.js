/**
 * @typedef {Object} ActivityLog
 * @property {string} userId - UID of the user who performed the action
 * @property {string} action - Action performed (e.g., 'create', 'update', 'delete', 'backup', 'restore')
 * @property {string} firestoreConnectionId - ID of the FirestoreConnection affected
 * @property {string} timestamp - ISO date string
 * @property {Object} [details] - Additional details about the action
 * @property {string} [details.collection] - Collection affected
 * @property {string} [details.documentId] - Document ID affected
 * @property {string} [details.description] - Human-readable description
 */

export const COLLECTION = 'activityLog';

export const ACTIONS = /** @type {const} */ ({
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  BACKUP: 'backup',
  RESTORE: 'restore',
  LOGIN: 'login',
  LOGOUT: 'logout',
  PERMISSION_CHANGE: 'permission_change',
});

/**
 * Create a new ActivityLog document with defaults
 * @param {Partial<ActivityLog> & {userId: string, action: string}} data
 * @returns {ActivityLog}
 */
export function createActivityLog(data) {
  return {
    userId: data.userId,
    action: data.action,
    firestoreConnectionId: data.firestoreConnectionId || '',
    timestamp: data.timestamp || new Date().toISOString(),
    details: data.details || null,
  };
}
