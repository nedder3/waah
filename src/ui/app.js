// UI shell: tabs per registered service.
// Reads EVERYTHING from the ServiceRegistry: tab list, factory and render fn.
// The registry is the single source of truth — nothing is hardcoded here.
import { createAdapter } from '../core/storage.js';

export function mountApp(root, { registry }) {
  root.innerHTML = `
    <header>
      <h1>WHAAH <small>We Have AWS At Home</small></h1>
    </header>
    <nav id="tabs"></nav>
    <main id="view"></main>
  `;

  const tabs = root.querySelector('#tabs');
  const view = root.querySelector('#view');

  // One tab per registered service, in registration order.
  const defs = registry.list();
  defs.forEach((def) => {
    const btn = document.createElement('button');
    btn.textContent = def.name;
    btn.className = 'tab';
    btn.title = def.description;
    btn.addEventListener('click', () => activate(def.id));
    tabs.append(btn);
  });

  function activate(id) {
    const def = registry.get(id);
    [...tabs.children].forEach((b) => b.classList.toggle('active', b.textContent === def.name));
    // Build the service instance on demand with its own storage namespace.
    const instance = registry.create(id, createAdapter(def.id));
    view.innerHTML = '';
    if (def.render) def.render(view, instance);
    else view.textContent = `El servicio "${def.name}" no tiene vista implementada.`;
  }

  if (defs.length) activate(defs[0].id);
}
