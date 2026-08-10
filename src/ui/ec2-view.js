// EC2 view: instances lifecycle (launch/stop/start/terminate). Receives service.
export function renderEc2View(container, ec2) {
  container.innerHTML = `
    <h2>EC2</h2>
    <form id="ec2-launch">
      <input id="ec2-type" placeholder="tipo (t2.micro)" value="t2.micro" />
      <button type="submit">Lanzar instancia</button>
    </form>
    <ul id="ec2-list"></ul>
    <pre id="ec2-log" aria-live="polite"></pre>
  `;

  const $ = (sel) => container.querySelector(sel);
  const log = (m) => { $('#ec2-log').textContent += `${m}\n`; };

  function render() {
    const ul = $('#ec2-list'); ul.innerHTML = '';
    for (const inst of ec2.listInstances()) {
      const li = document.createElement('li');
      const span = document.createElement('span');
      span.textContent = `${inst.id} [${inst.type}] → ${inst.state}`;
      const ctrl = document.createElement('span');
      if (inst.state === 'running') {
        const stop = document.createElement('button'); stop.textContent = 'stop';
        stop.addEventListener('click', () => { ec2.stop(inst.id); render(); });
        ctrl.append(stop);
      } else {
        const start = document.createElement('button'); start.textContent = 'start';
        start.addEventListener('click', () => { ec2.start(inst.id); render(); });
        ctrl.append(start);
      }
      const del = document.createElement('button'); del.textContent = '🗑';
      del.addEventListener('click', () => { ec2.terminate(inst.id); render(); });
      li.append(span, ctrl, del); ul.append(li);
    }
  }

  $('#ec2-launch').addEventListener('submit', (e) => {
    e.preventDefault();
    const t = $('#ec2-type').value.trim();
    if (!t) return;
    try { ec2.launch(t); $('#ec2-type').value = 't2.micro'; render(); }
    catch (err) { log(`error: ${err.message}`); }
  });

  render();
}
