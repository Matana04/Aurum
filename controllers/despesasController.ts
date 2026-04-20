import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/authMiddleware.js';
import * as DespesasModel from '../models/despesasModel.js';
import * as UsuarioModel from '../models/usuariosModel.js';

export const cadastrarDespesa = async (req: AuthRequest, res: Response) => {
  try {
    const { titulo, valor, data } = req.body;

    if (!titulo || valor === undefined || !data) {
      return res.status(400).json({ erro: 'Por favor, preencha todos os campos (titulo, valor, data)!' });
    }

    if (typeof valor !== 'number' && typeof valor !== 'string') {
      return res.status(400).json({ erro: 'Valor inválido. Use número ou string numérica.' });
    }

    const valorNumber = Number(valor);
    if (Number.isNaN(valorNumber) || valorNumber <= 0) {
      return res.status(400).json({ erro: 'Valor deve ser um número positivo.' });
    }

    const dataDate = new Date(data);
    if (Number.isNaN(dataDate.getTime())) {
      return res.status(400).json({ erro: 'Data inválida. Use formato ISO ou data válida.' });
    }

    const usuarioId = req.user?.id;
    if (!usuarioId) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    const usuario = await UsuarioModel.findUsuarioById(usuarioId);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const novaDespesa = await DespesasModel.createDespesa({
      titulo,
      valor: valorNumber,
      data: dataDate,
      usuarioId,
    });

    return res.status(201).json({ mensagem: 'Despesa cadastrada com sucesso!', despesa: novaDespesa });
  } catch (error) {
    console.error('ERRO NO CADASTRO DE DESPESA:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

export const listarDespesas = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    const despesas = await DespesasModel.findAllDespesas();
    const despesasDoUsuario = despesas.filter(despesa => despesa.usuarioId === usuarioId);
    
    return res.status(200).json({ total: despesasDoUsuario.length, despesas: despesasDoUsuario });
  } catch (error) {
    console.error('ERRO AO LISTAR DESPESAS:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

export const obterDespesaPorId = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id || '');
    if (!id) {
      return res.status(400).json({ erro: 'ID da despesa é obrigatório!' });
    }

    const usuarioId = req.user?.id;
    if (!usuarioId) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    const despesa = await DespesasModel.findDespesaById(id);
    if (!despesa) {
      return res.status(404).json({ erro: 'Despesa não encontrada!' });
    }

    if (despesa.usuarioId !== usuarioId) {
      return res.status(403).json({ erro: 'Você não tem permissão para acessar esta despesa.' });
    }

    return res.status(200).json(despesa);
  } catch (error) {
    console.error('ERRO AO BUSCAR DESPESA:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

export const atualizarDespesa = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id || '');
    const { titulo, valor, data } = req.body;

    if (!id) {
      return res.status(400).json({ erro: 'ID da despesa é obrigatório!' });
    }

    const usuarioId = req.user?.id;
    if (!usuarioId) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    const despesaExistente = await DespesasModel.findDespesaById(id);
    if (!despesaExistente) {
      return res.status(404).json({ erro: 'Despesa não encontrada!' });
    }

    if (despesaExistente.usuarioId !== usuarioId) {
      return res.status(403).json({ erro: 'Você não tem permissão para atualizar esta despesa.' });
    }

    const updateData: any = {};

    if (titulo) updateData.titulo = titulo;

    if (valor !== undefined) {
      const valorNumber = Number(valor);
      if (Number.isNaN(valorNumber) || valorNumber <= 0) {
        return res.status(400).json({ erro: 'Valor deve ser um número positivo.' });
      }
      updateData.valor = valorNumber;
    }

    if (data) {
      const dataDate = new Date(data);
      if (Number.isNaN(dataDate.getTime())) {
        return res.status(400).json({ erro: 'Data inválida. Use formato ISO ou data válida.' });
      }
      updateData.data = dataDate;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ erro: 'Nenhum campo válido para atualizar.' });
    }

    const despesaAtualizada = await DespesasModel.updateDespesa(id, updateData);
    return res.status(200).json({ mensagem: 'Despesa atualizada com sucesso!', despesa: despesaAtualizada });
  } catch (error) {
    console.error('ERRO AO ATUALIZAR DESPESA:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

export const deletarDespesa = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id || '');
    if (!id) {
      return res.status(400).json({ erro: 'ID da despesa é obrigatório!' });
    }

    const usuarioId = req.user?.id;
    if (!usuarioId) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    const despesaExistente = await DespesasModel.findDespesaById(id);
    if (!despesaExistente) {
      return res.status(404).json({ erro: 'Despesa não encontrada!' });
    }

    if (despesaExistente.usuarioId !== usuarioId) {
      return res.status(403).json({ erro: 'Você não tem permissão para deletar esta despesa.' });
    }

    await DespesasModel.deleteDespesa(id);
    return res.status(200).json({ mensagem: 'Despesa deletada com sucesso!' });
  } catch (error) {
    console.error('ERRO AO DELETAR DESPESA:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};
