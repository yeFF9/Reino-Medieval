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

- API: [`http://localhost:3000/api/v1`](http://localhost:3000/api/v1)
- Swagger UI: [`http://localhost:3000/api-docs`](http://localhost:3000/api-docs)
- Health check: [`http://localhost:3000/health`](http://localhost:3000/health)

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
| PATCH | `/exercitos/:id/designar-comandante` | `exercitos:write` |
| PATCH | `/exercitos/:id/desmobilizar` | `exercitos:write` |
| POST | `/guerras/declarar` | `guerras:write` |
| GET | `/guerras/historico` | `guerras:read` |
| PATCH | `/guerras/:id/finalizar` | `guerras:write` |
| GET | `/comandantes` | `comandantes:read` |
| POST | `/comandantes` | `comandantes:write` |
| GET | `/comandantes/:id` | `comandantes:read` |
| PATCH | `/comandantes/:id/promover` | `comandantes:write` |
| POST | `/guardas/patrulhas` | `guardas:write` |
| POST | `/diplomacia/pactos` | `diplomacia:write` |
| GET | `/diplomacia/pactos/:reinoId` | `diplomacia:read` |
| DELETE | `/diplomacia/pactos/:id/romper` | `diplomacia:write` |
| POST | `/diplomacia/tributos/enviar` | `diplomacia:write` |
| POST | `/guildas` | `guildas:write` |
| GET | `/guildas/:id` | `guildas:read` |
| GET | `/guildas/:id/membros` | `guildas:read` |
| POST | `/guildas/:id/encomendas` | `guildas:write` |
| GET | `/reinos/:id/economia` | `economia:read` |
| PATCH | `/reinos/:id/economia` | `economia:write` |
| GET | `/cidades/:id/populacao` | `cidades:read` |
| GET | `/cidades/:id/populacao/mapa-fome` | `cidades:read` |
| GET | `/cidades/:id/populacao/satisfacao` | `cidades:read` |
| GET | `/cidades/:id/agricultura` | `agricultura:read` |
| GET | `/cidades/:id/suprimentos` | `suprimentos:read` |
| GET | `/cidades/:id/racoes` | `suprimentos:read` |
| PUT | `/cidades/:id/suprimentos/converter` | `suprimentos:write` |
| POST | `/agricultura/colheitas` | `agricultura:write` |
| GET | `/leis` | `leis:read` |
| POST | `/leis` | `leis:write` |
| PUT | `/leis/:id/revogar` | `leis:write` |
| POST | `/impostos/aplicar` | `impostos:write` |
| GET | `/impostos/historico` | `impostos:read` |
| POST | `/castelos` | `castelos:write` |
| GET | `/castelos/:id` | `castelos:read` |
| PATCH | `/castelos/:id/melhorar` | `castelos:write` |
| POST | `/castelos/:id/reparar` | `castelos:write` |

Todas as listagens recebem `page` e `limit` (padrões 1 e 20, máximo 100) e filtros documentados no Swagger. O token deve ser enviado como `Authorization: Bearer <JWT>`.

## Regras encapsuladas nos serviços

- Territórios têm uma única relação de propriedade `reinoId`; o serviço valida o reino e a FK impede proprietários inexistentes.
- Mobilização valida o comandante, o pertencimento territorial e os recursos mínimos, debitando ouro, alimentos e ferro em transação serializável.
- Criação da cidade verifica o estoque mínimo configurável (`MIN_CITY_FOOD_STOCK`) e calcula produção inicial proporcional à população. `changeCityPopulation` recalcula a produção quando a população mudar.
- Censo demográfico e cálculo de segurança alimentar avaliam a média de refeições diárias e satisfação popular (0-10) com risco associado de revolta.
- Conversão de suprimentos e colheitas agrícolas gerenciam o inventário de alimentos e a reserva mínima de rações militares por cidade.
- Decretos e leis ativas mantêm integridade de estado (revogação/alteração); arrecadações fiscais respeitam períodos vigentes.
- Construção, reparo e melhorias em castelos consomem recursos de infraestrutura e validam os limites estruturais de muralhas e guarnições.
- Declaração de guerra rejeita pactos ativos de aliança/não agressão. `finalize` transfere o território ao vencedor na mesma transação que finaliza a guerra, sendo exposta pela rota `PATCH /guerras/:id/finalizar`.
- `applyTax` impede imposto repetido por alvo/período fiscal; `createDiplomaticAgreement` impede acordos entre reinos em guerra direta; `setCastleGuards` respeita o limite estrutural do castelo.
- `promote` exige que a nova patente seja superior à atual; `designarComandante` reutiliza a patente mínima (`3`) exigida na criação de exércitos.
- `deployPatrol` retira os guardas do contingente do castelo do território da cidade em transação serializável; `desmobilizar` zera o `custoManutencao` do exército.
- `breakPact` encerra o acordo e, se um reino for informado, aplica a penalização em ouro (`DIPLOMACY_BREAK_PENALTY_OURO`, padrão 50); `sendTribute` transfere ouro, alimentos e ferro entre as economias em transação serializável.
- `createOrder` calcula o custo por item (`ARMAS`, `ARMADURAS`, `MATERIAIS_CONSTRUCAO`) e debita ouro e ferro do reino da guilda.
- `adjustEconomy` credita (padrão) ou define os recursos do reino; `finalize` transfere o território disputado ao vencedor.

As rotinas internas estão em `src/services`; o schema, migration inicial e dados fictícios estão em `prisma/`.