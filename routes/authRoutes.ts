import express from 'express';
import * as AuthController from '../controllers/authController.js';

const router = express.Router();

/**
 * @openapi
 * /login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login de usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuário autenticado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', AuthController.loginUsuario);

/**
 * @openapi
 * /logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logout de usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 'uuid-do-usuario'
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                 usuario:
 *                   type: object
 *       400:
 *         description: Requisição inválida (userId obrigatório)
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno no servidor
 */
router.post('/logout', AuthController.logoutUsuario);

/**
 * @openapi
 * /admin:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login de administrador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin autenticado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/admin', AuthController.loginAdmin);

export default router;
