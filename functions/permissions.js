import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { requireAuth, requireParam, getUserRole } from './connection-utils.js';

const VALID_ROLES = ['admin', 'editor', 'viewer'];

/**
 * Set a user's role for a connection.
 * Only admins can modify roles.
 */
export const setUserRole = onCall(async (request) => {
  requireAuth(request);

  const { connectionId, targetUid, role } = request.data;
  requireParam(connectionId, 'connectionId');
  requireParam(targetUid, 'targetUid');
  requireParam(role, 'role');

  if (!VALID_ROLES.includes(role)) {
    throw new HttpsError('invalid-argument', `Rol inválido. Valores permitidos: ${VALID_ROLES.join(', ')}`);
  }

  const callerRole = await getUserRole(connectionId, request.auth.uid);
  if (callerRole !== 'admin') {
    throw new HttpsError('permission-denied', 'Solo los administradores pueden modificar roles.');
  }

  // Prevent admin from removing their own admin role
  if (targetUid === request.auth.uid && role !== 'admin') {
    throw new HttpsError('invalid-argument', 'No puedes quitar tu propio rol de administrador.');
  }

  const db = getFirestore();
  const permId = `${connectionId}_${targetUid}`;
  await db.collection('permissions').doc(permId).set(
    {
      connectionId,
      userId: targetUid,
      role,
      updatedAt: new Date().toISOString(),
      updatedBy: request.auth.uid,
    },
    { merge: true },
  );

  return { message: `Rol "${role}" asignado correctamente.` };
});

/**
 * Remove a user's access to a connection.
 * Only admins can remove access.
 */
export const removeUserRole = onCall(async (request) => {
  requireAuth(request);

  const { connectionId, targetUid } = request.data;
  requireParam(connectionId, 'connectionId');
  requireParam(targetUid, 'targetUid');

  const callerRole = await getUserRole(connectionId, request.auth.uid);
  if (callerRole !== 'admin') {
    throw new HttpsError('permission-denied', 'Solo los administradores pueden revocar acceso.');
  }

  if (targetUid === request.auth.uid) {
    throw new HttpsError('invalid-argument', 'No puedes revocar tu propio acceso.');
  }

  const db = getFirestore();
  const permId = `${connectionId}_${targetUid}`;
  await db.collection('permissions').doc(permId).delete();

  return { message: 'Acceso revocado correctamente.' };
});

/**
 * Get the current user's role for a connection.
 */
export const getMyRole = onCall(async (request) => {
  requireAuth(request);

  const { connectionId } = request.data;
  requireParam(connectionId, 'connectionId');

  const role = await getUserRole(connectionId, request.auth.uid);

  return { role };
});

/**
 * List all users with access to a connection.
 * Only admins can see this.
 */
export const listConnectionUsers = onCall(async (request) => {
  requireAuth(request);

  const { connectionId } = request.data;
  requireParam(connectionId, 'connectionId');

  const callerRole = await getUserRole(connectionId, request.auth.uid);
  if (callerRole !== 'admin') {
    throw new HttpsError('permission-denied', 'Solo los administradores pueden ver la lista de usuarios.');
  }

  const db = getFirestore();
  const snapshot = await db.collection('permissions').where('connectionId', '==', connectionId).get();

  return {
    users: snapshot.docs.map((doc) => ({
      userId: doc.data().userId,
      role: doc.data().role,
      updatedAt: doc.data().updatedAt,
    })),
  };
});
