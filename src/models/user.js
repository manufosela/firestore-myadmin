/**
 * @typedef {Object} User
 * @property {string} uid - Firebase Auth UID
 * @property {string} email - User email
 * @property {string} displayName - Display name
 * @property {'superadmin'|'admin'|'editor'|'viewer'} role - Global role
 * @property {string} createdAt - ISO date string
 * @property {string} lastLogin - ISO date string
 * @property {boolean} active - Whether the user is active
 */

export const COLLECTION = 'users';

export const ROLES = /** @type {const} */ ({
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
});

/**
 * Create a new User document with defaults
 * @param {Partial<User> & {uid: string, email: string}} data
 * @returns {User}
 */
export function createUser(data) {
  return {
    uid: data.uid,
    email: data.email,
    displayName: data.displayName || '',
    role: data.role || ROLES.VIEWER,
    createdAt: data.createdAt || new Date().toISOString(),
    lastLogin: data.lastLogin || new Date().toISOString(),
    active: data.active !== undefined ? data.active : true,
  };
}
