import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { requireAuth, requireParam } from './connection-utils.js';

const SUPERADMIN_EMAIL = 'mjfosela@gmail.com';

async function requireSuperadmin(uid) {
  const db = getFirestore();
  const doc = await db.collection('appUsers').doc(uid).get();
  if (!doc.exists || doc.data().role !== 'superadmin') {
    throw new HttpsError('permission-denied', 'Solo el superadmin puede realizar esta acción.');
  }
}

/**
 * Check user access status. Creates record if first login.
 * Superadmin (mjfosela@gmail.com) is auto-approved.
 */
export const checkUserAccess = onCall(async (request) => {
  requireAuth(request);

  const { uid, email, displayName, photoURL } = request.auth.token;
  const db = getFirestore();
  const userRef = db.collection('appUsers').doc(uid);
  const doc = await userRef.get();

  if (!doc.exists) {
    const isSuperadmin = email === SUPERADMIN_EMAIL;
    const now = new Date().toISOString();
    const userData = {
      email: email || '',
      displayName: displayName || '',
      photoURL: photoURL || '',
      status: isSuperadmin ? 'approved' : 'pending',
      role: isSuperadmin ? 'superadmin' : 'user',
      createdAt: now,
    };
    await userRef.set(userData);
    return { status: userData.status, role: userData.role, email: userData.email };
  }

  const data = doc.data();

  // Ensure superadmin always has correct role
  if (email === SUPERADMIN_EMAIL && (data.role !== 'superadmin' || data.status !== 'approved')) {
    await userRef.update({ role: 'superadmin', status: 'approved' });
    return { status: 'approved', role: 'superadmin', email };
  }

  return { status: data.status, role: data.role, email: data.email };
});

/**
 * List all app users. Superadmin only.
 */
export const listAppUsers = onCall(async (request) => {
  requireAuth(request);
  await requireSuperadmin(request.auth.uid);

  const db = getFirestore();
  const snapshot = await db.collection('appUsers').get();

  return {
    users: snapshot.docs.map((doc) => {
      const d = doc.data();
      return {
        uid: doc.id,
        email: d.email,
        displayName: d.displayName,
        status: d.status,
        role: d.role,
        createdAt: d.createdAt,
        approvedAt: d.approvedAt || null,
      };
    }),
  };
});

/**
 * Approve a pending user. Superadmin only.
 */
export const approveUser = onCall(async (request) => {
  requireAuth(request);
  await requireSuperadmin(request.auth.uid);

  const { targetUid } = request.data;
  requireParam(targetUid, 'targetUid');

  const db = getFirestore();
  const userRef = db.collection('appUsers').doc(targetUid);
  const doc = await userRef.get();

  if (!doc.exists) {
    throw new HttpsError('not-found', 'Usuario no encontrado.');
  }

  await userRef.update({
    status: 'approved',
    approvedBy: request.auth.uid,
    approvedAt: new Date().toISOString(),
  });

  return { message: 'Usuario aprobado correctamente.' };
});

/**
 * Delete a user record. Superadmin only.
 */
export const deleteAppUser = onCall(async (request) => {
  requireAuth(request);
  await requireSuperadmin(request.auth.uid);

  const { targetUid } = request.data;
  requireParam(targetUid, 'targetUid');

  if (targetUid === request.auth.uid) {
    throw new HttpsError('invalid-argument', 'No puedes eliminarte a ti mismo.');
  }

  const db = getFirestore();
  const userRef = db.collection('appUsers').doc(targetUid);
  const doc = await userRef.get();

  if (!doc.exists) {
    throw new HttpsError('not-found', 'Usuario no encontrado.');
  }

  await userRef.delete();

  return { message: 'Usuario eliminado correctamente.' };
});
