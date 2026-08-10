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

  it('stores and exposes an optional render fn', () => {
    const r = new ServiceRegistry();
    const render = () => {};
    r.register({ id: 's3', name: 'S3', description: 'a', factory: () => ({}), render });
    expect(r.get('s3').render).toBe(render);
    expect(r.list()[0].render).toBe(render);
  });

  it('treats a missing render as null (not a function)', () => {
    const r = new ServiceRegistry();
    r.register({ id: 's3', name: 'S3', description: 'a', factory: () => ({}) });
    expect(r.get('s3').render).toBeNull();
  });

  it('builds an instance via factory', () => {
    const r = new ServiceRegistry();
    r.register({ id: 's3', name: 'S3', description: 'a', factory: (adapter) => ({ adapter }) });
    const inst = r.create('s3', { tag: 'mem' });
    expect(inst.adapter).toEqual({ tag: 'mem' });
  });
});
