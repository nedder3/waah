import { describe, it, expect } from 'vitest';
import { S3Service } from './s3.js';
import { MemoryAdapter } from '../../core/storage.js';

function newS3() {
  return new S3Service(new MemoryAdapter('s3-test'));
}

describe('S3Service — buckets', () => {
  it('creates and lists buckets', () => {
    const s3 = newS3();
    expect(s3.createBucket('images')).toBe(true);
    expect(s3.listBuckets()).toEqual(['images']);
  });

  it('does not duplicate an existing bucket', () => {
    const s3 = newS3();
    s3.createBucket('images');
    expect(s3.createBucket('images')).toBe(false);
    expect(s3.listBuckets()).toEqual(['images']);
  });

  it('throws on invalid bucket name', () => {
    const s3 = newS3();
    expect(() => s3.createBucket('')).toThrow(/invalid bucket name/i);
  });

  it('deletes a bucket and its objects', () => {
    const s3 = newS3();
    s3.createBucket('b');
    s3.putObject('b', 'a/1.txt', 'x');
    s3.deleteBucket('b');
    expect(s3.listBuckets()).toEqual([]);
    expect(s3.listObjects('b')).toEqual([]);
  });
});

describe('S3Service — objects', () => {
  it('puts and gets an object', () => {
    const s3 = newS3();
    s3.createBucket('b');
    s3.putObject('b', 'notes.txt', 'hello');
    expect(s3.getObject('b', 'notes.txt')).toEqual({ key: 'notes.txt', body: 'hello' });
  });

  it('overwrites an existing object', () => {
    const s3 = newS3();
    s3.createBucket('b');
    s3.putObject('b', 'k', 'v1');
    s3.putObject('b', 'k', 'v2');
    expect(s3.getObject('b', 'k').body).toBe('v2');
  });

  it('lists objects, optionally by prefix', () => {
    const s3 = newS3();
    s3.createBucket('b');
    s3.putObject('b', 'img/a.png', '1');
    s3.putObject('b', 'img/b.png', '2');
    s3.putObject('b', 'doc/c.txt', '3');
    expect(s3.listObjects('b').map((o) => o.key).sort()).toEqual(['doc/c.txt', 'img/a.png', 'img/b.png']);
    expect(s3.listObjects('b', 'img/').map((o) => o.key)).toEqual(['img/a.png', 'img/b.png']);
  });

  it('deletes an object', () => {
    const s3 = newS3();
    s3.createBucket('b');
    s3.putObject('b', 'k', 'v');
    s3.deleteObject('b', 'k');
    expect(s3.getObject('b', 'k')).toBeNull();
  });

  it('returns null getting an unknown object', () => {
    const s3 = newS3();
    s3.createBucket('b');
    expect(s3.getObject('b', 'nope')).toBeNull();
  });

  it('throws when putting into a missing bucket', () => {
    const s3 = newS3();
    expect(() => s3.putObject('ghost', 'k', 'v')).toThrow(/not found/i);
  });
});
