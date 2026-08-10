import { describe, it, expect } from 'vitest';
import { S3Service } from '../../src/services/s3/s3.js';
import { MemoryAdapter } from '../../src/core/storage.js';
import { ej1_crearYSubir, ej2_listarPrefijo, ej3_borrarBucket } from './s3.exercise.js';

function newS3() { return new S3Service(new MemoryAdapter('s3-ex')); }

describe('S3 — ejercicios', () => {
  it('ej1: crear bucket y subir objeto', () => {
    const s3 = newS3();
    ej1_crearYSubir(s3);
    expect(s3.listBuckets()).toContain('fotos');
    expect(s3.getObject('fotos', 'logo.png').body).toBe('mi logo');
  });

  it('ej2: listar por prefijo', () => {
    const s3 = newS3();
    ej1_crearYSubir(s3);
    const objs = ej2_listarPrefijo(s3);
    expect(objs.map((o) => o.key)).toEqual(['2024/enero.png', '2024/febrero.png']);
  });

  it('ej3: borrar bucket vacía objetos', () => {
    const s3 = newS3();
    ej1_crearYSubir(s3);
    ej2_listarPrefijo(s3);
    expect(ej3_borrarBucket(s3)).toBe(0);
  });
});
