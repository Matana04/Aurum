import express from 'express';
import usuariosRoutes from './usuariosRoutes.js';
import despesasRoutes from './despesasRoutes.js';
import authRoutes from './authRoutes.js';

const router = express.Router();

router.use('/', authRoutes);
router.use('/', usuariosRoutes);
router.use('/', despesasRoutes);

export default router;
