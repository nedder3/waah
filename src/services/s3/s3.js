// S3-like service: buckets + objects with prefix hierarchy, persisted via StorageAdapter.
// Pure logic — no DOM. The UI layer drives this and renders results.

const BUCKET_PREFIX = 'bucket:';
const OBJ_PREFIX = 'obj:';
// Prototype-grade validation: 1+ chars, starts alphanumeric, allows . and -.
// (AWS enforces 3-63; we keep it loose on purpose for a client-side prototype.)
const KEY_RE = /^[a-z0-9][a-z0-9.\-]*$/;

export class S3Service {
  constructor(adapter) {
    this._store = adapter;
  }

  _bucketKey(name) {
    return `${BUCKET_PREFIX}${name}`;
  }

  _objKey(bucket, key) {
    return `${OBJ_PREFIX}${bucket}/${key}`;
  }

  createBucket(name) {
    if (!KEY_RE.test(name)) {
      throw new Error(`Invalid bucket name: "${name}". Use 3-63 chars of [a-z0-9.-].`);
    }
    const k = this._bucketKey(name);
    if (this._store.get(k) !== null) return false;
    this._store.set(k, JSON.stringify({ name, createdAt: Date.now() }));
    return true;
  }

  listBuckets() {
    return this._store
      .keys(BUCKET_PREFIX)
      .map((k) => JSON.parse(this._store.get(k)).name)
      .sort();
  }

  deleteBucket(name) {
    const k = this._bucketKey(name);
    if (this._store.get(k) === null) return; // idempotent: no-op if absent
    // Remove all objects in this bucket.
    for (const ok of this._store.keys(`${OBJ_PREFIX}${name}/`)) {
      this._store.delete(ok);
    }
    this._store.delete(k);
  }

  _assertBucket(name) {
    if (this._store.get(this._bucketKey(name)) === null) {
      throw new Error(`Bucket "${name}" not found.`);
    }
  }

  putObject(bucket, key, body) {
    if (typeof key !== 'string' || key.length === 0) {
      throw new TypeError('Object key must be a non-empty string.');
    }
    if (typeof body !== 'string') {
      throw new TypeError('Body must be a string; serialize objects before putObject().');
    }
    this._assertBucket(bucket);
    this._store.set(this._objKey(bucket, key), JSON.stringify({ key, body }));
  }

  getObject(bucket, key) {
    const raw = this._store.get(this._objKey(bucket, key));
    return raw === null ? null : JSON.parse(raw);
  }

  listObjects(bucket, prefix = '') {
    if (this._store.get(this._bucketKey(bucket)) === null) return [];
    const fullPrefix = `${OBJ_PREFIX}${bucket}/${prefix}`;
    return this._store
      .keys(fullPrefix)
      .map((k) => JSON.parse(this._store.get(k)))
      .sort((a, b) => (a.key < b.key ? -1 : 1));
  }

  deleteObject(bucket, key) {
    this._store.delete(this._objKey(bucket, key));
  }
}
