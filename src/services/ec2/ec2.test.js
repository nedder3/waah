import { describe, it, expect } from 'vitest';
import { Ec2Service } from './ec2.js';
import { MemoryAdapter } from '../../core/storage.js';

function newEc2() {
  return new Ec2Service(new MemoryAdapter('ec2-test'));
}

describe('Ec2Service — instances', () => {
  it('launches and lists instances', () => {
    const e = newEc2();
    const id = e.launch('t2.micro');
    expect(id).toMatch(/^i-/);
    expect(e.listInstances().length).toBe(1);
  });

  it('records instance state as running', () => {
    const e = newEc2();
    const id = e.launch('t2.micro');
    expect(e.describe(id).state).toBe('running');
  });

  it('terminates an instance', () => {
    const e = newEc2();
    const id = e.launch('t2.micro');
    e.terminate(id);
    expect(e.listInstances()).toEqual([]);
    expect(e.describe(id)).toBeNull();
  });

  it('stops and starts an instance', () => {
    const e = newEc2();
    const id = e.launch('t2.micro');
    e.stop(id);
    expect(e.describe(id).state).toBe('stopped');
    e.start(id);
    expect(e.describe(id).state).toBe('running');
  });

  it('throws when stopping unknown instance', () => {
    const e = newEc2();
    expect(() => e.stop('i-unknown')).toThrow(/not found/i);
  });

  it('throws on invalid instance type', () => {
    const e = newEc2();
    expect(() => e.launch('')).toThrow(/invalid instance type/i);
  });
});
