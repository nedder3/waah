// UI shell: mounts WAHH, drives S3Service. The only DOM-touching layer.
// Receives a ServiceRegistry so future services plug in without UI rewrites.

export function mountApp(root, { registry }) {
  const s3 = registry.create('s3', createStorageFor('s3'));

  root.innerHTML = `
    <header>
      <h1>WAHH <small>We Have AWS At Home</small></h1>
      <nav id="services"></nav>
    </header>
    <main>
      <section id="buckets-panel">
        <h2>Buckets (S3-like)</h2>
        <form id="create-bucket">
          <input id="bucket-name" placeholder="nombre-del-bucket" />
          <button type="submit">Crear bucket</button>
        </form>
        <ul id="bucket-list"></ul>
      </section>
      <section id="objects-panel" hidden>
        <h3 id="objects-title"></h3>
        <form id="put-object">
          <input id="object-key" placeholder="ruta/objeto.txt" />
          <textarea id="object-body" placeholder="contenido"></textarea>
          <button type="submit">Subir objeto</button>
        </form>
        <ul id="object-list"></ul>
      </section>
    </main>
    <pre id="log" aria-live="polite"></pre>
  `;

  const $ = (sel) => root.querySelector(sel);
  const log = (msg) => { $('#log').textContent += `${msg}\n`; };

  function renderBuckets() {
    const ul = $('#bucket-list');
    ul.innerHTML = '';
    for (const name of s3.listBuckets()) {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.textContent = name;
      btn.addEventListener('click', () => openBucket(name));
      const del = document.createElement('button');
      del.textContent = '🗑';
      del.addEventListener('click', () => {
        s3.deleteBucket(name);
        renderBuckets();
        $('#objects-panel').hidden = true;
      });
      li.append(btn, del);
      ul.append(li);
    }
  }

  function openBucket(name) {
    $('#objects-panel').hidden = false;
    $('#objects-title').textContent = `Objetos en ${name}`;
    renderObjects(name);
  }

  function renderObjects(bucket) {
    const ul = $('#object-list');
    ul.innerHTML = '';
    for (const obj of s3.listObjects(bucket)) {
      const li = document.createElement('li');
      const view = document.createElement('button');
      view.textContent = `${obj.key} → ${obj.body.slice(0, 24)}`;
      view.addEventListener('click', () => log(`${bucket}/${obj.key}: ${obj.body}`));
      const del = document.createElement('button');
      del.textContent = '🗑';
      del.addEventListener('click', () => {
        s3.deleteObject(bucket, obj.key);
        renderObjects(bucket);
      });
      li.append(view, del);
      ul.append(li);
    }
  }

  $('#create-bucket').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#bucket-name').value.trim().toLowerCase();
    if (!name) return;
    try {
      s3.createBucket(name);
      $('#bucket-name').value = '';
      renderBuckets();
    } catch (err) {
      log(`error: ${err.message}`);
    }
  });

  $('#put-object').addEventListener('submit', (e) => {
    e.preventDefault();
    const bucket = $('#objects-title').textContent.replace('Objetos en ', '');
    const key = $('#object-key').value.trim();
    const body = $('#object-body').value;
    if (!key) return;
    try {
      s3.putObject(bucket, key, body);
      $('#object-key').value = '';
      $('#object-body').value = '';
      renderObjects(bucket);
    } catch (err) {
      log(`error: ${err.message}`);
    }
  });

  // Render nav of registered services.
  const nav = $('#services');
  for (const svc of registry.list()) {
    const a = document.createElement('span');
    a.textContent = svc.name;
    a.title = svc.description;
    nav.append(a);
  }

  renderBuckets();
}

// Lazily create the storage adapter in the browser (localStorage) or memory (fallback).
function createStorageFor() {
  // Imported lazily to keep UI decoupled from a specific backend.
  // eslint-disable-next-line
  const mod = globalThis.localStorage
    ? null
    : null;
  // Use the factory from storage.js via dynamic import in main.js; here we bridge through registry.
  return globalThis.__waahStorage ? globalThis.__waahStorage('s3') : memoryFallback();
}

function memoryFallback() {
  // Minimal in-memory adapter if storage.js not wired (should not happen in prod).
  const m = new Map();
  return {
    get: (k) => (m.has(k) ? m.get(k) : null),
    set: (k, v) => m.set(k, v),
    delete: (k) => m.delete(k),
    keys: (p = '') => [...m.keys()].filter((k) => k.startsWith(p)),
    clear: () => m.clear(),
  };
}
