import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebase.js';

const functions = getFunctions(app);

const getMyRoleFn = httpsCallable(functions, 'getMyRole');
const setUserRoleFn = httpsCallable(functions, 'setUserRole');
const removeUserRoleFn = httpsCallable(functions, 'removeUserRole');
const listConnectionUsersFn = httpsCallable(functions, 'listConnectionUsers');

export const permissionsApi = {
  async getMyRole(connectionId) {
    const result = await getMyRoleFn({ connectionId });
    return result.data.role;
  },

  async setUserRole(connectionId, targetUid, role) {
    const result = await setUserRoleFn({ connectionId, targetUid, role });
    return result.data;
  },

  async removeUserRole(connectionId, targetUid) {
    const result = await removeUserRoleFn({ connectionId, targetUid });
    return result.data;
  },

  async listConnectionUsers(connectionId) {
    const result = await listConnectionUsersFn({ connectionId });
    return result.data.users;
  },
};
