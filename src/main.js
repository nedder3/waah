// Entry point: wires the service catalog + registry + UI shell.
import { ServiceRegistry } from './core/registry.js';
import { mountApp } from './ui/app.js';
import { SERVICES } from './services/index.js';

const registry = new ServiceRegistry();

// One registration per service in the catalog. The registry becomes the single
// source of truth the UI reads from — no service-specific code lives here.
for (const svc of SERVICES) {
  registry.register({
    id: svc.id,
    name: svc.name,
    description: svc.description,
    factory: (adapter) => new svc.ServiceClass(adapter),
    render: svc.render,
  });
}

const root = document.getElementById('app');
mountApp(root, { registry });
