import type { Request, Response } from 'express';
import {
  createMeta,
  findAllMetas,
  findMetasByUsuario,
  findMetaById,
  updateMeta,
  deleteMeta,
  adicionarAoValorAcumulado,
  findMetasAtivasByUsuario,
} from '../models/metasModel.js';

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

// Funções auxiliares de cálculo
const calcularMesesRestantes = (dataFinal: Date): number => {
  const agora = new Date();
  agora.setHours(0, 0, 0, 0);
  dataFinal.setHours(0, 0, 0, 0);

  let meses = 0;
  const dataAtual = new Date(agora);

  while (dataAtual < dataFinal) {
    meses++;
    dataAtual.setMonth(dataAtual.getMonth() + 1);
  }

  return Math.max(0, meses);
};

const calcularMesesTotais = (dataInicio: Date, dataFinal: Date): number => {
  let meses = 0;
  const dataAtual = new Date(dataInicio);
  dataAtual.setHours(0, 0, 0, 0);
  const dataFim = new Date(dataFinal);
  dataFim.setHours(0, 0, 0, 0);

  while (dataAtual <= dataFim) {
    meses++;
    dataAtual.setMonth(dataAtual.getMonth() + 1);
  }

  return Math.max(1, meses);
};

const calcularValorMensal = (valorTotal: number, dataInicio: Date, dataFinal: Date): number => {
  const mesesTotais = calcularMesesTotais(dataInicio, dataFinal);
  return valorTotal / mesesTotais;
};

const calcularValorProximoMes = (
  valorTotal: number,
  valorAcumulado: number,
  dataInicio: Date,
  dataFinal: Date
): number => {
  const mesesRestantes = calcularMesesRestantes(dataFinal);
  const valorFaltante = valorTotal - valorAcumulado;

  if (mesesRestantes <= 0) {
    return 0;
  }

  return valorFaltante / mesesRestantes;
};

