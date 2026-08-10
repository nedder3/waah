import { describe, it, expect } from 'vitest';
import { Ec2Service } from '../../src/services/ec2/ec2.js';
import { MemoryAdapter } from '../../src/core/storage.js';
import { ej1_lanzar, ej2_pararArrancar, ej3_terminar } from './ec2.exercise.js';

function newEc2() { return new Ec2Service(new MemoryAdapter('ec2-ex')); }

describe('EC2 — ejercicios', () => {
  it('ej1: lanzar instancia', () => {
    const ec2 = newEc2();
    const id = ej1_lanzar(ec2);
    expect(ec2.describe(id).state).toBe('running');
  });

  it('ej2: parar y arrancar', () => {
    const ec2 = newEc2();
    const id = ej1_lanzar(ec2);
    expect(ej2_pararArrancar(ec2, id)).toBe('running');
  });

  it('ej3: terminar instancia', () => {
    const ec2 = newEc2();
    const id = ej1_lanzar(ec2);
    expect(ej3_terminar(ec2, id)).toBeNull();
  });
});
