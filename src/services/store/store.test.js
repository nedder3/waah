import { describe, it, expect } from 'vitest';
import { StoreService } from './store.js';
import { MemoryAdapter } from '../../core/storage.js';

function newStore() {
  return new StoreService(new MemoryAdapter('store-test'));
}

describe('StoreService — tables', () => {
  it('creates and lists tables', () => {
    const s = newStore();
    expect(s.createTable('users', 'id')).toBe(true);
    expect(s.listTables()).toEqual(['users']);
  });

  it('does not duplicate an existing table', () => {
    const s = newStore();
    s.createTable('users', 'id');
    expect(s.createTable('users', 'id')).toBe(false);
    expect(s.listTables()).toEqual(['users']);
  });

  it('throws on invalid table name', () => {
    const s = newStore();
    expect(() => s.createTable('', 'id')).toThrow(/invalid table name/i);
  });

  it('deletes a table and its items', () => {
    const s = newStore();
    s.createTable('users', 'id');
    s.putItem('users', { id: '1', name: 'a' });
    s.deleteTable('users');
    expect(s.listTables()).toEqual([]);
  });
});

describe('StoreService — items', () => {
  it('puts and gets an item by key', () => {
    const s = newStore();
    s.createTable('users', 'id');
    s.putItem('users', { id: '1', name: 'ana' });
    expect(s.getItem('users', '1')).toEqual({ id: '1', name: 'ana' });
  });

  it('overwrites an existing item', () => {
    const s = newStore();
    s.createTable('users', 'id');
    s.putItem('users', { id: '1', name: 'ana' });
    s.putItem('users', { id: '1', name: 'ana2' });
    expect(s.getItem('users', '1').name).toBe('ana2');
  });

  it('rejects an item missing the key field', () => {
    const s = newStore();
    s.createTable('users', 'id');
    expect(() => s.putItem('users', { name: 'x' })).toThrow(/missing key/i);
  });

  it('lists items in a table', () => {
    const s = newStore();
    s.createTable('users', 'id');
    s.putItem('users', { id: '1' });
    s.putItem('users', { id: '2' });
    expect(s.query('users').map((i) => i.id).sort()).toEqual(['1', '2']);
  });

  it('deletes an item', () => {
    const s = newStore();
    s.createTable('users', 'id');
    s.putItem('users', { id: '1' });
    s.deleteItem('users', '1');
    expect(s.getItem('users', '1')).toBeNull();
  });

  it('returns null getting an unknown item', () => {
    const s = newStore();
    s.createTable('users', 'id');
    expect(s.getItem('users', 'ghost')).toBeNull();
  });

  it('throws when putting into a missing table', () => {
    const s = newStore();
    expect(() => s.putItem('ghost', { id: '1' })).toThrow(/not found/i);
  });
});
