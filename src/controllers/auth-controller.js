const authService = require('../services/auth-service');

async function register(req, res) {
  const user = await authService.register(req.validated.body);
  return res.status(201).json({ data: user });
}

async function login(req, res) {
  return res.json({ data: await authService.login(req.validated.body) });
}

module.exports = { register, login };
