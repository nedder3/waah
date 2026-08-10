// LambdaService: functions + in-memory invocation log (prototype-grade).
// Pure logic — no DOM. Invocation is simulated (no real JS eval): it records an
// event + a synthetic result, since running arbitrary code client-side is out of
// scope for the prototype. Persists via StorageAdapter.
//
// Storage keys:
//   fn:<name>            -> JSON function config { name, runtime, createdAt }
//   inv:<name>:<reqId>   -> JSON invocation record

const FN_PREFIX = 'fn:';
const INV_PREFIX = 'inv:';
const NAME_RE = /^[a-z0-9][a-z0-9.\-_]*$/;

function makeRequestId() {
  return 'req-' + Math.random().toString(36).slice(2, 10);
}

export class LambdaService {
  constructor(adapter) {
    this._store = adapter;
  }

  _fnKey(name) { return `${FN_PREFIX}${name}`; }
  _invKey(name, reqId) { return `${INV_PREFIX}${name}:${reqId}`; }

  createFunction(name, runtime) {
    if (!NAME_RE.test(name)) throw new Error(`Invalid function name: "${name}".`);
    if (typeof runtime !== 'string' || !runtime) throw new TypeError('runtime must be a non-empty string.');
    const k = this._fnKey(name);
    if (this._store.get(k) !== null) return false;
    this._store.set(k, JSON.stringify({ name, runtime, createdAt: Date.now() }));
    return true;
  }

  listFunctions() {
    return this._store.keys(FN_PREFIX).map((k) => JSON.parse(this._store.get(k)).name).sort();
  }

  getFunction(name) {
    const raw = this._store.get(this._fnKey(name));
    return raw === null ? null : JSON.parse(raw);
  }

  deleteFunction(name) {
    const k = this._fnKey(name);
    if (this._store.get(k) === null) return;
    // Drop invocation history for this function.
    for (const ik of this._store.keys(`${INV_PREFIX}${name}:`)) this._store.delete(ik);
    this._store.delete(k);
  }

  _assertFn(name) {
    if (this._store.get(this._fnKey(name)) === null) throw new Error(`Function "${name}" not found.`);
  }

  invoke(name, input) {
    this._assertFn(name);
    const reqId = makeRequestId();
    // Simulated execution: prototype records the event and a synthetic payload.
    const record = {
      requestId: reqId,
      functionName: name,
      input: input === undefined ? null : input,
      status: 'ok',
      timestamp: Date.now(),
    };
    this._store.set(this._invKey(name, reqId), JSON.stringify(record));
    return { status: record.status, requestId: reqId };
  }

  invocationsOf(name) {
    this._assertFn(name);
    return this._store
      .keys(`${INV_PREFIX}${name}:`)
      .map((k) => JSON.parse(this._store.get(k)))
      .sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));
  }
}
