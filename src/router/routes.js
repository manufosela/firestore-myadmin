import { authGuard } from './guards.js';

export const routes = [
  {
    path: '/login',
    component: 'fma-page-login',
    action: () => import('../pages/page-login.js'),
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    component: 'fma-page-dashboard',
    action: async (context, commands) => {
      const result = authGuard(context, commands);
      if (result) return result;
      await import('../pages/page-dashboard.js');
      return undefined;
    },
  },
  {
    path: '/firestore/:id',
    component: 'fma-page-firestore',
    action: async (context, commands) => {
      const result = authGuard(context, commands);
      if (result) return result;
      await import('../pages/page-firestore.js');
      return undefined;
    },
  },
  {
    path: '/admin',
    component: 'fma-page-admin',
    action: async (context, commands) => {
      const result = authGuard(context, commands);
      if (result) return result;
      await import('../pages/page-admin.js');
      return undefined;
    },
  },
  {
    path: '(.*)',
    component: 'fma-page-not-found',
    action: () => import('../pages/page-not-found.js'),
  },
];
