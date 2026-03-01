// Mock permissionsApi for testing
export const permissionsApi = {
  async getMyRole() {
    return 'admin';
  },

  async setUserRole() {
    return { message: 'Rol asignado correctamente.' };
  },

  async removeUserRole() {
    return { message: 'Acceso revocado correctamente.' };
  },

  async listConnectionUsers() {
    return [];
  },
};
