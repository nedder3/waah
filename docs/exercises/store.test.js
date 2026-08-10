import { describe, it, expect } from 'vitest';
import { StoreService } from '../../src/services/store/store.js';
import { MemoryAdapter } from '../../src/core/storage.js';
import { ej1_crearTablaEInsertar, ej2_leerItem, ej3_insertarYListar } from './store.exercise.js';

function newStore() { return new StoreService(new MemoryAdapter('store-ex')); }

describe('Store — ejercicios', () => {
  it('ej1: crear tabla e insertar', () => {
    const store = newStore();
    ej1_crearTablaEInsertar(store);
    expect(store.listTables()).toContain('usuarios');
    expect(store.getItem('usuarios', '1').nombre).toBe('Ana');
  });

  it('ej2: leer item por clave', () => {
    const store = newStore();
    ej1_crearTablaEInsertar(store);
    expect(ej2_leerItem(store)).toBe('Ana');
  });

  it('ej3: insertar y listar', () => {
    const store = newStore();
    ej1_crearTablaEInsertar(store);
    expect(ej3_insertarYListar(store)).toBe(3);
  });
});
