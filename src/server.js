require('dotenv').config();

const app = require('./app');
const prisma = require('./config/prisma');

async function start() {
  if (!process.env.DATABASE_URL) throw new Error('A variável DATABASE_URL é obrigatória');
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET deve possuir pelo menos 32 caracteres');
  }
  await prisma.$connect();
  const port = Number(process.env.PORT || 3000);
  const server = app.listen(port, () => {
    console.info(`API disponível em http://localhost:${port}/api/v1`);
    console.info(`Swagger disponível em http://localhost:${port}/api-docs`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch(async (error) => {
  console.error('Não foi possível iniciar a API:', error);
  await prisma.$disconnect();
  process.exitCode = 1;
});
