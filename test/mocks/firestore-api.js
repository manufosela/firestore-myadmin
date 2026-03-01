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
};
