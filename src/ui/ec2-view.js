// EC2 view: instances lifecycle, built on the shared CRUD helper.
// The helper renders the instance list (create/delete); start/stop are per-row
// actions wired via rowActions.
import { renderCrudView } from './crud-view.js';

export function renderEc2View(container, ec2) {
  renderCrudView(container, {
    title: 'EC2 — Instancias',
    formId: 'ec2',
    submitLabel: 'Lanzar instancia',
    fields: [{ name: 'type', placeholder: 'tipo (t2.micro)', value: 't2.micro' }],
    create: (vals) => ec2.launch(vals.type),
    list: () => ec2.listInstances().map((i) => ({ key: i.id, label: `${i.id} [${i.type}] → ${i.state}` })),
    onDelete: (id) => ec2.terminate(id),
    emptyText: 'Sin instancias.',
    rowActions: (item, refresh) => {
      const id = item.key;
      const running = item.label.includes('→ running');
      return [{
        label: running ? 'stop' : 'start',
        onClick: () => { running ? ec2.stop(id) : ec2.start(id); refresh(); },
      }];
    },
  });
}
