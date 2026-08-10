// Entry point: wires storage + registry + services + views.
import { createAdapter } from './core/storage.js';
import { ServiceRegistry } from './core/registry.js';
import { S3Service } from './services/s3/s3.js';
import { StoreService } from './services/store/store.js';
import { IamService } from './services/iam/iam.js';
import { LambdaService } from './services/lambda/lambda.js';
import { Ec2Service } from './services/ec2/ec2.js';
import { renderS3View } from './ui/s3-view.js';
import { renderStoreView } from './ui/store-view.js';
import { renderIamView } from './ui/iam-view.js';
import { renderLambdaView } from './ui/lambda-view.js';
import { renderEc2View } from './ui/ec2-view.js';
import { mountApp } from './ui/app.js';

const registry = new ServiceRegistry();

// Each registration carries the service factory plus its UI render fn.
// The shell instantiates the service with its own storage adapter namespace.
function bind(id, name, description, ServiceClass, render) {
  registry.register({
    id,
    name,
    description,
    factory: (adapter) => new ServiceClass(adapter),
  });
  // Keep render alongside the instance; the registry intentionally stores only
  // service metadata, not UI concerns.
  renders[id] = render;
}

const renders = {};
bind('s3', 'S3-like', 'Buckets y objetos', S3Service, renderS3View);
bind('store', 'Store', 'Tablas key-value (Dynamo-like)', StoreService, renderStoreView);
bind('iam', 'IAM', 'Usuarios, roles y policies', IamService, renderIamView);
bind('lambda', 'Lambda', 'Funciones y ejecución', LambdaService, renderLambdaView);
bind('ec2', 'EC2', 'Instancias virtuales', Ec2Service, renderEc2View);

// Build instance map: each service gets its own storage namespace.
const services = {};
for (const def of registry.list()) {
  const adapter = createAdapter(def.id);
  services[def.id] = { instance: registry.create(def.id, adapter), render: renders[def.id] };
}

const root = document.getElementById('app');
mountApp(root, { registry, services });
