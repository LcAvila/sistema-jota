import { Request, Response } from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from '../services/user.service';
import bcrypt from 'bcryptjs';

export const getAllUsersController = async (req: Request, res: Response) => {
  const users = await getAllUsers();
  res.json(users);
};

export const getUserByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await getUserById(Number(id));
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
  res.json(user);
};

export const createUserController = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!password) return res.status(400).json({ message: 'Senha obrigatória' });
  const hashedPassword = bcrypt.hashSync(password, 8);
  const user = await createUser(name, email, hashedPassword);
  res.status(201).json(user);
};

export const updateUserController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, password, role } = req.body;
  const data: any = {};
  if (name) data.name = name;
  if (email) data.email = email;
  if (role) data.role = role;
  if (password) data.password = bcrypt.hashSync(password, 8);
  try {
    const user = await updateUser(Number(id), data);
    res.json(user);
  } catch (err) {
    res.status(404).json({ message: 'Usuário não encontrado' });
  }
};

export const deleteUserController = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await deleteUser(Number(id));
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ message: 'Usuário não encontrado' });
  }
};
