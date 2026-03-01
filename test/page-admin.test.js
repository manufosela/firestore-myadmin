import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { permissionsApi } from '../src/services/permissions-api.js';
import { connectionService } from '../src/services/connection-service.js';
import '../src/pages/page-admin.js';

const mockConnections = [
  { id: 'conn-1', name: 'My Project', projectId: 'proj-1' },
  { id: 'conn-2', name: 'Other Project', projectId: 'proj-2' },
];

const mockUsers = [
  { userId: 'user-1', role: 'admin', updatedAt: '2026-01-01' },
  { userId: 'user-2', role: 'editor', updatedAt: '2026-01-02' },
  { userId: 'user-3', role: 'viewer', updatedAt: '2026-01-03' },
];

describe('FmaPageAdmin', () => {
  let el;

  beforeEach(async () => {
    connectionService._setConnections(mockConnections);
    // Reset mock implementations
    permissionsApi.getMyRole = async () => 'admin';
    permissionsApi.listConnectionUsers = async () => [...mockUsers];
    permissionsApi.setUserRole = async () => ({ message: 'Rol asignado correctamente.' });
    permissionsApi.removeUserRole = async () => ({ message: 'Acceso revocado correctamente.' });
    el = await fixture(html`<fma-page-admin></fma-page-admin>`);
  });

  afterEach(() => {
    connectionService._reset();
  });

  it('renders title', () => {
    const title = el.shadowRoot.querySelector('h2');
    expect(title).to.exist;
    expect(title.textContent).to.include('Administración de permisos');
  });

  it('renders connection selector with options', () => {
    const select = el.shadowRoot.querySelector('#conn-select');
    expect(select).to.exist;
    const options = select.querySelectorAll('option');
    // Default empty + 2 connections
    expect(options.length).to.equal(3);
    expect(options[1].textContent).to.include('My Project');
    expect(options[2].textContent).to.include('Other Project');
  });

  it('shows info message when no connection selected', () => {
    const info = el.shadowRoot.querySelector('.info');
    expect(info).to.exist;
    expect(info.textContent).to.include('Selecciona una conexión');
  });

  it('loads users when connection is selected', async () => {
    const select = el.shadowRoot.querySelector('#conn-select');
    select.value = 'conn-1';
    select.dispatchEvent(new Event('change'));
    await el.updateComplete;
    await waitUntil(() => !el._loading, 'loading should finish');
    await el.updateComplete;

    const table = el.shadowRoot.querySelector('.users-table');
    expect(table).to.exist;
    const rows = table.querySelectorAll('tbody tr');
    expect(rows.length).to.equal(3);
  });

  it('shows user IDs and role badges in the table', async () => {
    el._selectedConnectionId = 'conn-1';
    el._myRole = 'admin';
    el._users = [...mockUsers];
    el._loading = false;
    await el.updateComplete;

    const rows = el.shadowRoot.querySelectorAll('.users-table tbody tr');
    expect(rows[0].querySelector('td').textContent).to.include('user-1');
    expect(rows[0].querySelector('.role-badge').textContent).to.include('admin');
    expect(rows[1].querySelector('.role-badge').textContent).to.include('editor');
    expect(rows[2].querySelector('.role-badge').textContent).to.include('viewer');
  });

  it('shows denied message for non-admin users', async () => {
    permissionsApi.getMyRole = async () => 'viewer';
    const select = el.shadowRoot.querySelector('#conn-select');
    select.value = 'conn-1';
    select.dispatchEvent(new Event('change'));
    await el.updateComplete;
    await waitUntil(() => !el._loading, 'loading should finish');
    await el.updateComplete;

    const denied = el.shadowRoot.querySelector('.denied');
    expect(denied).to.exist;
    expect(denied.textContent).to.include('Solo los administradores');
  });

  it('shows add user form for admin', async () => {
    el._selectedConnectionId = 'conn-1';
    el._myRole = 'admin';
    el._users = [...mockUsers];
    el._loading = false;
    await el.updateComplete;

    const form = el.shadowRoot.querySelector('.add-user-form');
    expect(form).to.exist;
    const uidInput = el.shadowRoot.querySelector('#add-uid');
    expect(uidInput).to.exist;
    const roleSelect = el.shadowRoot.querySelector('#add-role');
    expect(roleSelect).to.exist;
    const submitBtn = form.querySelector('button[type="submit"]');
    expect(submitBtn.textContent).to.include('Añadir usuario');
  });

  it('validates empty UID on add user', async () => {
    el._selectedConnectionId = 'conn-1';
    el._myRole = 'admin';
    el._users = [...mockUsers];
    el._loading = false;
    await el.updateComplete;

    const form = el.shadowRoot.querySelector('.add-user-form');
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await el.updateComplete;

    const addError = el.shadowRoot.querySelector('.add-error');
    expect(addError).to.exist;
    expect(addError.textContent).to.include('UID del usuario es obligatorio');
  });

  it('adds a user successfully', async () => {
    let calledWith = null;
    permissionsApi.setUserRole = async (connId, uid, role) => {
      calledWith = { connId, uid, role };
      return { message: 'Rol asignado correctamente.' };
    };

    el._selectedConnectionId = 'conn-1';
    el._myRole = 'admin';
    el._users = [...mockUsers];
    el._loading = false;
    el._addUid = 'new-user-uid';
    el._addRole = 'editor';
    await el.updateComplete;

    const form = el.shadowRoot.querySelector('.add-user-form');
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await el.updateComplete;
    await waitUntil(() => !el._loading, 'loading should finish');

    expect(calledWith).to.deep.equal({
      connId: 'conn-1',
      uid: 'new-user-uid',
      role: 'editor',
    });
    expect(el._addUid).to.equal('');
  });

  it('shows revoke confirmation dialog', async () => {
    el._selectedConnectionId = 'conn-1';
    el._myRole = 'admin';
    el._users = [...mockUsers];
    el._loading = false;
    await el.updateComplete;

    const revokeBtn = el.shadowRoot.querySelectorAll('.btn-danger')[0];
    revokeBtn.click();
    await el.updateComplete;

    const confirm = el.shadowRoot.querySelector('.confirm-remove');
    expect(confirm).to.exist;
    expect(confirm.querySelector('p').textContent).to.include('user-1');
  });

  it('cancels revoke confirmation', async () => {
    el._confirmRemoveUid = 'user-2';
    await el.updateComplete;

    const cancelBtn = el.shadowRoot.querySelector('.confirm-remove .btn:not(.btn-danger)');
    expect(cancelBtn).to.exist;
    cancelBtn.click();
    await el.updateComplete;

    expect(el._confirmRemoveUid).to.equal('');
    const confirm = el.shadowRoot.querySelector('.confirm-remove');
    expect(confirm).to.not.exist;
  });

  it('revokes user access', async () => {
    let removedUid = null;
    permissionsApi.removeUserRole = async (connId, uid) => {
      removedUid = uid;
      return { message: 'Acceso revocado correctamente.' };
    };

    el._selectedConnectionId = 'conn-1';
    el._myRole = 'admin';
    el._users = [...mockUsers];
    el._confirmRemoveUid = 'user-2';
    el._loading = false;
    await el.updateComplete;

    const revokeBtn = el.shadowRoot.querySelector('.confirm-remove .btn-danger');
    revokeBtn.click();
    await el.updateComplete;
    await waitUntil(() => !el._loading, 'loading should finish');

    expect(removedUid).to.equal('user-2');
  });

  it('has role change select per user row', async () => {
    el._selectedConnectionId = 'conn-1';
    el._myRole = 'admin';
    el._users = [...mockUsers];
    el._loading = false;
    await el.updateComplete;

    const selects = el.shadowRoot.querySelectorAll('.users-table tbody select');
    expect(selects.length).to.equal(3);
    // Each select should have 3 role options
    expect(selects[0].querySelectorAll('option').length).to.equal(3);
  });

  it('shows error when loading fails', async () => {
    permissionsApi.getMyRole = async () => {
      throw new Error('Network error');
    };

    const select = el.shadowRoot.querySelector('#conn-select');
    select.value = 'conn-1';
    select.dispatchEvent(new Event('change'));
    await el.updateComplete;
    await waitUntil(() => !el._loading, 'loading should finish');
    await el.updateComplete;

    const error = el.shadowRoot.querySelector('.error');
    expect(error).to.exist;
    expect(error.textContent).to.include('Network error');
  });

  it('shows empty state when no users', async () => {
    permissionsApi.listConnectionUsers = async () => [];

    el._selectedConnectionId = 'conn-1';
    el._myRole = 'admin';
    el._users = [];
    el._loading = false;
    await el.updateComplete;

    const empty = el.shadowRoot.querySelector('.empty');
    expect(empty).to.exist;
    expect(empty.textContent).to.include('No hay usuarios');
  });
});
