// Mock firebase/firestore for testing
export function getFirestore() {
  return {};
}

export function collection() {
  return {};
}

export function query() {
  return {};
}

export function where() {
  return {};
}

export function doc() {
  return {};
}

export function onSnapshot(q, callback) {
  // Store callback for test access
  onSnapshot._lastCallback = callback;
  // Return unsubscribe function
  return () => {};
}
onSnapshot._lastCallback = null;

export async function deleteDoc() {}

export async function updateDoc() {}
