import prisma from '../db/prismaClient.js';

export const createMeta = (data: {
  titulo: string;
  valor: number | string;
  dataInicio: Date;
  dataFinal: Date;
  usuarioId: string;
}) => {
  return prisma.metas.create({
    data: {
      ...data,
      valor: Number(data.valor),
      valorAcumulado: 0,
    },
  });
};

export const findAllMetas = () => {
  return prisma.metas.findMany({
    include: {
      usuario: {
        select: { id: true, nome: true, email: true },
      },
    },
  });
};

export const findMetasByUsuario = (usuarioId: string) => {
  return prisma.metas.findMany({
    where: { usuarioId },
    include: {
      usuario: {
        select: { id: true, nome: true, email: true },
      },
    },
  });
};

export const findMetaById = (id: string) => {
  return prisma.metas.findUnique({
    where: { id },
    include: {
      usuario: {
        select: { id: true, nome: true, email: true },
      },
    },
  });
};

export const updateMeta = (
  id: string,
  data: Partial<{
    titulo: string;
    valor: number | string;
    valorAcumulado: number | string;
    dataInicio: Date;
    dataFinal: Date;
  }>
) => {
  const updateData: any = { ...data };
  if (updateData.valor !== undefined) {
    updateData.valor = Number(updateData.valor);
  }
  if (updateData.valorAcumulado !== undefined) {
    updateData.valorAcumulado = Number(updateData.valorAcumulado);
  }
  return prisma.metas.update({ where: { id }, data: updateData });
};

export const deleteMeta = (id: string) => {
  return prisma.metas.delete({ where: { id } });
};

export const adicionarAoValorAcumulado = (id: string, valor: number | string) => {
  return prisma.metas.update({
    where: { id },
    data: {
      valorAcumulado: {
        increment: Number(valor),
      },
    },
  });
};

// Buscar metas ativas de um usuário
export const findMetasAtivasByUsuario = (usuarioId: string) => {
  const agora = new Date();
  return prisma.metas.findMany({
    where: {
      usuarioId,
      dataInicio: { lte: agora },
      dataFinal: { gte: agora },
    },
  });
};
