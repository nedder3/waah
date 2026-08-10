// Storage abstraction for WAHH.
//
// Services MUST NOT touch localStorage directly. They receive a StorageAdapter
// and persist serialized strings. At runtime we use LocalStorageAdapter (browser);
// in tests we inject MemoryAdapter so nothing depends on the DOM.

export class MemoryAdapter {
  constructor() {
    this._map = new Map();
  }

  get(key) {
    return this._map.has(key) ? this._map.get(key) : null;
  }

  set(key, value) {
    if (typeof value !== 'string') {
      throw new TypeError('StorageAdapter stores strings only; serialize before set().');
    }
    this._map.set(key, value);
  }

  delete(key) {
    this._map.delete(key);
  }

  keys(prefix = '') {
    const out = [];
    for (const k of this._map.keys()) {
      if (k.startsWith(prefix)) out.push(k);
    }
    return out;
  }

  clear() {
    this._map.clear();
  }
}

export class LocalStorageAdapter {
  constructor(namespace, backend) {
    this._ns = namespace;
    this._backend = backend || (typeof localStorage !== 'undefined' ? localStorage : null);
    if (!this._backend) {
      throw new Error('LocalStorageAdapter: no localStorage backend available.');
    }
  }

  _key(key) {
    return `${this._ns}:${key}`;
  }

  get(key) {
    const v = this._backend.getItem(this._key(key));
    return v === null || v === undefined ? null : v;
  }

  set(key, value) {
    if (typeof value !== 'string') {
      throw new TypeError('StorageAdapter stores strings only; serialize before set().');
    }
    this._backend.setItem(this._key(key), value);
  }

  delete(key) {
    this._backend.removeItem(this._key(key));
  }

  keys(prefix = '') {
    const full = prefix ? this._key(prefix) : `${this._ns}:`;
    const out = [];
    for (let i = 0; i < this._backend.length; i++) {
      const k = this._backend.key(i);
      if (k && k.startsWith(full)) out.push(k);
    }
    return out;
  }

  clear() {
    const owned = this.keys();
    for (const k of owned) this._backend.removeItem(k);
  }
}

// Factory: prefer localStorage in the browser, fall back to memory (e.g. SSR/tests
// where localStorage is unavailable but the caller still wants an adapter).
export function createAdapter(namespace) {
  if (typeof localStorage !== 'undefined' && localStorage) {
    try {
      return new LocalStorageAdapter(namespace);
    } catch {
      return new MemoryAdapter();
    }
  }
  return new MemoryAdapter();
}
