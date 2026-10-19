require('dotenv').config();

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const permissions = [
    ['reinos:read', 'Consultar reinos'],
    ['reinos:write', 'Administrar reinos'],
    ['territorios:read', 'Consultar territórios'],
    ['territorios:write', 'Administrar territórios'],
    ['cidades:read', 'Consultar cidades'],
    ['cidades:write', 'Administrar cidades'],
    ['exercitos:read', 'Consultar exércitos'],
    ['exercitos:write', 'Administrar exércitos'],
    ['guerras:read', 'Consultar guerras'],
    ['guerras:write', 'Declarar e administrar guerras'],
    ['comandantes:read', 'Consultar comandantes'],
    ['comandantes:write', 'Administrar e promover comandantes'],
    ['guardas:read', 'Consultar guardas e patrulhas'],
    ['guardas:write', 'Alocar patrulhas de guardas'],
    ['diplomacia:read', 'Consultar acordos diplomáticos'],
    ['diplomacia:write', 'Firmar e romper acordos diplomáticos'],
    ['tributos:read', 'Consultar tributos'],
    ['tributos:write', 'Enviar tributos entre reinos'],
    ['guildas:read', 'Consultar guildas e membros'],
    ['guildas:write', 'Fundar guildas e encomendar produção'],
    ['economia:read', 'Consultar a economia dos reinos'],
    ['economia:write', 'Ajustar a economia dos reinos'],
  ];

  for (const [codigo, descricao] of permissions) {
    await prisma.permissao.upsert({
      where: { codigo },
      update: { descricao },
      create: { codigo, descricao },
    });
  }

  const rolePermissions = {
    ADMIN: permissions.map(([codigo]) => codigo),
    MONARCA: permissions.map(([codigo]) => codigo),
    ESTRATEGISTA: [
      'reinos:read', 'territorios:read', 'exercitos:read', 'exercitos:write', 'guerras:read', 'guerras:write',
      'comandantes:read', 'comandantes:write', 'guardas:read', 'guardas:write',
    ],
    DIPLOMATA: [
      'reinos:read', 'territorios:read', 'guerras:read',
      'diplomacia:read', 'diplomacia:write', 'tributos:read', 'tributos:write', 'economia:read',
    ],
    LEITOR: [
      'reinos:read', 'territorios:read', 'cidades:read', 'exercitos:read', 'guerras:read',
      'comandantes:read', 'guardas:read', 'diplomacia:read', 'tributos:read', 'guildas:read', 'economia:read',
    ],
  };

  for (const [nome, codigos] of Object.entries(rolePermissions)) {
    const papel = await prisma.papel.upsert({ where: { nome }, update: {}, create: { nome } });
    for (const codigo of codigos) {
      const permissao = await prisma.permissao.findUniqueOrThrow({ where: { codigo } });
      await prisma.papelPermissao.upsert({
        where: { papelId_permissaoId: { papelId: papel.id, permissaoId: permissao.id } },
        update: {},
        create: { papelId: papel.id, permissaoId: permissao.id },
      });
    }
  }

  const passwordHash = await bcrypt.hash('Eldoria123!', 12);
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@eldoria.test' },
    update: {},
    create: { nome: 'Administrador de Eldoria', email: 'admin@eldoria.test', senhaHash: passwordHash },
  });
  const adminRole = await prisma.papel.findUniqueOrThrow({ where: { nome: 'ADMIN' } });
  await prisma.usuarioPapel.upsert({
    where: { usuarioId_papelId: { usuarioId: admin.id, papelId: adminRole.id } },
    update: {},
    create: { usuarioId: admin.id, papelId: adminRole.id },
  });

  const eldoria = await prisma.reino.upsert({
    where: { nome: 'Eldoria' },
    update: {},
    create: { nome: 'Eldoria', descricao: 'Reino das florestas orientais', formaGoverno: 'Monarquia constitucional' },
  });
  const valoria = await prisma.reino.upsert({
    where: { nome: 'Valoria' },
    update: {},
    create: { nome: 'Valoria', descricao: 'Reino rival das montanhas do norte' },
  });

  await prisma.economia.upsert({
    where: { reinoId: eldoria.id },
    update: {},
    create: { reinoId: eldoria.id, ouro: 1000, alimentos: 500, ferro: 300 },
  });
  await prisma.economia.upsert({
    where: { reinoId: valoria.id },
    update: {},
    create: { reinoId: valoria.id, ouro: 700, alimentos: 350, ferro: 450 },
  });

  const territorio = await prisma.territorio.upsert({
    where: { nome: 'Vale do Carvalho' },
    update: {},
    create: { nome: 'Vale do Carvalho', descricao: 'Vale fértil de Eldoria', reinoId: eldoria.id },
  });
  const fronteira = await prisma.territorio.upsert({
    where: { nome: 'Marchas de Gelo' },
    update: {},
    create: { nome: 'Marchas de Gelo', descricao: 'Território disputado na fronteira norte', status: 'DISPUTADO', reinoId: valoria.id },
  });

  const cidade = await prisma.cidade.upsert({
    where: { nome: 'Carvalho Real' },
    update: {},
    create: { nome: 'Carvalho Real', territorioId: territorio.id, populacao: 12000, estoqueAlimentos: 900, producaoAgricola: 120 },
  });
  await prisma.castelo.upsert({
    where: { territorioId: territorio.id },
    update: {},
    create: { territorioId: territorio.id, capacidadeGuardas: 500, guardasAtuais: 180 },
  });

  const comandante = await prisma.comandante.upsert({
    where: { id: '00000000-0000-4000-8000-000000000001' },
    update: {},
    create: { id: '00000000-0000-4000-8000-000000000001', nome: 'Sir Aldric de Carvalho', patente: 'Marechal', nivelPatente: 5 },
  });
  await prisma.exercito.upsert({
    where: { id: '00000000-0000-4000-8000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000002',
      nome: 'Guarda Real',
      reinoId: eldoria.id,
      territorioId: territorio.id,
      comandanteId: comandante.id,
      efetivo: 300,
    },
  });

  await prisma.guerra.upsert({
    where: { id: '00000000-0000-4000-8000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000003',
      reinoAtacanteId: eldoria.id,
      reinoDefensorId: valoria.id,
      territorioId: fronteira.id,
    },
  });

  await prisma.patrulha.upsert({
    where: { id: '00000000-0000-4000-8000-000000000004' },
    update: {},
    create: { id: '00000000-0000-4000-8000-000000000004', cidadeId: cidade.id, contingente: 40 },
  });

  await prisma.diplomacia.upsert({
    where: { reinoAId_reinoBId_tipo: { reinoAId: eldoria.id, reinoBId: valoria.id, tipo: 'ACORDO_COMERCIAL' } },
    update: {},
    create: { reinoAId: eldoria.id, reinoBId: valoria.id, tipo: 'ACORDO_COMERCIAL' },
  });

  const guilda = await prisma.guilda.upsert({
    where: { nome: 'Guilda dos Ferreiros de Eldoria' },
    update: {},
    create: { nome: 'Guilda dos Ferreiros de Eldoria', oficio: 'Ferreiros', reinoId: eldoria.id },
  });
  await prisma.guildaMembro.upsert({
    where: { id: '00000000-0000-4000-8000-000000000005' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000005',
      guildaId: guilda.id,
      nome: 'Berta, a Forjadora',
      especialidade: 'Armaduras',
    },
  });
  await prisma.encomenda.upsert({
    where: { id: '00000000-0000-4000-8000-000000000006' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000006',
      guildaId: guilda.id,
      item: 'ARMAS',
      quantidade: 25,
      custoOuro: 500,
      custoFerro: 250,
      status: 'CONCLUIDA',
    },
  });

  const carpinteiros = await prisma.guilda.upsert({
    where: { nome: 'Guilda dos Carpinteiros de Eldoria' },
    update: {},
    create: { nome: 'Guilda dos Carpinteiros de Eldoria', oficio: 'Carpinteiros', reinoId: eldoria.id },
  });
  await prisma.guildaMembro.upsert({
    where: { id: '00000000-0000-4000-8000-000000000007' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000007',
      guildaId: carpinteiros.id,
      nome: 'Osric, o Carpinteiro',
      especialidade: 'Construção',
    },
  });
  await prisma.encomenda.upsert({
    where: { id: '00000000-0000-4000-8000-000000000008' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000008',
      guildaId: carpinteiros.id,
      item: 'MATERIAIS_CONSTRUCAO',
      quantidade: 10,
      custoOuro: 100,
      custoFerro: 50,
    },
  });

  console.info('Seed concluído. Conta de demonstração: admin@eldoria.test / Eldoria123!');
}

main()
  .catch((error) => {
    console.error('Falha ao executar seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
