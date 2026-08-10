// Store view: renders the Dynamo-like service into a container element.
export function renderStoreView(container, store) {
  container.innerHTML = `
    <h2>Tables (Store / Dynamo-like)</h2>
    <form id="store-create-table">
      <input id="store-table-name" placeholder="nombre-tabla" />
      <input id="store-key-field" placeholder="campo-clave (pkey)" value="id" />
      <button type="submit">Crear tabla</button>
    </form>
    <ul id="store-table-list"></ul>
    <section id="store-items" hidden>
      <h3 id="store-items-title"></h3>
      <form id="store-put-item">
        <textarea id="store-item-json" placeholder='{"id":"1","nombre":"ana"}'></textarea>
        <button type="submit">Insertar item</button>
      </form>
      <ul id="store-item-list"></ul>
    </section>
    <pre id="store-log" aria-live="polite"></pre>
  `;

  const $ = (sel) => container.querySelector(sel);
  const log = (msg) => { $('#store-log').textContent += `${msg}\n`; };

  function renderTables() {
    const ul = $('#store-table-list');
    ul.innerHTML = '';
    for (const name of store.listTables()) {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.textContent = name;
      btn.addEventListener('click', () => openTable(name));
      const del = document.createElement('button');
      del.textContent = '🗑';
      del.addEventListener('click', () => {
        store.deleteTable(name);
        renderTables();
        $('#store-items').hidden = true;
      });
      li.append(btn, del);
      ul.append(li);
    }
  }

  function openTable(name) {
    $('#store-items').hidden = false;
    $('#store-items-title').textContent = `Items en ${name}`;
    renderItems(name);
  }

  function renderItems(table) {
    const ul = $('#store-item-list');
    ul.innerHTML = '';
    const kf = store.keyFieldOf(table);
    for (const item of store.query(table)) {
      const li = document.createElement('li');
      const view = document.createElement('button');
      view.textContent = JSON.stringify(item).slice(0, 48);
      const del = document.createElement('button');
      del.textContent = '🗑';
      del.addEventListener('click', () => {
        store.deleteItem(table, String(item[kf]));
        renderItems(table);
      });
      li.append(view, del);
      ul.append(li);
    }
  }

  function storeKeyField(table) {
    // Read the partition key name from table metadata via the service.
    const raw = store._tableMeta(table);
    return raw.keyField;
  }

  $('#store-create-table').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#store-table-name').value.trim().toLowerCase();
    const keyField = $('#store-key-field').value.trim();
    if (!name || !keyField) return;
    try {
      store.createTable(name, keyField);
      $('#store-table-name').value = '';
      renderTables();
    } catch (err) {
      log(`error: ${err.message}`);
    }
  });

  $('#store-put-item').addEventListener('submit', (e) => {
    e.preventDefault();
    const table = $('#store-items-title').textContent.replace('Items en ', '');
    const text = $('#store-item-json').value.trim();
    if (!text) return;
    try {
      const item = JSON.parse(text);
      store.putItem(table, item);
      $('#store-item-json').value = '';
      renderItems(table);
    } catch (err) {
      log(`error: ${err.message}`);
    }
  });

  renderTables();
}
