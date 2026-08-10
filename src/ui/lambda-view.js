// Lambda view: functions + invocation log. Receives the service instance.
export function renderLambdaView(container, lambda) {
  container.innerHTML = `
    <h2>Lambda</h2>
    <form id="lambda-create-fn">
      <input id="lambda-fn-name" placeholder="nombre-fn" />
      <input id="lambda-fn-runtime" placeholder="runtime" value="node18" />
      <button type="submit">Crear función</button>
    </form>
    <ul id="lambda-fn-list"></ul>
    <section id="lambda-invoke" hidden>
      <h3 id="lambda-invoke-title"></h3>
      <form id="lambda-invoke-form">
        <textarea id="lambda-input" placeholder='{"input":"hola"}'></textarea>
        <button type="submit">Invocar</button>
      </form>
      <ul id="lambda-inv-list"></ul>
    </section>
    <pre id="lambda-log" aria-live="polite"></pre>
  `;

  const $ = (sel) => container.querySelector(sel);
  const log = (m) => { $('#lambda-log').textContent += `${m}\n`; };

  function renderFns() {
    const ul = $('#lambda-fn-list'); ul.innerHTML = '';
    for (const name of lambda.listFunctions()) {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.textContent = `${name} (${lambda.getFunction(name).runtime})`;
      btn.addEventListener('click', () => openFn(name));
      const del = document.createElement('button'); del.textContent = '🗑';
      del.addEventListener('click', () => { lambda.deleteFunction(name); renderFns(); $('#lambda-invoke').hidden = true; });
      li.append(btn, del); ul.append(li);
    }
  }

  function openFn(name) {
    $('#lambda-invoke').hidden = false;
    $('#lambda-invoke-title').textContent = `Invocar ${name}`;
    renderInvs(name);
  }

  function renderInvs(name) {
    const ul = $('#lambda-inv-list'); ul.innerHTML = '';
    for (const rec of lambda.invocationsOf(name)) {
      const li = document.createElement('li');
      li.textContent = `${rec.requestId}: ${JSON.stringify(rec.input)} → ${rec.status}`;
      ul.append(li);
    }
  }

  $('#lambda-create-fn').addEventListener('submit', (e) => {
    e.preventDefault();
    const n = $('#lambda-fn-name').value.trim().toLowerCase();
    const rt = $('#lambda-fn-runtime').value.trim();
    if (!n || !rt) return;
    try { lambda.createFunction(n, rt); $('#lambda-fn-name').value = ''; renderFns(); }
    catch (err) { log(`error: ${err.message}`); }
  });

  $('#lambda-invoke-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#lambda-invoke-title').textContent.replace('Invocar ', '');
    const text = $('#lambda-input').value.trim() || '{}';
    try {
      const input = JSON.parse(text);
      const res = lambda.invoke(name, input);
      $('#lambda-input').value = '';
      log(`→ ${res.requestId}`);
      renderInvs(name);
    } catch (err) { log(`error: ${err.message}`); }
  });

  renderFns();
}
