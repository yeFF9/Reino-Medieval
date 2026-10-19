const { z, pagination, uuid } = require('./common');

const memberList = z.object({
  query: z.object({
    ...pagination,
    nome: z.string().trim().max(100).optional(),
    especialidade: z.string().trim().max(80).optional(),
    guildaId: uuid.optional(),
  }),
});

const createMember = z.object({
  body: z.object({
    guildaId: uuid,
    nome: z.string().trim().min(2).max(100),
    especialidade: z.string().trim().min(2).max(80),
  }),
});

const transferMember = z.object({
  params: z.object({ id: uuid }),
  body: z.object({ guildaDestinoId: uuid }),
});

const memberIdParam = z.object({ params: z.object({ id: uuid }) });

module.exports = { memberList, createMember, transferMember, memberIdParam };
