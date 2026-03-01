import { authService } from '../services/auth-service.js';

/**
 * Auth guard - checks if user is authenticated before allowing route access.
 * Redirects to /login if not authenticated.
 *
 * @param {import('@vaadin/router').RouterLocation} context
 * @param {import('@vaadin/router').Commands} commands
 */
export async function authGuard(context, commands) {
  if (!authService.initialized) {
    await authService.waitForInit();
  }

  if (!authService.isAuthenticated) {
    return commands.redirect('/login');
  }

  return undefined;
}
