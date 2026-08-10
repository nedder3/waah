import { describe, it, expect } from 'vitest';
import { LambdaService } from '../../src/services/lambda/lambda.js';
import { MemoryAdapter } from '../../src/core/storage.js';
import { ej1_crearFuncion, ej2_invocar, ej3_historial } from './lambda.exercise.js';

function newLambda() { return new LambdaService(new MemoryAdapter('lambda-ex')); }

describe('Lambda — ejercicios', () => {
  it('ej1: crear función', () => {
    const lambda = newLambda();
    ej1_crearFuncion(lambda);
    expect(lambda.getFunction('procesar').runtime).toBe('node18');
  });

  it('ej2: invocar y capturar requestId', () => {
    const lambda = newLambda();
    ej1_crearFuncion(lambda);
    const reqId = ej2_invocar(lambda);
    expect(lambda.invocationsOf('procesar')[0].requestId).toBe(reqId);
  });

  it('ej3: historial de invocaciones', () => {
    const lambda = newLambda();
    ej1_crearFuncion(lambda);
    expect(ej3_historial(lambda)).toBe(3);
  });
});