// Endpoint: Criar nova meta
export const cadastrarMeta = async (req: AuthRequest, res: Response) => {
  try {
    const { titulo, valor, dataInicio, dataFinal } = req.body;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    if (!titulo || !valor || !dataInicio || !dataFinal) {
      return res.status(400).json({
        erro: 'Todos os campos são obrigatórios: titulo, valor, dataInicio, dataFinal.',
      });
    }

    const dataInicioDate = new Date(dataInicio);
    const dataFinalDate = new Date(dataFinal);

    if (dataFinalDate <= dataInicioDate) {
      return res.status(400).json({ erro: 'A data final deve ser posterior à data inicial.' });
    }

    const novaMeta = await createMeta({
      titulo,
      valor: Number(valor),
      dataInicio: dataInicioDate,
      dataFinal: dataFinalDate,
      usuarioId,
    });

    const mesesTotais = calcularMesesTotais(dataInicioDate, dataFinalDate);
    const valorMensal = calcularValorMensal(Number(novaMeta.valor), dataInicioDate, dataFinalDate);

    return res.status(201).json({
      ...novaMeta,
      mesesTotais,
      valorMensalNecessario: valorMensal,
    });
  } catch (error) {
    console.error('ERRO AO CADASTRAR META:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// Endpoint: Listar todas as metas do usuário
export const listarMetasDoUsuario = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    const metas = await findMetasByUsuario(usuarioId);

    const metasComCalculos = metas.map((meta) => {
      const valorMensal = calcularValorMensal(
        Number(meta.valor),
        meta.dataInicio,
        meta.dataFinal
      );
      const mesesRestantes = calcularMesesRestantes(meta.dataFinal);
      const valorProximoMes = calcularValorProximoMes(
        Number(meta.valor),
        Number(meta.valorAcumulado),
        meta.dataInicio,
        meta.dataFinal
      );
      const mesesTotais = calcularMesesTotais(meta.dataInicio, meta.dataFinal);

      return {
        ...meta,
        valorMensalInicial: valorMensal,
        valorMensalAgora: valorProximoMes,
        mesesTotais,
        mesesRestantes,
        percentualConclusao: ((Number(meta.valorAcumulado) / Number(meta.valor)) * 100).toFixed(2),
      };
    });

    return res.status(200).json(metasComCalculos);
  } catch (error) {
    console.error('ERRO AO LISTAR METAS:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// Endpoint: Obter uma meta específica
export const obterMeta = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id?: string };
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    if (!id) {
      return res.status(400).json({ erro: 'ID da meta é obrigatório.' });
    }

    const meta = await findMetaById(id);

    if (!meta) {
      return res.status(404).json({ erro: 'Meta não encontrada.' });
    }

    if (meta.usuarioId !== usuarioId) {
      return res.status(403).json({ erro: 'Você não tem permissão para acessar esta meta.' });
    }

    const valorMensal = calcularValorMensal(
      Number(meta.valor),
      meta.dataInicio,
      meta.dataFinal
    );
    const mesesRestantes = calcularMesesRestantes(meta.dataFinal);
    const valorProximoMes = calcularValorProximoMes(
      Number(meta.valor),
      Number(meta.valorAcumulado),
      meta.dataInicio,
      meta.dataFinal
    );
    const mesesTotais = calcularMesesTotais(meta.dataInicio, meta.dataFinal);

    return res.status(200).json({
      ...meta,
      valorMensalInicial: valorMensal,
      valorMensalAgora: valorProximoMes,
      mesesTotais,
      mesesRestantes,
      percentualConclusao: ((Number(meta.valorAcumulado) / Number(meta.valor)) * 100).toFixed(2),
    });
  } catch (error) {
    console.error('ERRO AO OBTER META:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// Endpoint: Atualizar meta
export const atualizarMeta = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id?: string };
    const { titulo, valor, dataInicio, dataFinal } = req.body;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    if (!id) {
      return res.status(400).json({ erro: 'ID da meta é obrigatório.' });
    }

    const meta = await findMetaById(id);

    if (!meta) {
      return res.status(404).json({ erro: 'Meta não encontrada.' });
    }

    if (meta.usuarioId !== usuarioId) {
      return res.status(403).json({ erro: 'Você não tem permissão para atualizar esta meta.' });
    }

    const updateData: any = {};
    if (titulo !== undefined) updateData.titulo = titulo;
    if (valor !== undefined) updateData.valor = Number(valor);
    if (dataInicio !== undefined) updateData.dataInicio = new Date(dataInicio);
    if (dataFinal !== undefined) updateData.dataFinal = new Date(dataFinal);

    const metaAtualizada = await updateMeta(id, updateData);

    const valorMensal = calcularValorMensal(
      Number(metaAtualizada.valor),
      metaAtualizada.dataInicio,
      metaAtualizada.dataFinal
    );
    const mesesTotais = calcularMesesTotais(metaAtualizada.dataInicio, metaAtualizada.dataFinal);

    return res.status(200).json({
      ...metaAtualizada,
      valorMensalNecessario: valorMensal,
      mesesTotais,
    });
  } catch (error) {
    console.error('ERRO AO ATUALIZAR META:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// Endpoint: Deletar meta
export const deletarMeta = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id?: string };
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    if (!id) {
      return res.status(400).json({ erro: 'ID da meta é obrigatório.' });
    }

    const meta = await findMetaById(id);

    if (!meta) {
      return res.status(404).json({ erro: 'Meta não encontrada.' });
    }

    if (meta.usuarioId !== usuarioId) {
      return res.status(403).json({ erro: 'Você não tem permissão para deletar esta meta.' });
    }

    await deleteMeta(id);

    return res.status(200).json({ mensagem: 'Meta deletada com sucesso.' });
  } catch (error) {
    console.error('ERRO AO DELETAR META:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// Endpoint: Adicionar valor acumulado à meta
export const adicionarValorAcumulado = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id?: string };
    const { valor } = req.body;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    if (!id) {
      return res.status(400).json({ erro: 'ID da meta é obrigatório.' });
    }

    if (!valor) {
      return res.status(400).json({ erro: 'O campo valor é obrigatório.' });
    }

    if (Number(valor) <= 0) {
      return res.status(400).json({ erro: 'O valor deve ser maior que zero.' });
    }

    const meta = await findMetaById(id);

    if (!meta) {
      return res.status(404).json({ erro: 'Meta não encontrada.' });
    }

    if (meta.usuarioId !== usuarioId) {
      return res.status(403).json({
        erro: 'Você não tem permissão para adicionar valor a esta meta.',
      });
    }

    const novoValorAcumulado = Number(meta.valorAcumulado) + Number(valor);

    if (novoValorAcumulado > Number(meta.valor)) {
      return res.status(400).json({
        erro: `O valor acumulado não pode ser maior que o valor da meta. Valor máximo: ${Number(meta.valor) - Number(meta.valorAcumulado)}`,
      });
    }

    const metaAtualizada = await adicionarAoValorAcumulado(id, valor);

    const valorMensal = calcularValorMensal(
      Number(metaAtualizada.valor),
      metaAtualizada.dataInicio,
      metaAtualizada.dataFinal
    );
    const mesesRestantes = calcularMesesRestantes(metaAtualizada.dataFinal);
    const valorProximoMes = calcularValorProximoMes(
      Number(metaAtualizada.valor),
      Number(metaAtualizada.valorAcumulado),
      metaAtualizada.dataInicio,
      metaAtualizada.dataFinal
    );
    const mesesTotais = calcularMesesTotais(metaAtualizada.dataInicio, metaAtualizada.dataFinal);

    return res.status(200).json({
      ...metaAtualizada,
      valorMensalInicial: valorMensal,
      valorMensalAgora: valorProximoMes,
      mesesTotais,
      mesesRestantes,
      percentualConclusao: ((Number(metaAtualizada.valorAcumulado) / Number(metaAtualizada.valor)) * 100).toFixed(2),
      mensagem: 'Valor adicionado com sucesso.',
    });
  } catch (error) {
    console.error('ERRO AO ADICIONAR VALOR ACUMULADO:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};
