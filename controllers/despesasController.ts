import type { Request, Response } from 'express';
import { createDespesa, findAllDespesas, findDespesaById, updateDespesa, deleteDespesa, findDespesasByUsuarioAndMes, findLast5DespesasDoMes, findDespesasDodia, findDespesasDoAno, findDespesasDoMesAtual, findCategoriaMaiorGasto } from '../models/despesasModel.js';

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export const cadastrarDespesa = async (req: AuthRequest, res: Response) => {
  try {
    const { titulo, valor, data, categoria } = req.body;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    if (!titulo || !valor || !data) {
      return res.status(400).json({ erro: 'Todos os campos são obrigatórios: titulo, valor, data.' });
    }

    // Converter data de string para objeto Date em UTC
    const dataParts = data.split('-');
    const dateUTC = new Date(Date.UTC(parseInt(dataParts[0]), parseInt(dataParts[1]) - 1, parseInt(dataParts[2])));

    try {
      const novaDespesa = await createDespesa({
        titulo,
        categoria: categoria || null,
        valor: Number(valor),
        data: dateUTC,
        usuarioId
      });

      return res.status(201).json(novaDespesa);
    } catch (dbError) {
      console.error('ERRO DO PRISMA:', dbError);
      // Se erro com categoria, tenta sem categoria
      const despesaSemCategoria = await createDespesa({
        titulo,
        valor: Number(valor),
        data: dateUTC,
        usuarioId
      });
      return res.status(201).json(despesaSemCategoria);
    }
  } catch (error) {
    console.error('ERRO AO CADASTRAR DESPESA:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

export const listarDespesas = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    const todasDespesas = await findAllDespesas();
    const despesasDoUsuario = todasDespesas.filter(
      (despesa: any) => despesa.usuarioId === usuarioId && despesa.tipoMovimentacao === 'DESPESA'
    );

    return res.status(200).json(despesasDoUsuario);
  } catch (error) {
    console.error('ERRO AO LISTAR DESPESAS:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

export const obterDespesaPorId = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ erro: 'ID da despesa é obrigatório.' });
    }

    const despesa = await findDespesaById(id);

    if (!despesa) {
      return res.status(404).json({ erro: 'Despesa n�o encontrada.' });
    }

    if (despesa.usuarioId !== usuarioId) {
      return res.status(403).json({ erro: 'Acesso negado. Voc� s� pode acessar suas pr�prias despesas.' });
    }

    return res.status(200).json(despesa);
  } catch (error) {
    console.error('ERRO AO OBTER DESPESA POR ID:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

export const atualizarDespesa = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { titulo, valor, data, categoria } = req.body;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({ erro: 'Usu�rio n�o autenticado.' });
    }

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ erro: 'ID da despesa é obrigatório.' });
    }

    const despesaExistente = await findDespesaById(id);

    if (!despesaExistente) {
      return res.status(404).json({ erro: 'Despesa n�o encontrada.' });
    }

    if (despesaExistente.usuarioId !== usuarioId) {
      return res.status(403).json({ erro: 'Acesso negado. Voc� s� pode atualizar suas pr�prias despesas.' });
    }

    const updateData: any = {};
    if (categoria !== undefined) updateData.categoria = categoria;
    if (titulo !== undefined) updateData.titulo = titulo;
    if (valor !== undefined) updateData.valor = Number(valor);
    if (data !== undefined) {
      const dataParts = data.split('-');
      updateData.data = new Date(Date.UTC(parseInt(dataParts[0]), parseInt(dataParts[1]) - 1, parseInt(dataParts[2])));
    }

    const despesaAtualizada = await updateDespesa(id, updateData);

    return res.status(200).json(despesaAtualizada);
  } catch (error) {
    console.error('ERRO AO ATUALIZAR DESPESA:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

export const deletarDespesa = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({ erro: 'Usu�rio n�o autenticado.' });
    }

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ erro: 'ID da despesa é obrigatório.' });
    }

    const despesaExistente = await findDespesaById(id);

    if (!despesaExistente) {
      return res.status(404).json({ erro: 'Despesa n�o encontrada.' });
    }

    if (despesaExistente.usuarioId !== usuarioId) {
      return res.status(403).json({ erro: 'Acesso negado. Voc� s� pode deletar suas pr�prias despesas.' });
    }

    await deleteDespesa(id);

    return res.status(200).json({ mensagem: 'Despesa deletada com sucesso.' });
  } catch (error) {
    console.error('ERRO AO DELETAR DESPESA:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

export const listarDespesasPorMes = async (req: AuthRequest, res: Response) => {
  try {
    const { data } = req.query;

    if (!data || typeof data !== 'string') {
      return res.status(400).json({ erro: 'Parâmetro "data" é obrigatório no formato YYYY-MM-DD.' });
    }

    const usuarioId = req.user?.id;
    if (!usuarioId) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    const dataReferencia = new Date(data);
    if (Number.isNaN(dataReferencia.getTime())) {
      return res.status(400).json({ erro: 'Data inválida. Use formato YYYY-MM-DD.' });
    }

    // Extrair ano e mês da data
    const ano = dataReferencia.getFullYear();
    const mes = dataReferencia.getMonth(); // 0-11

    // Buscar despesas do usuário no mês específico
    const despesasDoMes = await findDespesasByUsuarioAndMes(usuarioId, ano, mes);

    // Filtrar apenas despesas reais (excluir economias)
    const despesasReais = despesasDoMes.filter((d: any) => d.tipoMovimentacao === 'DESPESA');

    // Calcular total gasto no mês
    const totalGasto = despesasReais.reduce((total: number, despesa: any) => total + Number(despesa.valor), 0);

    return res.status(200).json({
      mes: `${ano}-${String(mes + 1).padStart(2, '0')}`,
      totalGasto,
      quantidadeDespesas: despesasReais.length,
      despesas: despesasReais
    });
  } catch (error) {
    console.error('ERRO AO LISTAR DESPESAS POR MÊS:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

export const listarUltimas5DespesasDoMesAtual = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    // Obter o mês e ano atuais
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = agora.getMonth(); // 0-11

    // Buscar as últimas 5 despesas do mês atual
    const ultimas5Despesas = await findLast5DespesasDoMes(usuarioId, ano, mes);

    // Filtrar apenas despesas reais (excluir economias)
    const despesasReais = ultimas5Despesas.filter((d: any) => d.tipoMovimentacao === 'DESPESA');

    // Calcular total das últimas 5 despesas
    const totalGasto = despesasReais.reduce((total: number, despesa: any) => total + Number(despesa.valor), 0);

    return res.status(200).json({
      mes: `${ano}-${String(mes + 1).padStart(2, '0')}`,
      totalGasto,
      quantidadeDespesas: despesasReais.length,
      despesas: despesasReais
    });
  } catch (error) {
    console.error('ERRO AO LISTAR ÚLTIMAS 5 DESPESAS DO MÊS ATUAL:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

export const listarDespesasDodia = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    // Obter o dia, mês e ano atuais em UTC
    const agora = new Date();
    const ano = agora.getUTCFullYear();
    const mes = agora.getUTCMonth(); // 0-11
    const dia = agora.getUTCDate();

    // Buscar todas as despesas do dia atual
    const despesasDodia = await findDespesasDodia(usuarioId, ano, mes, dia);

    // Filtrar apenas despesas reais (excluir economias)
    const despesasReais = despesasDodia.filter((d: any) => d.tipoMovimentacao === 'DESPESA');

    // Calcular total gasto no dia
    const totalGasto = despesasReais.reduce((total: number, despesa: any) => total + Number(despesa.valor), 0);

    return res.status(200).json({
      data: `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`,
      totalGasto,
      quantidadeDespesas: despesasReais.length,
      despesas: despesasReais
    });
  } catch (error) {
    console.error('ERRO AO LISTAR DESPESAS DO DIA:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

export const listarDespesasDoAno = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    // Obter o ano atual em UTC
    const agora = new Date();
    const ano = agora.getUTCFullYear();

    // Buscar todas as despesas do ano atual
    const despesasDoAno = await findDespesasDoAno(usuarioId, ano);

    // Filtrar apenas despesas reais (excluir economias)
    const despesasReais = despesasDoAno.filter((d: any) => d.tipoMovimentacao === 'DESPESA');

    // Calcular total gasto no ano
    const totalGasto = despesasReais.reduce((total: number, despesa: any) => total + Number(despesa.valor), 0);

    return res.status(200).json({
      ano,
      totalGasto,
      quantidadeDespesas: despesasReais.length,
      despesas: despesasReais
    });
  } catch (error) {
    console.error('ERRO AO LISTAR DESPESAS DO ANO:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

export const listarDespesasDoMesAtual = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    // Obter o mês e ano atuais em UTC
    const agora = new Date();
    const ano = agora.getUTCFullYear();
    const mes = agora.getUTCMonth(); // 0-11

    // Buscar todas as despesas do mês atual
    const despesasDoMesAtual = await findDespesasDoMesAtual(usuarioId, ano, mes);

    // Filtrar apenas despesas reais (excluir economias)
    const despesasReais = despesasDoMesAtual.filter((d: any) => d.tipoMovimentacao === 'DESPESA');

    // Calcular total gasto no mês
    const totalGasto = despesasReais.reduce((total: number, despesa: any) => total + Number(despesa.valor), 0);

    return res.status(200).json({
      mes: `${ano}-${String(mes + 1).padStart(2, '0')}`,
      totalGasto,
      quantidadeDespesas: despesasReais.length,
      despesas: despesasReais
    });
  } catch (error) {
    console.error('ERRO AO LISTAR DESPESAS DO MÊS ATUAL:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

export const obterCategoriaMaiorGasto = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    const categoriaMaiorGasto = await findCategoriaMaiorGasto(usuarioId);

    if (!categoriaMaiorGasto) {
      return res.status(404).json({ erro: 'Nenhuma despesa encontrada para este usuário.' });
    }

    return res.status(200).json(categoriaMaiorGasto);
  } catch (error) {
    console.error('ERRO AO OBTER CATEGORIA COM MAIOR GASTO:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

