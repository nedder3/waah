// Shared CRUD view helper. The five service views (s3/store/iam/lambda/ec2) all
// follow the same shape: a titled form + a list with delete + an empty state.
// This helper renders that shape from a config so each service view stays small
// and the DOM logic lives in one tested place.
//
// config = {
//   title: string,
//   formId: string,                   // id of the <form>
//   fields: [{ name, placeholder, value? }],
//   create: (values) => void,         // called on submit; values keyed by field.name
//   list: () => [{ key, label }],      // current items
//   onDelete: (key) => void,          // trash clicked
//   rowActions?: (item, refresh) => [{ label, onClick }],  // extra per-row buttons
//   onChange?: () => void,            // called after create/delete (for parent re-render)
//   onReady?: (refresh) => void,      // exposes renderList to the parent view
//   emptyText?: string,
// }

export function renderCrudView(container, config) {
  const { title, formId, fields, create, list, onDelete, rowActions, onChange, onReady, emptyText = 'Sin elementos.' } = config;
  const listId = `${formId}-list`;
  const emptyId = `${formId}-empty`;

  container.innerHTML = `
    <h3>${title}</h3>
    <form id="${formId}">
      ${fields.map((f) => `<input id="${formId}-${f.name}" placeholder="${f.placeholder}" value="${f.value || ''}" />`).join('')}
      <button type="submit">${config.submitLabel || 'Crear'}</button>
    </form>
    <ul id="${listId}"></ul>
    <p id="${emptyId}" hidden>${emptyText}</p>
    <pre class="crud-log" aria-live="polite"></pre>
  `;

  const $ = (sel) => container.querySelector(sel);
  const log = (msg) => { $('.crud-log').textContent += `${msg}\n`; };

  function renderList() {
    const ul = $(`#${listId}`);
    ul.innerHTML = '';
    const items = list();
    $(`#${emptyId}`).hidden = items.length > 0;
    for (const item of items) {
      const li = document.createElement('li');
      const label = document.createElement('span');
      label.textContent = item.label;
      li.append(label);
      if (rowActions) {
        for (const action of rowActions(item, renderList)) {
          const btn = document.createElement('button');
          btn.textContent = action.label;
          btn.addEventListener('click', () => action.onClick());
          li.append(btn);
        }
      }
      const del = document.createElement('button');
      del.className = 'del';
      del.textContent = '🗑';
      del.addEventListener('click', () => { onDelete(item.key); renderList(); if (onChange) onChange(); });
      li.append(del);
      ul.append(li);
    }
  }

  $(`#${formId}`).addEventListener('submit', (e) => {
    e.preventDefault();
    const values = {};
    for (const f of fields) {
      const el = $(`#${formId}-${f.name}`);
      values[f.name] = el.value.trim();
    }
    if (fields.some((f) => !values[f.name])) return;
    try {
      create(values);
      for (const f of fields) $(`#${formId}-${f.name}`).value = '';
      renderList();
      if (onChange) onChange();
    } catch (err) {
      log(`error: ${err.message}`);
    }
  });

  renderList();
  if (onReady) onReady(renderList);
}
