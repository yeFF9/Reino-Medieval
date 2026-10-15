const prisma = require('../config/prisma');

function authorize(permissionCode) {
  return async (req, res, next) => {
    try {
      const permission = await prisma.usuarioPapel.findFirst({
        where: {
          usuarioId: req.user.id,
          papel: { permissoes: { some: { permissao: { codigo: permissionCode } } } },
        },
        select: { usuarioId: true },
      });
      if (!permission) return res.status(403).json({ error: 'Permissão insuficiente' });
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = authorize;
