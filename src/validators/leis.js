const { z, pagination, uuid } = require('./common');

const CriarDecretoOuLei = z.object({
  body: z.object({
    titulo: z.string().trim().min(2, 'O título precisa ter pelo menos 2 caracteres').max(100),
    descricao: z.string().trim().max(500).optional(),
    reinoId: uuid,
  }),
});

const IdLeiParam = z.object({
  params: z.object({ id: uuid }),
});

const ListarLeis = z.object({
  query: z.object({
    ...pagination,
    titulo: z.string().trim().max(100).optional(),
    reinoId: uuid.optional(),
    status: z.enum(['ATIVA', 'REVOGADA']).optional(),
  }),
});

const AplicarImposto = z.object({
  body: z.object({
    reinoId: uuid,
    periodoFiscal: z.string().trim().min(2, 'Informe o período fiscal (ex: 2026-Q1)').max(40),
    valor: z.number().positive('O valor do imposto deve ser maior que zero'),
    descricao: z.string().trim().max(200).optional(),
  }),
});

const HistoricoImpostos = z.object({
  query: z.object({
    ...pagination,
    reinoId: uuid.optional(),
    periodoFiscal: z.string().trim().optional(),
  }),
});

module.exports = {
  ListarLeis,
  CriarDecretoOuLei,
  IdLeiParam,
  AplicarImposto,
  HistoricoImpostos,
};