import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import router from './routes/index.js';

dotenv.config();

const port = Number(process.env.PORT) || 3333;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Aurum API',
      version: '1.0.0',
      description: 'Documentação da API Aurum',
    },
    servers: [{ url: `http://localhost:${port}` }],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Bearer token obtido após login',
        },
      },
      schemas: {
        UsuarioInput: {
          type: 'object',
          required: ['nome', 'email', 'senha'],
          properties: {
            nome: { type: 'string', example: 'Mateus' },
            email: { type: 'string', format: 'email', example: 'mateus@example.com' },
            senha: { type: 'string', format: 'password', example: 'senhaSuperSegura123' },
          },
        },
        Usuario: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            nome: { type: 'string' },
            email: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            despesas: { type: 'array', items: { $ref: '#/components/schemas/Despesa' } },
            metas: { type: 'array', items: { type: 'object' } },
          },
        },
        DespesaInput: {
          type: 'object',
          required: ['titulo', 'valor', 'data', 'usuarioId'],
          properties: {
            titulo: { type: 'string', example: 'Compra mercado' },
            valor: { type: 'number', example: 123.45 },
            data: { type: 'string', format: 'date', example: '2026-03-29' },
            usuarioId: { type: 'string', example: 'uuid-do-usuario' },
          },
        },
        Despesa: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            titulo: { type: 'string' },
            valor: { type: 'number' },
            data: { type: 'string', format: 'date-time' },
            usuarioId: { type: 'string' },
            usuario: { type: 'object', properties: { id: { type: 'string' }, nome: { type: 'string' }, email: { type: 'string' } } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: { erro: { type: 'string' }, detalhes: { type: 'string' } },
        },
        MessageResponse: {
          type: 'object',
          properties: { mensagem: { type: 'string' } },
        },
      },
    },
  },
  apis: ['./routes/*.ts', './controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Força o Node a ignorar certificados "falsos" de redes corporativas
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
  }
  next(err);
});

/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - System
 *     summary: Health check da API
 *     responses:
 *       200:
 *         description: API operacional
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/', router);

app.listen(port, () => {
  console.log(`Servidor do Aurum está rodando na porta ${port}!`);
});
