/**
 * @typedef {Object} Permission
 * @property {string} userId - UID of the user
 * @property {string} firestoreConnectionId - ID of the FirestoreConnection
 * @property {'viewer'|'editor'|'admin'} role - Role for this specific connection
 * @property {string} grantedBy - UID of the user who granted this permission
 * @property {string} grantedAt - ISO date string
 */

export const COLLECTION = 'permissions';

export const CONNECTION_ROLES = /** @type {const} */ ({
  VIEWER: 'viewer',
  EDITOR: 'editor',
  ADMIN: 'admin',
});

/**
 * Create a new Permission document with defaults
 * @param {Partial<Permission> & {userId: string, firestoreConnectionId: string, grantedBy: string}} data
 * @returns {Permission}
 */
export function createPermission(data) {
  return {
    userId: data.userId,
    firestoreConnectionId: data.firestoreConnectionId,
    role: data.role || CONNECTION_ROLES.VIEWER,
    grantedBy: data.grantedBy,
    grantedAt: data.grantedAt || new Date().toISOString(),
  };
}
