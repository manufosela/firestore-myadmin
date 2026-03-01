import { Router } from '@vaadin/router';
import { routes } from './routes.js';

/** @type {Router|null} */
let router = null;

/**
 * Initialize the router on the given outlet element.
 * @param {HTMLElement} outlet - The DOM element where pages will be rendered
 * @returns {Router}
 */
export function initRouter(outlet) {
  router = new Router(outlet);
  router.setRoutes(routes);
  return router;
}

/**
 * Get the current router instance.
 * @returns {Router|null}
 */
export function getRouter() {
  return router;
}
