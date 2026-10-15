const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const HttpError = require('../utils/http-error');

async function register({ nome, email, senha }) {
  const existing = await prisma.usuario.findUnique({ where: { email } });
  if (existing) throw new HttpError(409, 'Já existe uma conta com este e-mail');

  const role = await prisma.papel.findUnique({ where: { nome: 'LEITOR' } });
  if (!role) throw new Error('Papel LEITOR ausente; execute o seed inicial');
  const senhaHash = await bcrypt.hash(senha, 12);
  try {
    return await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: { nome, email, senhaHash, papeis: { create: { papelId: role.id } } },
        select: { id: true, nome: true, email: true, createdAt: true },
      });
      return usuario;
    });
  } catch (error) {
    if (error.code === 'P2002') throw new HttpError(409, 'Já existe uma conta com este e-mail');
    throw error;
  }
}

async function login({ email, senha }) {
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario || !usuario.ativo || !(await bcrypt.compare(senha, usuario.senhaHash))) {
    throw new HttpError(401, 'E-mail ou senha inválidos');
  }
  const token = jwt.sign({ sub: usuario.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
  return { token, tokenType: 'Bearer', expiresIn: process.env.JWT_EXPIRES_IN || '1h' };
}

module.exports = { register, login };
