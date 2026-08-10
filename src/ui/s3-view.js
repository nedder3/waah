// S3 view: renders the S3-like service into a container element.
// Receives the service instance (already constructed with its adapter).
export function renderS3View(container, s3) {
  container.innerHTML = `
    <h2>Buckets (S3-like)</h2>
    <form id="s3-create-bucket">
      <input id="s3-bucket-name" placeholder="nombre-del-bucket" />
      <button type="submit">Crear bucket</button>
    </form>
    <ul id="s3-bucket-list"></ul>
    <section id="s3-objects" hidden>
      <h3 id="s3-objects-title"></h3>
      <form id="s3-put-object">
        <input id="s3-object-key" placeholder="ruta/objeto.txt" />
        <textarea id="s3-object-body" placeholder="contenido"></textarea>
        <button type="submit">Subir objeto</button>
      </form>
      <ul id="s3-object-list"></ul>
    </section>
    <pre id="s3-log" aria-live="polite"></pre>
  `;

  const $ = (sel) => container.querySelector(sel);
  const log = (msg) => { $('#s3-log').textContent += `${msg}\n`; };

  function renderBuckets() {
    const ul = $('#s3-bucket-list');
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
        $('#s3-objects').hidden = true;
      });
      li.append(btn, del);
      ul.append(li);
    }
  }

  function openBucket(name) {
    $('#s3-objects').hidden = false;
    $('#s3-objects-title').textContent = `Objetos en ${name}`;
    renderObjects(name);
  }

  function renderObjects(bucket) {
    const ul = $('#s3-object-list');
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

  $('#s3-create-bucket').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#s3-bucket-name').value.trim().toLowerCase();
    if (!name) return;
    try {
      s3.createBucket(name);
      $('#s3-bucket-name').value = '';
      renderBuckets();
    } catch (err) {
      log(`error: ${err.message}`);
    }
  });

  $('#s3-put-object').addEventListener('submit', (e) => {
    e.preventDefault();
    const bucket = $('#s3-objects-title').textContent.replace('Objetos en ', '');
    const key = $('#s3-object-key').value.trim();
    const body = $('#s3-object-body').value;
    if (!key) return;
    try {
      s3.putObject(bucket, key, body);
      $('#s3-object-key').value = '';
      $('#s3-object-body').value = '';
      renderObjects(bucket);
    } catch (err) {
      log(`error: ${err.message}`);
    }
  });

  renderBuckets();
}
