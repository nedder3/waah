import { describe, it, expect } from 'vitest';
import { IamService } from './iam.js';
import { MemoryAdapter } from '../../core/storage.js';

function newIam() {
  return new IamService(new MemoryAdapter('iam-test'));
}

describe('IamService — users', () => {
  it('creates and lists users', () => {
    const iam = newIam();
    expect(iam.createUser('ana')).toBe(true);
    expect(iam.listUsers()).toEqual(['ana']);
  });

  it('does not duplicate a user', () => {
    const iam = newIam();
    iam.createUser('ana');
    expect(iam.createUser('ana')).toBe(false);
  });

  it('throws on invalid user name', () => {
    const iam = newIam();
    expect(() => iam.createUser('')).toThrow(/invalid user name/i);
  });

  it('deletes a user', () => {
    const iam = newIam();
    iam.createUser('ana');
    iam.deleteUser('ana');
    expect(iam.listUsers()).toEqual([]);
  });
});

describe('IamService — roles & policies', () => {
  it('creates a role and attaches a policy', () => {
    const iam = newIam();
    iam.createRole('admin');
    expect(iam.listRoles()).toEqual(['admin']);
    iam.putPolicy('admin', { statements: [{ effect: 'Allow', action: '*' }] });
    const policy = iam.getPolicy('admin');
    expect(policy.statements[0].effect).toBe('Allow');
  });

  it('returns null policy for unknown role', () => {
    const iam = newIam();
    expect(iam.getPolicy('ghost')).toBeNull();
  });

  it('attaches a role to a user', () => {
    const iam = newIam();
    iam.createUser('ana');
    iam.createRole('admin');
    iam.attachRole('ana', 'admin');
    expect(iam.rolesOf('ana')).toEqual(['admin']);
  });

  it('does not attach an unknown role to a user', () => {
    const iam = newIam();
    iam.createUser('ana');
    expect(() => iam.attachRole('ana', 'ghost')).toThrow(/not found/i);
  });

  it('detaches a role from a user', () => {
    const iam = newIam();
    iam.createUser('ana');
    iam.createRole('admin');
    iam.attachRole('ana', 'admin');
    iam.detachRole('ana', 'admin');
    expect(iam.rolesOf('ana')).toEqual([]);
  });

  it('throws when attaching to unknown user', () => {
    const iam = newIam();
    iam.createRole('admin');
    expect(() => iam.attachRole('ghost', 'admin')).toThrow(/not found/i);
  });
});
