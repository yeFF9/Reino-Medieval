const test = require('node:test');
const assert = require('node:assert/strict');
const { listTerritoriesSchema } = require('../src/validators/territorios');
const { createCity } = require('../src/validators/resources');
const { pagination } = require('../src/utils/pagination');

test('territory list validates pagination and filters together', () => {
  const result = listTerritoriesSchema.safeParse({
    query: { page: '2', limit: '50', nome: 'Carvalho', status: 'CONTROLADO' },
  });

  assert.equal(result.success, true);
  assert.equal(result.data.query.page, 2);
  assert.equal(result.data.query.limit, 50);
});

test('territory list rejects limits above the public maximum', () => {
  const result = listTerritoriesSchema.safeParse({ query: { page: '1', limit: '101' } });
  assert.equal(result.success, false);
});

test('city creation requires a UUID territory and numeric food stock', () => {
  const invalid = createCity.safeParse({
    body: { nome: 'Carvalho', territorioId: 'invalid-id', populacao: 1000, estoqueAlimentos: '100' },
  });
  assert.equal(invalid.success, false);
});

test('pagination computes an offset from validated values', () => {
  assert.deepEqual(pagination({ page: 3, limit: 10 }), { page: 3, limit: 10, skip: 20, take: 10 });
});
