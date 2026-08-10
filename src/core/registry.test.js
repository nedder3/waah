import { describe, it, expect } from 'vitest';
import { ServiceRegistry } from './registry.js';

describe('ServiceRegistry', () => {
  it('registers and looks up a service by id', () => {
    const r = new ServiceRegistry();
    const factory = () => ({ id: 's3' });
    r.register({ id: 's3', name: 'S3-like', description: 'buckets', factory });
    const def = r.get('s3');
    expect(def.id).toBe('s3');
    expect(def.factory).toBe(factory);
  });

  it('throws when registering a duplicate id', () => {
    const r = new ServiceRegistry();
    r.register({ id: 's3', name: 'S3', description: 'x', factory: () => ({}) });
    expect(() => r.register({ id: 's3', name: 'S3', description: 'x', factory: () => ({}) }))
      .toThrow(/already registered/);
  });

  it('throws when looking up an unknown service', () => {
    const r = new ServiceRegistry();
    expect(() => r.get('nope')).toThrow(/not registered/);
  });

  it('lists all registered definitions (id, name, description)', () => {
    const r = new ServiceRegistry();
    r.register({ id: 's3', name: 'S3', description: 'a', factory: () => ({}) });
    r.register({ id: 'store', name: 'Store', description: 'b', factory: () => ({}) });
    const list = r.list();
    expect(list.map((d) => d.id)).toEqual(['s3', 'store']);
    // factory should not be required in list shape but can be present
    for (const d of list) expect(typeof d.name).toBe('string');
  });

  it('builds an instance via factory', () => {
    const r = new ServiceRegistry();
    r.register({ id: 's3', name: 'S3', description: 'a', factory: (adapter) => ({ adapter }) });
    const inst = r.create('s3', { tag: 'mem' });
    expect(inst.adapter).toEqual({ tag: 'mem' });
  });
});
