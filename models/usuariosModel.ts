import prisma from '../db/prismaClient.js';

export const createUsuario = (data: { nome: string; email: string; senha: string }) => {
  return prisma.usuarios.create({ data });
};

export const findAllUsuarios = () => {
  return prisma.usuarios.findMany({
    select: {
      id: true,
      nome: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const findUsuarioById = (id: string) => {
  return prisma.usuarios.findUnique({
    where: { id },
    include: {
      despesas: true,
      metas: true,
    },
  });
};

export const findUsuarioByEmail = (email: string) => {
  return prisma.usuarios.findUnique({
    where: { email },
  });
};

export const findUsuarioByIdRaw = (id: string) => {
  return prisma.usuarios.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      email: true,
      senha: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const updateUsuario = (id: string, data: Partial<{ nome: string; email: string; senha: string }>) => {
  return prisma.usuarios.update({
    where: { id },
    data,
  });
};

export const deleteUsuario = (id: string) => {
  return prisma.usuarios.delete({ where: { id } });
};
