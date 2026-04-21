import express from 'express';
import usuariosRoutes from './usuariosRoutes.js';
import despesasRoutes from './despesasRoutes.js';
import authRoutes from './authRoutes.js';
import metasRoutes from './metasRoutes.js';

const router = express.Router();

router.use('/', authRoutes);
router.use('/', usuariosRoutes);
router.use('/', despesasRoutes);
router.use('/', metasRoutes);

export default router;
