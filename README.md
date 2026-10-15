# Sistema de Administração de um Reino Medieval

API REST em JavaScript/Node.js com Express, PostgreSQL e Prisma. A aplicação inclui JWT, RBAC, validação Zod, migrations, seed e documentação OpenAPI.

## Requisitos

- Node.js 20 ou superior
- PostgreSQL 14 ou superior

## Executar localmente

1. Crie um banco PostgreSQL chamado `reino_medieval`.
2. Copie `.env.example` para `.env` e ajuste `DATABASE_URL` e `JWT_SECRET` (mínimo 32 caracteres).
3. Instale dependências e aplique migration/seed:

```sh
npm install
npm run db:setup
npm run dev
```

`npm run db:setup` gera o Prisma Client, aplica migrations existentes e carrega os dados de demonstração. Para desenvolvimento de schema, use `npm run db:migrate -- --name descricao`.

- API: `http://localhost:3000/api/v1`
- Swagger UI: `http://localhost:3000/api-docs`
- Health check: `http://localhost:3000/health`

Conta local criada pelo seed: `admin@eldoria.test` / `Eldoria123!`. Credencial somente para demonstração acadêmica; altere-a antes de qualquer uso compartilhado ou implantação.

## Rotas

| Método | Rota | Permissão |
| --- | --- | --- |
| POST | `/auth/register` | Pública; registra papel LEITOR |
| POST | `/auth/login` | Pública |
| GET | `/reinos` | `reinos:read` |
| POST | `/reinos` | `reinos:write` |
| GET | `/reinos/:id` | `reinos:read` |
| GET | `/territorios` | `territorios:read` |
| POST | `/territorios` | `territorios:write` |
| PUT | `/territorios/:id` | `territorios:write` |
| GET | `/cidades` | `cidades:read` |
| POST | `/cidades` | `cidades:write` |
| GET | `/exercitos` | `exercitos:read` |
| POST | `/exercitos` | `exercitos:write` |
| PATCH | `/exercitos/:id/mobilizar` | `exercitos:write` |
| POST | `/guerras/declarar` | `guerras:write` |
| GET | `/guerras/historico` | `guerras:read` |

Todas as listagens recebem `page` e `limit` (padrões 1 e 20, máximo 100) e filtros documentados no Swagger. O token deve ser enviado como `Authorization: Bearer <JWT>`.

## Regras encapsuladas nos serviços

- Territórios têm uma única relação de propriedade `reinoId`; o serviço valida o reino e a FK impede proprietários inexistentes.
- Mobilização valida o comandante, o pertencimento territorial e os recursos mínimos, debitando ouro, alimentos e ferro em transação serializável.
- Criação da cidade verifica o estoque mínimo configurável (`MIN_CITY_FOOD_STOCK`) e calcula produção inicial proporcional à população. `changeCityPopulation` recalcula a produção quando a população mudar.
- Declaração de guerra rejeita pactos ativos de aliança/não agressão. `finalize` transfere o território ao vencedor na mesma transação que finaliza a guerra; `finalize` e as rotinas administrativas seguintes são operações internas, pois não há rota extra fora dos 15 endpoints solicitados.
- `applyTax` impede imposto repetido por alvo/período fiscal; `createDiplomaticAgreement` impede acordos entre reinos em guerra direta; `setCastleGuards` respeita o limite estrutural do castelo.

As rotinas internas estão em `src/services`; o schema, migration inicial e dados fictícios estão em `prisma/`.
