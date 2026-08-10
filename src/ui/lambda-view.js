// Lambda view: functions + invocation log, built on the shared CRUD helper.
// The helper renders the function list (create/delete). Clicking a function
// opens an invocation panel (textarea + history) managed by this view.
import { renderCrudView } from './crud-view.js';

export function renderLambdaView(container, lambda) {
  let openFn = null;

  function renderInvokePanel() {
    const panel = container.querySelector('#lambda-invoke');
    if (!openFn) { panel.hidden = true; return; }
    panel.hidden = false;
    container.querySelector('#lambda-invoke-title').textContent = `Invocar ${openFn}`;
    const ul = container.querySelector('#lambda-inv-list');
    ul.innerHTML = '';
    for (const rec of lambda.invocationsOf(openFn)) {
      const li = document.createElement('li');
      li.textContent = `${rec.requestId}: ${JSON.stringify(rec.input)} → ${rec.status}`;
      ul.append(li);
    }
  }

  renderCrudView(container, {
    title: 'Lambda — Funciones',
    formId: 'lambda',
    submitLabel: 'Crear función',
    fields: [
      { name: 'name', placeholder: 'nombre-fn' },
      { name: 'runtime', placeholder: 'runtime', value: 'node18' },
    ],
    create: (vals) => lambda.createFunction(vals.name, vals.runtime),
    list: () => lambda.listFunctions().map((n) => ({ key: n, label: `${n} (${lambda.getFunction(n).runtime})` })),
    onDelete: (n) => { if (openFn === n) openFn = null; lambda.deleteFunction(n); },
    emptyText: 'Sin funciones.',
    rowActions: (item, refresh) => [{
      label: 'abrir',
      onClick: () => { openFn = item.key; renderInvokePanel(); },
    }],
    onChange: () => renderInvokePanel(),
  });

  // Invocation panel lives below the helper's output.
  const helper = container.querySelector('.crud-log');
  const panel = document.createElement('section');
  panel.id = 'lambda-invoke';
  panel.hidden = true;
  panel.innerHTML = `
    <h4 id="lambda-invoke-title"></h4>
    <form id="lambda-invoke-form">
      <textarea id="lambda-input" placeholder='{"input":"hola"}'></textarea>
      <button type="submit">Invocar</button>
    </form>
    <ul id="lambda-inv-list"></ul>
  `;
  container.insertBefore(panel, helper);

  panel.querySelector('#lambda-invoke-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!openFn) return;
    const text = panel.querySelector('#lambda-input').value.trim() || '{}';
    try {
      const input = JSON.parse(text);
      lambda.invoke(openFn, input);
      panel.querySelector('#lambda-input').value = '';
      renderInvokePanel();
    } catch (err) {
      helper.textContent += `error: ${err.message}\n`;
    }
  });

  renderInvokePanel();
}
