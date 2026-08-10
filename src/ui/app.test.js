// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { ServiceRegistry } from '../core/registry.js';
import { S3Service } from '../services/s3/s3.js';
import { StoreService } from '../services/store/store.js';
import { MemoryAdapter } from '../core/storage.js';
import { renderS3View } from './s3-view.js';
import { renderStoreView } from './store-view.js';
import { mountApp } from './app.js';

function makeServices() {
  const registry = new ServiceRegistry();
  registry.register({ id: 's3', name: 'S3-like', description: '', factory: (a) => new S3Service(a), render: renderS3View });
  registry.register({ id: 'store', name: 'Store', description: '', factory: (a) => new StoreService(a), render: renderStoreView });
  const renders = { s3: renderS3View, store: renderStoreView };
  const services = {};
  for (const def of registry.list()) {
    const adapter = new MemoryAdapter(def.id);
    services[def.id] = { instance: registry.create(def.id, adapter), render: renders[def.id] };
  }
  return { registry, services };
}

describe('UI shell (jsdom)', () => {
  let root;
  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  it('renders one tab per registered service and activates the first', () => {
    const { registry, services } = makeServices();
    mountApp(root, { registry, services });
    const tabs = root.querySelectorAll('#tabs button');
    expect(tabs.length).toBe(2);
    expect(tabs[0].classList.contains('active')).toBe(true);
    // First service (s3) view rendered.
    expect(root.querySelector('#s3-bucket-list')).not.toBeNull();
  });

  it('switches views when a tab is clicked', () => {
    const { registry, services } = makeServices();
    mountApp(root, { registry, services });
    const storeTab = [...root.querySelectorAll('#tabs button')].find((b) => b.textContent === 'Store');
    storeTab.click();
    expect(root.querySelector('#store-table-list')).not.toBeNull();
    expect(root.querySelector('#s3-bucket-list')).toBeNull();
  });

  it('end-to-end: create bucket via S3 view reflects in service state', () => {
    const { registry, services } = makeServices();
    mountApp(root, { registry, services });
    const input = root.querySelector('#s3-bucket-name');
    input.value = 'demo';
    root.querySelector('#s3-create-bucket').dispatchEvent(new Event('submit', { cancelable: true }));
    expect(services.s3.instance.listBuckets()).toContain('demo');
    expect([...root.querySelectorAll('#s3-bucket-list li button')].some((b) => b.textContent === 'demo')).toBe(true);
  });
});
