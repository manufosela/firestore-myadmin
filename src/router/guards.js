/**
 * Auth guard - checks if user is authenticated before allowing route access.
 * Redirects to /login if not authenticated.
 *
 * TODO: Replace with real Firebase Auth check when auth epic is implemented.
 *
 * @param {import('@vaadin/router').RouterLocation} context
 * @param {import('@vaadin/router').Commands} commands
 */
export function authGuard(context, commands) {
  const isAuthenticated = sessionStorage.getItem('fma-authenticated') === 'true';

  if (!isAuthenticated) {
    return commands.redirect('/login');
  }

  return undefined;
}
