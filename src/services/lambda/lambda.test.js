import { describe, it, expect } from 'vitest';
import { LambdaService } from './lambda.js';
import { MemoryAdapter } from '../../core/storage.js';

function newLambda() {
  return new LambdaService(new MemoryAdapter('lambda-test'));
}

describe('LambdaService — functions', () => {
  it('creates and lists functions', () => {
    const l = newLambda();
    expect(l.createFunction('resize', 'node18')).toBe(true);
    expect(l.listFunctions()).toEqual(['resize']);
  });

  it('does not duplicate a function', () => {
    const l = newLambda();
    l.createFunction('resize', 'node18');
    expect(l.createFunction('resize', 'node18')).toBe(false);
  });

  it('throws on invalid function name', () => {
    const l = newLambda();
    expect(() => l.createFunction('', 'node18')).toThrow(/invalid function name/i);
  });

  it('returns function config', () => {
    const l = newLambda();
    l.createFunction('resize', 'node18');
    expect(l.getFunction('resize').runtime).toBe('node18');
  });

  it('deletes a function', () => {
    const l = newLambda();
    l.createFunction('resize', 'node18');
    l.deleteFunction('resize');
    expect(l.listFunctions()).toEqual([]);
  });
});

describe('LambdaService — invocation', () => {
  it('invokes a function and records the result', () => {
    const l = newLambda();
    l.createFunction('upper', 'node18');
    const res = l.invoke('upper', { input: 'hola' });
    expect(res.status).toBe('ok');
    expect(res.requestId).toBeTruthy();
  });

  it('records invocation in history', () => {
    const l = newLambda();
    l.createFunction('upper', 'node18');
    l.invoke('upper', { input: 'a' });
    l.invoke('upper', { input: 'b' });
    expect(l.invocationsOf('upper').length).toBe(2);
  });

  it('throws when invoking unknown function', () => {
    const l = newLambda();
    expect(() => l.invoke('ghost', {})).toThrow(/not found/i);
  });

  it('passes input through to recorded event', () => {
    const l = newLambda();
    l.createFunction('f', 'node18');
    const res = l.invoke('f', { x: 1 });
    const rec = l.invocationsOf('f')[0];
    expect(rec.input).toEqual({ x: 1 });
    expect(res.requestId).toBe(rec.requestId);
  });
});
