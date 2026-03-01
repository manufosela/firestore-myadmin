import { authService } from '../services/auth-service.js';
import { userAccessApi } from '../services/user-access-api.js';

let cachedAccessStatus = null;

/**
 * Auth guard - checks if user is authenticated and approved before allowing route access.
 * Redirects to / if not authenticated or not approved.
 *
 * @param {import('@vaadin/router').RouterLocation} context
 * @param {import('@vaadin/router').Commands} commands
 */
export async function authGuard(context, commands) {
  if (!authService.initialized) {
    await authService.waitForInit();
  }

  if (!authService.isAuthenticated) {
    cachedAccessStatus = null;
    return commands.redirect('/');
  }

  if (!cachedAccessStatus) {
    try {
      const access = await userAccessApi.checkUserAccess();
      cachedAccessStatus = access.status;
    } catch {
      cachedAccessStatus = null;
      return commands.redirect('/');
    }
  }

  if (cachedAccessStatus !== 'approved') {
    cachedAccessStatus = null;
    await authService.logout();
    return commands.redirect('/');
  }

  return undefined;
}

/** Reset the cached access status (called on logout). */
export function resetAccessCache() {
  cachedAccessStatus = null;
}
