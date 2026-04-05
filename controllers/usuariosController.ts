import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as UsuarioModel from '../models/usuariosModel.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const cadastrarUsuario = async (req: Request, res: Response) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Por favor, preencha todos os campos (nome, email, senha)!' });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ erro: 'Email inválido!' });
    }

    if (senha.length < 10) {
      return res.status(400).json({ erro: 'A senha deve ter no mínimo 10 caracteres!' });
    }

    const usuarioExistente = await UsuarioModel.findUsuarioByEmail(email);
    if (usuarioExistente) {
      return res.status(400).json({ erro: 'Esse email já está em uso.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const novoUsuario = await UsuarioModel.createUsuario({ nome, email, senha: senhaHash });

    return res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso!',
      usuario: novoUsuario,
    });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return res.status(400).json({ erro: 'Esse email já está em uso.' });
    }
    console.error('ERRO NO CADASTRO:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.', detalhes: error?.message ?? String(error) });
  }
};

export const listarUsuarios = async (req: Request, res: Response) => {
  try {
    const usuarios = await UsuarioModel.findAllUsuarios();
    return res.status(200).json({ total: usuarios.length, usuarios });
  } catch (error) {
    console.error('ERRO AO LISTAR USUÁRIOS:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

export const obterUsuarioPorId = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || '');
    if (!id) {
      return res.status(400).json({ erro: 'ID do usuário é obrigatório!' });
    }

    const usuario = await UsuarioModel.findUsuarioById(id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado!' });
    }

    return res.status(200).json(usuario);
  } catch (error) {
    console.error('ERRO AO BUSCAR USUÁRIO:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

export const atualizarUsuario = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || '');
    const { nome, email, senha } = req.body;

    if (!id) {
      return res.status(400).json({ erro: 'ID do usuário é obrigatório!' });
    }

    const usuarioExistente = await UsuarioModel.findUsuarioById(id);
    if (!usuarioExistente) {
      return res.status(404).json({ erro: 'Usuário não encontrado!' });
    }

    if (email && !emailRegex.test(email)) {
      return res.status(400).json({ erro: 'Email inválido!' });
    }

    if (senha && senha.length < 10) {
      return res.status(400).json({ erro: 'A senha deve ter no mínimo 10 caracteres!' });
    }

    const updateData: any = {};
    if (nome) updateData.nome = nome;
    if (email) updateData.email = email;
    if (senha) updateData.senha = await bcrypt.hash(senha, 10);

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ erro: 'Nenhum campo válido para atualizar.' });
    }

    const usuarioAtualizado = await UsuarioModel.updateUsuario(id, updateData);
    return res.status(200).json({ mensagem: 'Usuário atualizado com sucesso!', usuario: usuarioAtualizado });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return res.status(400).json({ erro: 'Esse email já está em uso.' });
    }
    console.error('ERRO AO ATUALIZAR USUÁRIO:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

export const deletarUsuario = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || '');
    if (!id) {
      return res.status(400).json({ erro: 'ID do usuário é obrigatório!' });
    }

    const usuarioExistente = await UsuarioModel.findUsuarioById(id);
    if (!usuarioExistente) {
      return res.status(404).json({ erro: 'Usuário não encontrado!' });
    }

    await UsuarioModel.deleteUsuario(id);
    return res.status(200).json({ mensagem: 'Usuário deletado com sucesso!' });
  } catch (error) {
    console.error('ERRO AO DELETAR USUÁRIO:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};
