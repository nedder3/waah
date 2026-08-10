import { describe, it, expect } from 'vitest';
import { IamService } from '../../src/services/iam/iam.js';
import { MemoryAdapter } from '../../src/core/storage.js';
import { ej1_usuarioYRol, ej2_adjuntar, ej3_separar } from './iam.exercise.js';

function newIam() { return new IamService(new MemoryAdapter('iam-ex')); }

describe('IAM — ejercicios', () => {
  it('ej1: usuario y rol con política', () => {
    const iam = newIam();
    ej1_usuarioYRol(iam);
    expect(iam.listUsers()).toContain('ana');
    expect(iam.listRoles()).toContain('admin');
    expect(iam.getPolicy('admin').statements[0].effect).toBe('Allow');
  });

  it('ej2: adjuntar rol a usuario', () => {
    const iam = newIam();
    ej1_usuarioYRol(iam);
    expect(ej2_adjuntar(iam)).toEqual(['admin']);
  });

  it('ej3: usuario con dos roles', () => {
    const iam = newIam();
    ej1_usuarioYRol(iam);
    ej2_adjuntar(iam);
    expect(ej3_separar(iam)).toBe(2);
  });
});
