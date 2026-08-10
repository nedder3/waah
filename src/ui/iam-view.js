// IAM view: users, roles, policies, attach/detach. Receives the service instance.
export function renderIamView(container, iam) {
  container.innerHTML = `
    <h2>IAM</h2>
    <div class="cols">
      <section>
        <h3>Usuarios</h3>
        <form id="iam-create-user">
          <input id="iam-user-name" placeholder="nombre-usuario" />
          <button type="submit">Crear usuario</button>
        </form>
        <ul id="iam-user-list"></ul>
      </section>
      <section>
        <h3>Roles</h3>
        <form id="iam-create-role">
          <input id="iam-role-name" placeholder="nombre-rol" />
          <button type="submit">Crear rol</button>
        </form>
        <ul id="iam-role-list"></ul>
      </section>
    </div>
    <section>
      <h3 id="iam-attach-title">Adjuntar rol a usuario</h3>
      <form id="iam-attach">
        <select id="iam-attach-user"></select>
        <select id="iam-attach-role"></select>
        <button type="submit">Adjuntar</button>
      </form>
    </section>
    <pre id="iam-log" aria-live="polite"></pre>
  `;

  const $ = (sel) => container.querySelector(sel);
  const log = (m) => { $('#iam-log').textContent += `${m}\n`; };

  function renderUsers() {
    const ul = $('#iam-user-list'); ul.innerHTML = '';
    for (const name of iam.listUsers()) {
      const li = document.createElement('li');
      const span = document.createElement('span');
      span.textContent = `${name} → [${iam.rolesOf(name).join(', ')}]`;
      const del = document.createElement('button'); del.textContent = '🗑';
      del.addEventListener('click', () => { iam.deleteUser(name); refresh(); });
      li.append(span, del); ul.append(li);
    }
  }

  function renderRoles() {
    const ul = $('#iam-role-list'); ul.innerHTML = '';
    for (const name of iam.listRoles()) {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.textContent = name;
      btn.addEventListener('click', () => {
        const p = iam.getPolicy(name);
        log(p ? `policy ${name}: ${JSON.stringify(p)}` : `rol ${name} sin policy`);
      });
      const del = document.createElement('button'); del.textContent = '🗑';
      del.addEventListener('click', () => { iam.deleteRole(name); refresh(); });
      li.append(btn, del); ul.append(li);
    }
  }

  function refreshSelects() {
    const us = $('#iam-attach-user'); us.innerHTML = '';
    const rs = $('#iam-attach-role'); rs.innerHTML = '';
    for (const u of iam.listUsers()) us.append(new Option(u, u));
    for (const r of iam.listRoles()) rs.append(new Option(r, r));
  }

  function refresh() { renderUsers(); renderRoles(); refreshSelects(); }

  $('#iam-create-user').addEventListener('submit', (e) => {
    e.preventDefault();
    const n = $('#iam-user-name').value.trim().toLowerCase();
    if (!n) return;
    try { iam.createUser(n); $('#iam-user-name').value = ''; refresh(); }
    catch (err) { log(`error: ${err.message}`); }
  });

  $('#iam-create-role').addEventListener('submit', (e) => {
    e.preventDefault();
    const n = $('#iam-role-name').value.trim().toLowerCase();
    if (!n) return;
    try {
      iam.createRole(n);
      iam.putPolicy(n, { statements: [{ effect: 'Allow', action: '*', resource: '*' }] });
      $('#iam-role-name').value = ''; refresh();
    } catch (err) { log(`error: ${err.message}`); }
  });

  $('#iam-attach').addEventListener('submit', (e) => {
    e.preventDefault();
    const u = $('#iam-attach-user').value;
    const r = $('#iam-attach-role').value;
    if (!u || !r) return;
    try { iam.attachRole(u, r); refresh(); }
    catch (err) { log(`error: ${err.message}`); }
  });

  refresh();
}
