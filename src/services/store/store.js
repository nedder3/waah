// StoreService: Dynamo-like table store (partition key only, prototype-grade).
// Pure logic — no DOM. Persists via StorageAdapter.
//
// Key design: a table has a single partition key (string field name). Items are
// JSON objects that MUST contain that field. Items are stored at
// `item:<table>/<keyValue>`. Table metadata at `table:<name>`.

const TABLE_PREFIX = 'table:';
const ITEM_PREFIX = 'item:';
const NAME_RE = /^[a-z0-9][a-z0-9.\-]*$/;

export class StoreService {
  constructor(adapter) {
    this._store = adapter;
  }

  _tableKey(name) {
    return `${TABLE_PREFIX}${name}`;
  }

  _itemKey(table, keyValue) {
    return `${ITEM_PREFIX}${table}/${keyValue}`;
  }

  createTable(name, keyField) {
    if (!NAME_RE.test(name)) {
      throw new Error(`Invalid table name: "${name}". Use 1+ chars of [a-z0-9.-].`);
    }
    if (typeof keyField !== 'string' || keyField.length === 0) {
      throw new TypeError('keyField must be a non-empty string (the partition key).');
    }
    const k = this._tableKey(name);
    if (this._store.get(k) !== null) return false;
    this._store.set(k, JSON.stringify({ name, keyField, createdAt: Date.now() }));
    return true;
  }

  listTables() {
    return this._store
      .keys(TABLE_PREFIX)
      .map((k) => JSON.parse(this._store.get(k)).name)
      .sort();
  }

  deleteTable(name) {
    const k = this._tableKey(name);
    if (this._store.get(k) === null) return;
    for (const ik of this._store.keys(`${ITEM_PREFIX}${name}/`)) {
      this._store.delete(ik);
    }
    this._store.delete(k);
  }

  _tableMeta(name) {
    const raw = this._store.get(this._tableKey(name));
    if (raw === null) throw new Error(`Table "${name}" not found.`);
    return JSON.parse(raw);
  }

  // Public accessor for a table's partition key field name (used by UI).
  keyFieldOf(table) {
    return this._tableMeta(table).keyField;
  }

  putItem(table, item) {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      throw new TypeError('Item must be a plain object.');
    }
    const meta = this._tableMeta(table);
    const keyValue = item[meta.keyField];
    if (keyValue === undefined || keyValue === null) {
      throw new Error(`Item missing key field "${meta.keyField}".`);
    }
    this._store.set(this._itemKey(table, String(keyValue)), JSON.stringify(item));
  }

  getItem(table, keyValue) {
    const raw = this._store.get(this._itemKey(table, String(keyValue)));
    return raw === null ? null : JSON.parse(raw);
  }

  query(table, prefix = '') {
    const meta = this._tableMeta(table); // throws if missing
    const full = `${ITEM_PREFIX}${table}/${prefix}`;
    const kf = meta.keyField;
    return this._store
      .keys(full)
      .map((k) => JSON.parse(this._store.get(k)))
      .sort((a, b) => {
        const ka = String(a[kf]);
        const kb = String(b[kf]);
        return ka < kb ? -1 : 1;
      });
  }

  deleteItem(table, keyValue) {
    this._store.delete(this._itemKey(table, String(keyValue)));
  }
}
