const { z, uuid } = require('./common');

const IdCasteloParam = z.object({
  params: z.object({ id: uuid }),
});

const CriarCastelo = z.object({
  body: z.object({
    territorioId: uuid,
    capacidadeGuardas: z.number().int().min(1, 'A capacidade de guardas deve ser de no mínimo 1'),
  }),
});

const MelhorarCastelo = z.object({
  params: z.object({ id: uuid }),
  body: z.object({
    reinoId: uuid,
  }),
});

const RepararCastelo = z.object({
  params: z.object({ id: uuid }),
  body: z.object({
    reinoId: uuid, 
  }),
});

module.exports = {
  IdCasteloParam,
  CriarCastelo,
  MelhorarCastelo,
  RepararCastelo,
};