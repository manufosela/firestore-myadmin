/**
 * Firestore MyAdmin - Data Model
 *
 * Collections:
 *
 * ┌─────────────────────┐     ┌──────────────────────────┐
 * │       users          │     │   firestoreConnections   │
 * ├─────────────────────┤     ├──────────────────────────┤
 * │ uid (PK)            │     │ id (PK, auto)            │
 * │ email               │◄──┐ │ name                     │
 * │ displayName         │   │ │ projectId                │
 * │ role (global)       │   │ │ credentials (encrypted)  │
 * │ createdAt           │   │ │ createdBy → users.uid    │
 * │ lastLogin           │   │ │ createdAt                │
 * │ active              │   │ │ active                   │
 * └─────────────────────┘   │ └──────────────────────────┘
 *          │                │              │
 *          │                │              │
 *          ▼                │              ▼
 * ┌─────────────────────┐   │ ┌──────────────────────────┐
 * │    permissions       │   │ │      activityLog         │
 * ├─────────────────────┤   │ ├──────────────────────────┤
 * │ userId → users.uid  │   │ │ userId → users.uid       │
 * │ firestoreConnectionId│──┘ │ action                   │
 * │ role (per-connection)│     │ firestoreConnectionId    │
 * │ grantedBy → users   │     │ timestamp                │
 * │ grantedAt           │     │ details {}               │
 * └─────────────────────┘     └──────────────────────────┘
 *
 * Roles:
 * - Global (users.role): superadmin > admin > editor > viewer
 * - Per-connection (permissions.role): admin > editor > viewer
 * - superadmin is global-only, grants full access to all connections
 */

export * as User from './user.js';
export * as FirestoreConnection from './firestore-connection.js';
export * as Permission from './permission.js';
export * as ActivityLog from './activity-log.js';
