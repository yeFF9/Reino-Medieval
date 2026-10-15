const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

async function authenticate(req, res, next) {
  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Token de autenticação obrigatório' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.usuario.findFirst({
      where: { id: payload.sub, ativo: true },
      select: { id: true, email: true, nome: true },
    });
    if (!user) return res.status(401).json({ error: 'Usuário inválido ou inativo' });
    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
    return next(error);
  }
}

module.exports = authenticate;
