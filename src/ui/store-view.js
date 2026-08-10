// Store view: tables + items, built on the shared CRUD helper.
// The helper renders the table list (create/delete). Clicking a table opens an
// item panel (insert JSON item + list items) managed by this view.
import { renderCrudView } from './crud-view.js';

export function renderStoreView(container, store) {
  let openTable = null;

  function renderItemPanel() {
    const panel = container.querySelector('#store-items');
    if (!openTable) { panel.hidden = true; return; }
    panel.hidden = false;
    container.querySelector('#store-items-title').textContent = `Items en ${openTable}`;
    const ul = container.querySelector('#store-item-list');
    ul.innerHTML = '';
    const kf = store.keyFieldOf(openTable);
    for (const item of store.query(openTable)) {
      const li = document.createElement('li');
      const view = document.createElement('span');
      view.textContent = JSON.stringify(item).slice(0, 48);
      const del = document.createElement('button');
      del.className = 'del';
      del.textContent = '🗑';
      del.addEventListener('click', () => { store.deleteItem(openTable, String(item[kf])); renderItemPanel(); });
      li.append(view, del);
      ul.append(li);
    }
  }

  renderCrudView(container, {
    title: 'Store — Tablas',
    formId: 'store',
    submitLabel: 'Crear tabla',
    fields: [
      { name: 'name', placeholder: 'nombre-tabla' },
      { name: 'keyField', placeholder: 'campo-clave (pkey)', value: 'id' },
    ],
    create: (vals) => store.createTable(vals.name, vals.keyField),
    list: () => store.listTables().map((n) => ({ key: n, label: n })),
    onDelete: (n) => { if (openTable === n) openTable = null; store.deleteTable(n); },
    emptyText: 'Sin tablas.',
    rowActions: (item, refresh) => [{
      label: 'abrir',
      onClick: () => { openTable = item.key; renderItemPanel(); },
    }],
    onChange: () => renderItemPanel(),
  });

  const helper = container.querySelector('.crud-log');
  const panel = document.createElement('section');
  panel.id = 'store-items';
  panel.hidden = true;
  panel.innerHTML = `
    <h4 id="store-items-title"></h4>
    <form id="store-put-item">
      <textarea id="store-item-json" placeholder='{"id":"1","nombre":"ana"}'></textarea>
      <button type="submit">Insertar item</button>
    </form>
    <ul id="store-item-list"></ul>
  `;
  container.insertBefore(panel, helper);

  panel.querySelector('#store-put-item').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!openTable) return;
    const text = panel.querySelector('#store-item-json').value.trim();
    if (!text) return;
    try {
      const item = JSON.parse(text);
      store.putItem(openTable, item);
      panel.querySelector('#store-item-json').value = '';
      renderItemPanel();
    } catch (err) {
      helper.textContent += `error: ${err.message}\n`;
    }
  });

  renderItemPanel();
}
