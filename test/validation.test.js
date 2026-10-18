const test = require('node:test');
const assert = require('node:assert/strict');
const { listTerritoriesSchema } = require('../src/validators/territorios');
const { createCity, createPact, sendTribute, finalizeWar, createGuildOrder, updateEconomy } = require('../src/validators/resources');
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

test('pact creation rejects a kingdom agreeing with itself', () => {
  const sameId = '00000000-0000-4000-8000-000000000001';
  const result = createPact.safeParse({
    body: { reinoAId: sameId, reinoBId: sameId, tipo: 'ALIANCA' },
  });
  assert.equal(result.success, false);
});

test('tribute requires two different kingdoms and at least one resource', () => {
  const same = sendTribute.safeParse({
    body: { reinoOrigemId: '00000000-0000-4000-8000-000000000001', reinoDestinoId: '00000000-0000-4000-8000-000000000001', ouro: 10 },
  });
  assert.equal(same.success, false);

  const empty = sendTribute.safeParse({
    body: { reinoOrigemId: '00000000-0000-4000-8000-000000000001', reinoDestinoId: '00000000-0000-4000-8000-000000000002' },
  });
  assert.equal(empty.success, false);
});

test('war finalization requires a winner UUID', () => {
  const result = finalizeWar.safeParse({ params: { id: 'invalid-id' }, body: { vencedorId: 'also-invalid' } });
  assert.equal(result.success, false);
});

test('guild order only accepts known items and positive quantities', () => {
  const config = { params: { id: '00000000-0000-4000-8000-000000000001' } };
  assert.equal(createGuildOrder.safeParse({ ...config, body: { item: 'ARMAS', quantidade: 10 } }).success, true);
  assert.equal(createGuildOrder.safeParse({ ...config, body: { item: 'POCAO', quantidade: 10 } }).success, false);
  assert.equal(createGuildOrder.safeParse({ ...config, body: { item: 'ARMAS', quantidade: 0 } }).success, false);
});

test('economy update requires at least one non-negative resource', () => {
  const params = { id: '00000000-0000-4000-8000-000000000001' };
  assert.equal(updateEconomy.safeParse({ params, body: { ouro: 100 } }).success, true);
  assert.equal(updateEconomy.safeParse({ params, body: {} }).success, false);
  assert.equal(updateEconomy.safeParse({ params, body: { ouro: -5 } }).success, false);
});
