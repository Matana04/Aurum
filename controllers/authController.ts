import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Secret } from 'jsonwebtoken';
import * as UsuarioModel from '../models/usuariosModel.js';

const ADMIN_ID = 'f4f299fb-c169-4a94-b6d7-f9a1564f1164';
const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-aqui';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const formatUsuarioSemSenha = (usuario: { id: string; nome: string; email: string; createdAt: Date; updatedAt: Date }) => ({
  id: usuario.id,
  nome: usuario.nome,
  email: usuario.email,
  createdAt: usuario.createdAt,
  updatedAt: usuario.updatedAt,
});

export const loginUsuario = async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
    }

    const usuario = await UsuarioModel.findUsuarioByEmail(email);
    if (!usuario) {
      return res.status(401).json({ erro: 'Email ou senha inválidos.' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Email ou senha inválidos.' });
    }

    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    return res.status(200).json({
      mensagem: 'Login realizado com sucesso!',
      usuario: formatUsuarioSemSenha(usuario),
      token
    });
  } catch (error) {
    console.error('ERRO NA AUTENTICAÇÃO:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

export const logoutUsuario = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ erro: 'userId é obrigatório para logout.' });
    }

    const usuario = await UsuarioModel.findUsuarioById(userId);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    // Aqui você pode adicionar lógica real de blacklist de token, sessão, etc.
    return res.status(200).json({ mensagem: 'Logout realizado com sucesso!', usuario: formatUsuarioSemSenha(usuario) });
  } catch (error) {
    console.error('ERRO NO LOGOUT:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
    }

    const admin = await UsuarioModel.findUsuarioByIdRaw(ADMIN_ID);
    if (!admin) {
      return res.status(401).json({ erro: 'Usuário admin não encontrado.' });
    }

    if (admin.email !== email || admin.nome !== 'Admin') {
      return res.status(401).json({ erro: 'Credenciais de admin inválidas.' });
    }

    const senhaValida = await bcrypt.compare(senha, admin.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais de admin inválidas.' });
    }

    const token = jwt.sign(
      { id: admin.id, nome: admin.nome, email: admin.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    return res.status(200).json({
      mensagem: 'Login admin realizado com sucesso!',
      usuario: formatUsuarioSemSenha(admin),
      token
    });
  } catch (error) {
    console.error('ERRO NA AUTENTICAÇÃO ADMIN:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};
