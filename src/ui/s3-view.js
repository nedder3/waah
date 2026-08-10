// S3 view: buckets + objects, built on the shared CRUD helper.
// The helper renders the bucket list (create/delete). Clicking a bucket opens an
// object panel (upload text object + list objects by prefix) managed by this view.
import { renderCrudView } from './crud-view.js';

export function renderS3View(container, s3) {
  let openBucket = null;

  function renderObjects() {
    const panel = container.querySelector('#s3-objects');
    if (!openBucket) { panel.hidden = true; return; }
    panel.hidden = false;
    container.querySelector('#s3-objects-title').textContent = `Objetos en ${openBucket}`;
    const ul = container.querySelector('#s3-object-list');
    ul.innerHTML = '';
    for (const obj of s3.listObjects(openBucket)) {
      const li = document.createElement('li');
      const view = document.createElement('span');
      view.textContent = `${obj.key} → ${obj.body.slice(0, 24)}`;
      const del = document.createElement('button');
      del.className = 'del';
      del.textContent = '🗑';
      del.addEventListener('click', () => { s3.deleteObject(openBucket, obj.key); renderObjects(); });
      li.append(view, del);
      ul.append(li);
    }
  }

  renderCrudView(container, {
    title: 'S3 — Buckets',
    formId: 's3',
    submitLabel: 'Crear bucket',
    fields: [{ name: 'name', placeholder: 'nombre-del-bucket' }],
    create: (vals) => s3.createBucket(vals.name),
    list: () => s3.listBuckets().map((n) => ({ key: n, label: n })),
    onDelete: (n) => { if (openBucket === n) openBucket = null; s3.deleteBucket(n); },
    emptyText: 'Sin buckets.',
    rowActions: (item, refresh) => [{
      label: 'abrir',
      onClick: () => { openBucket = item.key; renderObjects(); },
    }],
    onChange: () => renderObjects(),
  });

  const helper = container.querySelector('.crud-log');
  const panel = document.createElement('section');
  panel.id = 's3-objects';
  panel.hidden = true;
  panel.innerHTML = `
    <h4 id="s3-objects-title"></h4>
    <form id="s3-put-object">
      <input id="s3-object-key" placeholder="ruta/objeto.txt" />
      <textarea id="s3-object-body" placeholder="contenido"></textarea>
      <button type="submit">Subir objeto</button>
    </form>
    <ul id="s3-object-list"></ul>
  `;
  container.insertBefore(panel, helper);

  panel.querySelector('#s3-put-object').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!openBucket) return;
    const key = panel.querySelector('#s3-object-key').value.trim();
    const body = panel.querySelector('#s3-object-body').value;
    if (!key) return;
    try {
      s3.putObject(openBucket, key, body);
      panel.querySelector('#s3-object-key').value = '';
      panel.querySelector('#s3-object-body').value = '';
      renderObjects();
    } catch (err) {
      helper.textContent += `error: ${err.message}\n`;
    }
  });

  renderObjects();
}
