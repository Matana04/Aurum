import prisma from '../db/prismaClient.js';

export const createDespesa = (data: { titulo: string; categoria?: string; valor: number | string; data: Date; usuarioId: string; tipoMovimentacao?: string }) => {
  return prisma.despesas.create({ data: { ...data, valor: Number(data.valor), tipoMovimentacao: data.tipoMovimentacao || 'DESPESA' } });
};

export const findAllDespesas = () => {
  return prisma.despesas.findMany({
    include: {
      usuario: {
        select: { id: true, nome: true, email: true },
      },
    },
  });
};

export const findDespesaById = (id: string) => {
  return prisma.despesas.findUnique({
    where: { id },
    include: {
      usuario: {
        select: { id: true, nome: true, email: true },
      },
    },
  });
};

export const updateDespesa = (id: string, data: Partial<{ titulo: string; categoria: string; valor: number | string; data: Date; usuarioId: string }>) => {
  const updateData: any = { ...data };
  if (updateData.valor !== undefined) {
    updateData.valor = Number(updateData.valor);
  }
  return prisma.despesas.update({ where: { id }, data: updateData });
};

export const deleteDespesa = (id: string) => {
  return prisma.despesas.delete({ where: { id } });
};

export const findDespesasByUsuarioAndMes = (usuarioId: string, ano: number, mes: number) => {
  const startOfMonth = new Date(ano, mes, 1);
  const endOfMonth = new Date(ano, mes + 1, 0, 23, 59, 59, 999);

  return prisma.despesas.findMany({
    where: {
      usuarioId,
      data: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      usuario: {
        select: { id: true, nome: true, email: true },
      },
    },
    orderBy: {
      data: 'asc',
    },
  });
};

export const findLast5DespesasDoMes = (usuarioId: string, ano: number, mes: number) => {
  const startOfMonth = new Date(ano, mes, 1);
  const endOfMonth = new Date(ano, mes + 1, 0, 23, 59, 59, 999);

  return prisma.despesas.findMany({
    where: {
      usuarioId,
      data: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      usuario: {
        select: { id: true, nome: true, email: true },
      },
    },
    orderBy: {
      data: 'desc',
    },
    take: 5,
  });
};

export const findDespesasDodia = (usuarioId: string, ano: number, mes: number, dia: number) => {
  // Criar as datas em UTC para consistência com como as despesas são salvas
  const startOfDay = new Date(Date.UTC(ano, mes, dia, 0, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(ano, mes, dia, 23, 59, 59, 999));

  return prisma.despesas.findMany({
    where: {
      usuarioId,
      data: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      usuario: {
        select: { id: true, nome: true, email: true },
      },
    },
    orderBy: {
      data: 'desc',
    },
  });
};

export const findDespesasDoAno = (usuarioId: string, ano: number) => {
  const startOfYear = new Date(Date.UTC(ano, 0, 1, 0, 0, 0, 0));
  const endOfYear = new Date(Date.UTC(ano, 11, 31, 23, 59, 59, 999));

  return prisma.despesas.findMany({
    where: {
      usuarioId,
      data: {
        gte: startOfYear,
        lte: endOfYear,
      },
    },
    include: {
      usuario: {
        select: { id: true, nome: true, email: true },
      },
    },
    orderBy: {
      data: 'desc',
    },
  });
};

export const findDespesasDoMesAtual = (usuarioId: string, ano: number, mes: number) => {
  const startOfMonth = new Date(Date.UTC(ano, mes, 1, 0, 0, 0, 0));
  const endOfMonth = new Date(Date.UTC(ano, mes + 1, 0, 23, 59, 59, 999));

  return prisma.despesas.findMany({
    where: {
      usuarioId,
      data: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      usuario: {
        select: { id: true, nome: true, email: true },
      },
    },
    orderBy: {
      data: 'desc',
    },
  });
};

export const findCategoriaMaiorGasto = async (usuarioId: string) => {
  // Agrupar despesas por categoria e somar os valores
  const categoriasPorGasto = await prisma.despesas.groupBy({
    by: ['categoria'],
    where: {
      usuarioId,
      tipoMovimentacao: 'DESPESA',
    },
    _sum: {
      valor: true,
    },
    orderBy: {
      _sum: {
        valor: 'desc',
      },
    },
  });

  if (!categoriasPorGasto || categoriasPorGasto.length === 0) {
    return null;
  }

  // Pega a categoria com maior gasto
  const categoriaMaior = categoriasPorGasto[0];

  // Busca todas as despesas dessa categoria para o histórico
  const historicoDespesas = await prisma.despesas.findMany({
    where: {
      usuarioId,
      categoria: categoriaMaior.categoria,
      tipoMovimentacao: 'DESPESA',
    },
    select: {
      id: true,
      titulo: true,
      categoria: true,
      valor: true,
      data: true,
      createdAt: true,
    },
    orderBy: {
      data: 'desc',
    },
  });

  // Calcular estatísticas
  const quantidadeDespesas = historicoDespesas.length;
  const valorTotal = categoriaMaior._sum.valor || 0;
  const valorMedio = quantidadeDespesas > 0 ? Number(valorTotal) / quantidadeDespesas : 0;

  return {
    categoria: categoriaMaior.categoria,
    valorTotal: Number(valorTotal),
    valorMedio: Number(valorMedio),
    quantidadeDespesas,
    historico: historicoDespesas.map((despesa) => ({
      id: despesa.id,
      titulo: despesa.titulo,
      valor: Number(despesa.valor),
      data: despesa.data,
      mes: new Date(despesa.data).toLocaleString('pt-BR', { month: 'long', year: 'numeric' }),
    })),
  };
};
