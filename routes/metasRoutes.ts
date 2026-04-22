import express, { Router } from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import {
  cadastrarMeta,
  listarMetasDoUsuario,
  obterMeta,
  atualizarMeta,
  deletarMeta,
  adicionarValorAcumulado,
  obterHistoricoMeta,
} from '../controllers/metasController.js';

const router: Router = express.Router();

// Rotas protegidas por autenticação
router.post('/metas', authenticateToken, cadastrarMeta);
router.get('/metas', authenticateToken, listarMetasDoUsuario);
router.get('/metas/:id', authenticateToken, obterMeta);
router.get('/metas/:id/historico', authenticateToken, obterHistoricoMeta);
router.put('/metas/:id', authenticateToken, atualizarMeta);
router.delete('/metas/:id', authenticateToken, deletarMeta);
router.post('/metas/:id/adicionar-valor', authenticateToken, adicionarValorAcumulado);

export default router;
