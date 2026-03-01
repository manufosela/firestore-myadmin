// Mock userAccessApi for testing
export const userAccessApi = {
  _mockStatus: 'approved',
  _mockRole: 'superadmin',
  _mockEmail: 'mock@test.com',
  _mockUsers: [],

  async checkUserAccess() {
    return { status: this._mockStatus, role: this._mockRole, email: this._mockEmail };
  },

  async listAppUsers() {
    return this._mockUsers;
  },

  async approveUser() {
    return { message: 'Usuario aprobado correctamente.' };
  },

  async deleteAppUser() {
    return { message: 'Usuario eliminado correctamente.' };
  },

  // Test helper - reset defaults
  _reset() {
    this._mockStatus = 'approved';
    this._mockRole = 'superadmin';
    this._mockEmail = 'mock@test.com';
    this._mockUsers = [];
  },
};
