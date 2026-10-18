require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middlewares/error-handler');

const app = express();

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/v1/auth', require('./routes/auth-routes'));
app.use('/api/v1/reinos', require('./routes/reino-routes'));
app.use('/api/v1/territorios', require('./routes/territorio-routes'));
app.use('/api/v1/cidades', require('./routes/cidade-routes'));
app.use('/api/v1/exercitos', require('./routes/exercito-routes'));
app.use('/api/v1/guerras', require('./routes/guerra-routes'));
app.use('/api/v1/comandantes', require('./routes/comandante-routes'));
app.use('/api/v1/guardas', require('./routes/guarda-routes'));
app.use('/api/v1/diplomacia', require('./routes/diplomacia-routes'));
app.use('/api/v1/guildas', require('./routes/guilda-routes'));
app.use('/api/v1/leis', require('./routes/leis-routes'));
app.use('/api/v1/castelos', require('./routes/castelo-routes'));
app.use('/api/v1', require('./routes/populacao-routes'));
app.use('/api/v1', require('./routes/agricultura-routes'));
app.use('/api/v1', require('./routes/suprimento-routes'));

app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada' }));
app.use(errorHandler);

module.exports = app;