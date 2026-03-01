// Mock firebase/functions for testing
export function getFunctions() {
  return {};
}

export function httpsCallable() {
  return async () => ({ data: {} });
}
