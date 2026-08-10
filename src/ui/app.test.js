// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { ServiceRegistry } from '../core/registry.js';
import { S3Service } from '../services/s3/s3.js';
import { StoreService } from '../services/store/store.js';
import { IamService } from '../services/iam/iam.js';
import { LambdaService } from '../services/lambda/lambda.js';
import { Ec2Service } from '../services/ec2/ec2.js';
import { MemoryAdapter } from '../core/storage.js';
import { renderS3View } from './s3-view.js';
import { renderStoreView } from './store-view.js';
import { renderIamView } from './iam-view.js';
import { renderLambdaView } from './lambda-view.js';
import { renderEc2View } from './ec2-view.js';
import { mountApp } from './app.js';

function makeRegistry() {
  const registry = new ServiceRegistry();
  registry.register({ id: 's3', name: 'S3-like', description: '', factory: (a) => new S3Service(a), render: renderS3View });
  registry.register({ id: 'store', name: 'Store', description: '', factory: (a) => new StoreService(a), render: renderStoreView });
  registry.register({ id: 'iam', name: 'IAM', description: '', factory: (a) => new IamService(a), render: renderIamView });
  registry.register({ id: 'lambda', name: 'Lambda', description: '', factory: (a) => new LambdaService(a), render: renderLambdaView });
  registry.register({ id: 'ec2', name: 'EC2', description: '', factory: (a) => new Ec2Service(a), render: renderEc2View });
  return registry;
}

describe('UI shell (jsdom)', () => {
  let root;
  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  it('renders one tab per registered service and activates the first', () => {
    const registry = makeRegistry();
    mountApp(root, { registry });
    const tabs = root.querySelectorAll('#tabs button');
    expect(tabs.length).toBe(5);
    expect(tabs[0].classList.contains('active')).toBe(true);
    // First service (s3) view rendered.
    expect(root.querySelector('#s3-list')).not.toBeNull();
  });

  it('renders one tab per registered service (5) and activates the first', () => {
    const registry = makeRegistry();
    mountApp(root, { registry });
    expect(root.querySelectorAll('#tabs button').length).toBe(5);
    expect(root.querySelector('#s3-list')).not.toBeNull();
  });

  it('switches to each service view on tab click', () => {
    const registry = makeRegistry();
    mountApp(root, { registry });
    const click = (name) => [...root.querySelectorAll('#tabs button')].find((b) => b.textContent === name).click();
    click('Store');
    expect(root.querySelector('#store-list')).not.toBeNull();
    click('IAM');
    expect(root.querySelector('#iam-user-list')).not.toBeNull();
    click('Lambda');
    expect(root.querySelector('#lambda-list')).not.toBeNull();
    click('EC2');
    expect(root.querySelector('#ec2-list')).not.toBeNull();
  });

  it('end-to-end: create bucket via S3 view reflects in the rendered list', () => {
    const registry = makeRegistry();
    mountApp(root, { registry });
    const input = root.querySelector('#s3-name');
    input.value = 'demo';
    root.querySelector('#s3').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    // The UI re-renders from the same service instance it created, so the new
    // bucket shows up in the DOM — that is the observable contract.
    expect([...root.querySelectorAll('#s3-list li span')].some((s) => s.textContent === 'demo')).toBe(true);
  });
});
