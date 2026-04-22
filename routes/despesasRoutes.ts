import express from 'express';
import * as DespesasController from '../controllers/despesasController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @openapi
 * /despesas:
 *   post:
 *     tags:
 *       - Despesas
 *     summary: Cadastrar despesa para o usuário autenticado
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['titulo', 'valor', 'data']
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: 'Compra no mercado'
 *               valor:
 *                 type: number
 *                 example: 156.50
 *               data:
 *                 type: string
 *                 format: date
 *                 example: '2026-04-20'
 *     responses:
 *       201:
 *         description: Despesa criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                 despesa:
 *                   $ref: '#/components/schemas/Despesa'
 *       400:
 *         description: Requisição inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Usuário não autenticado ou token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno no servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/despesas', authenticateToken, DespesasController.cadastrarDespesa);

/**
 * @openapi
 * /despesas:
 *   get:
 *     tags:
 *       - Despesas
 *     summary: Listar despesas do usuário autenticado
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de despesas do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 despesas:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Despesa'
 *       401:
 *         description: Usuário não autenticado ou token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno no servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/despesas', authenticateToken, DespesasController.listarDespesas);

/**
 * @openapi
 * /despesas/mes:
 *   get:
 *     tags:
 *       - Despesas
 *     summary: Listar despesas do mês e calcular total gasto
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: data
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: '2026-04-15'
 *         description: Data no formato YYYY-MM-DD para filtrar o mês
 *     responses:
 *       200:
 *         description: Relatório mensal de despesas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mes:
 *                   type: string
 *                   example: '2026-04'
 *                 totalGasto:
 *                   type: number
 *                   example: 1250.75
 *                 quantidadeDespesas:
 *                   type: integer
 *                   example: 8
 *                 despesas:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Despesa'
 *       400:
 *         description: Parâmetro data obrigatório ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Usuário não autenticado ou token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno no servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/despesas/mes', authenticateToken, DespesasController.listarDespesasPorMes);

/**
 * @openapi
 * /despesas/ultimas-5/mes-atual:
 *   get:
 *     tags:
 *       - Despesas
 *     summary: Listar as últimas 5 despesas do mês atual
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Últimas 5 despesas do mês atual
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mes:
 *                   type: string
 *                   example: '2026-04'
 *                 totalGasto:
 *                   type: number
 *                   example: 500.00
 *                 quantidadeDespesas:
 *                   type: integer
 *                   example: 5
 *                 despesas:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Despesa'
 *       401:
 *         description: Usuário não autenticado ou token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno no servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/despesas/ultimas-5/mes-atual', authenticateToken, DespesasController.listarUltimas5DespesasDoMesAtual);

/**
 * @openapi
 * /despesas/do-dia:
 *   get:
 *     tags:
 *       - Despesas
 *     summary: Listar todas as despesas do dia atual
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Todas as despesas do dia
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: string
 *                   example: '2026-04-20'
 *                 totalGasto:
 *                   type: number
 *                   example: 250.50
 *                 quantidadeDespesas:
 *                   type: integer
 *                   example: 3
 *                 despesas:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Despesa'
 *       401:
 *         description: Usuário não autenticado ou token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno no servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/despesas/do-dia', authenticateToken, DespesasController.listarDespesasDodia);

/**
 * @openapi
 * /despesas/do-ano:
 *   get:
 *     tags:
 *       - Despesas
 *     summary: Listar todas as despesas do ano atual
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Todas as despesas do ano
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ano:
 *                   type: integer
 *                   example: 2026
 *                 totalGasto:
 *                   type: number
 *                   example: 5250.75
 *                 quantidadeDespesas:
 *                   type: integer
 *                   example: 45
 *                 despesas:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Despesa'
 *       401:
 *         description: Usuário não autenticado ou token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno no servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/despesas/do-ano', authenticateToken, DespesasController.listarDespesasDoAno);

/**
 * @openapi
 * /despesas/do-mes-atual:
 *   get:
 *     tags:
 *       - Despesas
 *     summary: Listar todas as despesas do mês atual
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Todas as despesas do mês atual
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mes:
 *                   type: string
 *                   example: '2026-04'
 *                 totalGasto:
 *                   type: number
 *                   example: 1250.75
 *                 quantidadeDespesas:
 *                   type: integer
 *                   example: 12
 *                 despesas:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Despesa'
 *       401:
 *         description: Usuário não autenticado ou token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno no servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/despesas/do-mes-atual', authenticateToken, DespesasController.listarDespesasDoMesAtual);

/**
 * @openapi
 * /despesas/{id}:
 *   get:
 *     tags:
 *       - Despesas
 *     summary: Obter despesa por ID (apenas do usuário autenticado)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Despesa encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Despesa'
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Usuário não autenticado ou token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Sem permissão para acessar esta despesa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Despesa não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno no servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/despesas/:id', authenticateToken, DespesasController.obterDespesaPorId);

/**
 * @openapi
 * /despesas/{id}:
 *   put:
 *     tags:
 *       - Despesas
 *     summary: Atualizar despesa por ID (apenas do proprietário)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               valor:
 *                 type: number
 *               data:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Despesa atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                 despesa:
 *                   $ref: '#/components/schemas/Despesa'
 *       400:
 *         description: Requisição inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Usuário não autenticado ou token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Sem permissão para atualizar esta despesa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Despesa não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno no servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/despesas/:id', authenticateToken, DespesasController.atualizarDespesa);

/**
 * @openapi
 * /despesas/{id}:
 *   delete:
 *     tags:
 *       - Despesas
 *     summary: Deletar despesa por ID (apenas do proprietário)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Despesa deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Requisição inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Usuário não autenticado ou token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Sem permissão para deletar esta despesa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Despesa não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno no servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/despesas/:id', authenticateToken, DespesasController.deletarDespesa);

/**
 * @openapi
 * /despesas/categoria/maior-gasto:
 *   get:
 *     tags:
 *       - Despesas
 *     summary: Obter a categoria com maior gasto
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Categoria com maior gasto encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categoria:
 *                   type: string
 *                   example: 'Carro'
 *                 valorTotal:
 *                   type: number
 *                   example: 1000.00
 *                 valorMedio:
 *                   type: number
 *                   example: 250.00
 *                 quantidadeDespesas:
 *                   type: integer
 *                   example: 4
 *                 historico:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       titulo:
 *                         type: string
 *                       valor:
 *                         type: number
 *                       data:
 *                         type: string
 *                         format: date-time
 *                       mes:
 *                         type: string
 *                         example: 'abril de 2026'
 *       401:
 *         description: Usuário não autenticado ou token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Nenhuma despesa encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno no servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/categoria/maior-gasto', authenticateToken, DespesasController.obterCategoriaMaiorGasto);

export default router;
