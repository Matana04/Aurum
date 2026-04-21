import express, { Router } from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import {
  cadastrarMeta,
  listarMetasDoUsuario,
  obterMeta,
  atualizarMeta,
  deletarMeta,
  adicionarValorAcumulado,
} from '../controllers/metasController.js';

const router: Router = express.Router();

// Rotas protegidas por autenticação
router.post('/metas', authenticateToken, cadastrarMeta);
router.get('/metas', authenticateToken, listarMetasDoUsuario);
router.get('/metas/:id', authenticateToken, obterMeta);
router.put('/metas/:id', authenticateToken, atualizarMeta);
router.delete('/metas/:id', authenticateToken, deletarMeta);
router.post('/metas/:id/adicionar-valor', authenticateToken, adicionarValorAcumulado);

export default router;
