// IAM view: users + roles + attach, built on the shared CRUD helper.
// The helper renders the user list (create/delete). A sub-panel below handles
// role creation and attaching roles to users.
import { renderCrudView } from './crud-view.js';

export function renderIamView(container, iam) {
  function renderRolesPanel() {
    const ul = container.querySelector('#iam-role-list');
    ul.innerHTML = '';
    for (const name of iam.listRoles()) {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.textContent = name;
      btn.addEventListener('click', () => {
        const p = iam.getPolicy(name);
        log(p ? `policy ${name}: ${JSON.stringify(p)}` : `rol ${name} sin policy`);
      });
      const del = document.createElement('button');
      del.className = 'del';
      del.textContent = '🗑';
      del.addEventListener('click', () => { iam.deleteRole(name); renderRolesPanel(); refreshUsers(); });
      li.append(btn, del);
      ul.append(li);
    }
    // Repopulate attach selects.
    const us = container.querySelector('#iam-attach-user');
    const rs = container.querySelector('#iam-attach-role');
    if (us) { us.innerHTML = ''; for (const u of iam.listUsers()) us.append(new Option(u, u)); }
    if (rs) { rs.innerHTML = ''; for (const r of iam.listRoles()) rs.append(new Option(r, r)); }
  }

  let refreshUsers = () => {};
  const logEl = () => container.querySelector('.crud-log');

  function log(m) { const el = logEl(); if (el) el.textContent += `${m}\n`; }

  renderCrudView(container, {
    title: 'IAM — Usuarios',
    formId: 'iam-user',
    submitLabel: 'Crear usuario',
    fields: [{ name: 'name', placeholder: 'nombre-usuario' }],
    create: (vals) => iam.createUser(vals.name),
    list: () => iam.listUsers().map((n) => ({ key: n, label: `${n} → [${iam.rolesOf(n).join(', ')}]` })),
    onDelete: (n) => iam.deleteUser(n),
    emptyText: 'Sin usuarios.',
    onChange: () => renderRolesPanel(),
    onReady: (refresh) => { refreshUsers = refresh; },
  });

  const helper = container.querySelector('.crud-log');
  const panel = document.createElement('section');
  panel.innerHTML = `
    <h4>Roles</h4>
    <form id="iam-role-form">
      <input id="iam-role-name" placeholder="nombre-rol" />
      <button type="submit">Crear rol</button>
    </form>
    <ul id="iam-role-list"></ul>
    <h4>Adjuntar rol a usuario</h4>
    <form id="iam-attach-form">
      <select id="iam-attach-user"></select>
      <select id="iam-attach-role"></select>
      <button type="submit">Adjuntar</button>
    </form>
  `;
  container.insertBefore(panel, helper);

  panel.querySelector('#iam-role-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const n = panel.querySelector('#iam-role-name').value.trim().toLowerCase();
    if (!n) return;
    try {
      iam.createRole(n);
      iam.putPolicy(n, { statements: [{ effect: 'Allow', action: '*', resource: '*' }] });
      panel.querySelector('#iam-role-name').value = '';
      renderRolesPanel();
    } catch (err) { log(`error: ${err.message}`); }
  });

  panel.querySelector('#iam-attach-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const u = panel.querySelector('#iam-attach-user').value;
    const r = panel.querySelector('#iam-attach-role').value;
    if (!u || !r) return;
    try { iam.attachRole(u, r); renderRolesPanel(); refreshUsers(); }
    catch (err) { log(`error: ${err.message}`); }
  });

  renderRolesPanel();
}
