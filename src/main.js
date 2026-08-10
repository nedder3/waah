// Entry point: wires storage + registry + S3 service + UI.
import { createAdapter } from './core/storage.js';
import { ServiceRegistry } from './core/registry.js';
import { S3Service } from './services/s3/s3.js';
import { mountApp } from './ui/app.js';

const registry = new ServiceRegistry();
registry.register({
  id: 's3',
  name: 'S3-like',
  description: 'Buckets y objetos en memoria/localStorage',
  factory: (adapter) => new S3Service(adapter),
});

// The UI needs an adapter per service; expose a factory that the app.js bridge uses.
const adapterFor = (namespace) => createAdapter(namespace);
globalThis.__waahStorage = adapterFor;

const root = document.getElementById('app');
mountApp(root, { registry });
