import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { requireAuth, requireParam } from './connection-utils.js';

const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL;

/**
 * Check whether an email belongs to the configured superadmin.
 * Fails loudly when SUPERADMIN_EMAIL is missing instead of silently
 * granting or denying access, and never matches an empty email.
 * @param {string|undefined} email
 * @returns {boolean}
 */
export function isSuperadminEmail(email) {
  if (!SUPERADMIN_EMAIL) {
    throw new HttpsError(
      'failed-precondition',
      'SUPERADMIN_EMAIL is not configured. Set it in functions/.env.'
    );
  }
  return Boolean(email) && email === SUPERADMIN_EMAIL;
}

async function requireSuperadmin(uid) {
  const db = getFirestore();
  const doc = await db.collection('appUsers').doc(uid).get();
  if (!doc.exists || doc.data().role !== 'superadmin') {
    throw new HttpsError('permission-denied', 'Solo el superadmin puede realizar esta acción.');
  }
}

/**
 * Check user access status. Creates record if first login.
 * The configured superadmin (see SUPERADMIN_EMAIL) is auto-approved.
 */
export const checkUserAccess = onCall(async (request) => {
  requireAuth(request);

  const { uid, email, displayName, photoURL } = request.auth.token;
  const db = getFirestore();
  const userRef = db.collection('appUsers').doc(uid);
  const doc = await userRef.get();

  if (!doc.exists) {
    const isSuperadmin = isSuperadminEmail(email);
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
  if (isSuperadminEmail(email) && (data.role !== 'superadmin' || data.status !== 'approved')) {
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
