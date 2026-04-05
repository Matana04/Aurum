import prisma from '../db/prismaClient.js';

export const createDespesa = (data: { titulo: string; valor: number; data: Date; usuarioId: string }) => {
  return prisma.despesas.create({ data });
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

export const updateDespesa = (id: string, data: Partial<{ titulo: string; valor: number; data: Date; usuarioId: string }>) => {
  return prisma.despesas.update({ where: { id }, data });
};

export const deleteDespesa = (id: string) => {
  return prisma.despesas.delete({ where: { id } });
};
