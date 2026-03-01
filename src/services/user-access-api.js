import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebase.js';

const functions = getFunctions(app);

const checkUserAccessFn = httpsCallable(functions, 'checkUserAccess');
const listAppUsersFn = httpsCallable(functions, 'listAppUsers');
const approveUserFn = httpsCallable(functions, 'approveUser');
const deleteAppUserFn = httpsCallable(functions, 'deleteAppUser');

export const userAccessApi = {
  async checkUserAccess() {
    const result = await checkUserAccessFn();
    return result.data;
  },

  async listAppUsers() {
    const result = await listAppUsersFn();
    return result.data.users;
  },

  async approveUser(targetUid) {
    const result = await approveUserFn({ targetUid });
    return result.data;
  },

  async deleteAppUser(targetUid) {
    const result = await deleteAppUserFn({ targetUid });
    return result.data;
  },
};
