// Ec2Service: virtual instances with lifecycle state, in memory (prototype-grade).
// Pure logic — no DOM. Persists via StorageAdapter.
//
// States: pending -> running -> stopped -> (terminated removes the record).
// Storage key: inst:<id> -> JSON instance record.

const INST_PREFIX = 'inst:';
// Prototype-grade: instance type is any non-empty alnum token with . or -.
const TYPE_RE = /^[a-z0-9][a-z0-9.\-]*$/;

function makeInstanceId() {
  return 'i-' + Math.random().toString(36).slice(2, 12);
}

export class Ec2Service {
  constructor(adapter) {
    this._store = adapter;
  }

  _instKey(id) { return `${INST_PREFIX}${id}`; }

  launch(type) {
    if (!TYPE_RE.test(type)) throw new Error(`Invalid instance type: "${type}".`);
    const id = makeInstanceId();
    this._store.set(
      this._instKey(id),
      JSON.stringify({ id, type, state: 'running', launchedAt: Date.now() })
    );
    return id;
  }

  listInstances() {
    return this._store
      .keys(INST_PREFIX)
      .map((k) => JSON.parse(this._store.get(k)))
      .sort((a, b) => (a.id < b.id ? -1 : 1));
  }

  describe(id) {
    const raw = this._store.get(this._instKey(id));
    return raw === null ? null : JSON.parse(raw);
  }

  _assertInst(id) {
    if (this._store.get(this._instKey(id)) === null) throw new Error(`Instance "${id}" not found.`);
  }

  stop(id) {
    this._assertInst(id);
    const rec = JSON.parse(this._store.get(this._instKey(id)));
    rec.state = 'stopped';
    this._store.set(this._instKey(id), JSON.stringify(rec));
  }

  start(id) {
    this._assertInst(id);
    const rec = JSON.parse(this._store.get(this._instKey(id)));
    rec.state = 'running';
    this._store.set(this._instKey(id), JSON.stringify(rec));
  }

  terminate(id) {
    this._assertInst(id);
    this._store.delete(this._instKey(id));
  }
}
