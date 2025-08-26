import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export type UserSafe = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
};

export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(
  name: string,
  email: string,
  password: string,
  role: string = 'seller',
  storeId: number = 1,
): Promise<User> {
  // NOTE: 'role' and 'storeId' are required by the Prisma schema.
  // Ensure 'storeId' exists in DB or pass one explicitly from the controller.
  return prisma.user.create({ data: { name, email, password, role, storeId } });
}

export async function getAllUsers(): Promise<UserSafe[]> {
  return prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } });
}

export async function getUserById(id: number): Promise<UserSafe | null> {
  return prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, role: true, createdAt: true } });
}

export async function updateUser(id: number, data: Partial<User>): Promise<User | null> {
  return prisma.user.update({ where: { id }, data });
}

export async function deleteUser(id: number): Promise<User | null> {
  return prisma.user.delete({ where: { id } });
}
