const { z } = require('./common');

const loginSchema = z.object({
  body: z.object({
    email: z.string().email().max(254),
    senha: z.string().min(8).max(128),
  }),
});

const registerSchema = z.object({
  body: z.object({
    nome: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(254),
    senha: z.string().min(8).max(128),
  }),
});

module.exports = { loginSchema, registerSchema };
