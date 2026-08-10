// UI shell: tabs per registered service. Each service exposes a render(root, instance)
// function in its ui module. The shell owns tab switching only.
export function mountApp(root, { registry, services }) {
  root.innerHTML = `
    <header>
      <h1>WAHH <small>We Have AWS At Home</small></h1>
    </header>
    <nav id="tabs"></nav>
    <main id="view"></main>
  `;

  const tabs = root.querySelector('#tabs');
  const view = root.querySelector('#view');

  // Build a tab per registered service.
  const defs = registry.list();
  defs.forEach((def, idx) => {
    const btn = document.createElement('button');
    btn.textContent = def.name;
    btn.className = 'tab';
    btn.addEventListener('click', () => activate(def.id));
    tabs.append(btn);
  });

  function activate(id) {
    [...tabs.children].forEach((b) => b.classList.remove('active'));
    const activeBtn = [...tabs.children].find((b) => b.textContent === registry.get(id).name);
    if (activeBtn) activeBtn.classList.add('active');
    const entry = services[id];
    view.innerHTML = '';
    entry.render(view, entry.instance);
  }

  if (defs.length) activate(defs[0].id);
}
