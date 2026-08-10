import { describe, it, expect } from 'vitest';
import { MemoryAdapter, LocalStorageAdapter, createAdapter } from './storage.js';

describe('MemoryAdapter', () => {
  it('stores and retrieves a string value', () => {
    const a = new MemoryAdapter();
    a.set('k', 'v');
    expect(a.get('k')).toBe('v');
  });

  it('returns null for missing keys', () => {
    const a = new MemoryAdapter();
    expect(a.get('missing')).toBeNull();
  });

  it('deletes keys', () => {
    const a = new MemoryAdapter();
    a.set('k', 'v');
    a.delete('k');
    expect(a.get('k')).toBeNull();
  });

  it('lists keys with optional prefix', () => {
    const a = new MemoryAdapter();
    a.set('waah:one', '1');
    a.set('waah:two', '2');
    a.set('other:three', '3');
    expect(a.keys('waah:').sort()).toEqual(['waah:one', 'waah:two']);
  });

  it('clears all keys', () => {
    const a = new MemoryAdapter();
    a.set('a', '1');
    a.set('b', '2');
    a.clear();
    expect(a.keys()).toEqual([]);
  });
});

// Minimal fake implementing the subset of the Web Storage API the adapter uses,
// so we test namespacing/logic without jsdom.
class FakeLocalStorage {
  constructor() { this._m = new Map(); }
  getItem(k) { return this._m.has(k) ? this._m.get(k) : null; }
  setItem(k, v) { this._m.set(k, String(v)); }
  removeItem(k) { this._m.delete(k); }
  key(i) { return [...this._m.keys()][i] ?? null; }
  get length() { return this._m.size; }
}

describe('LocalStorageAdapter', () => {
  it('round-trips a value through a namespaced localStorage', () => {
    const backend = new FakeLocalStorage();
    const a = new LocalStorageAdapter('test-ns', backend);
    a.set('file', 'content');
    expect(a.get('file')).toBe('content');
    expect(backend.getItem('test-ns:file')).toBe('content');
  });

  it('deletes and reports missing keys', () => {
    const a = new LocalStorageAdapter('test-ns', new FakeLocalStorage());
    a.set('x', '1');
    a.delete('x');
    expect(a.get('x')).toBeNull();
  });

  it('keys are namespaced', () => {
    const a = new LocalStorageAdapter('ns', new FakeLocalStorage());
    a.set('a', '1');
    a.set('b', '2');
    expect(a.keys().sort()).toEqual(['ns:a', 'ns:b']);
  });
});

describe('createAdapter', () => {
  it('returns MemoryAdapter when no backend available', () => {
    const a = createAdapter('x');
    expect(a).toBeInstanceOf(MemoryAdapter);
  });
});
