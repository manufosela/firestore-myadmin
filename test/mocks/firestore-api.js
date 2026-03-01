// Mock firestoreApi for testing
export const firestoreApi = {
  async listCollections() {
    return [];
  },

  async listDocuments() {
    return { documents: [], hasMore: false };
  },

  async getDocument() {
    return { id: '', path: '', data: {}, subcollections: [] };
  },

  async createDocument() {
    return { id: 'new-doc', path: '', message: 'Documento creado correctamente.' };
  },

  async updateDocument() {
    return { id: '', path: '', message: 'Documento actualizado correctamente.' };
  },

  async deleteDocument() {
    return { path: '', message: 'Documento eliminado correctamente.' };
  },
};
