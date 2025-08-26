import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { findUserByEmail, createUser } from '../services/user.service';

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

export const login = async (req: Request, res: Response) => {
  console.log('Tentando login:', req.body.email, req.body.password);

  const { email, password } = req.body;
  const user = await findUserByEmail(email);
  console.log('Usuário encontrado:', user);
  if (user) {
    console.log('Senha enviada:', password, 'Hash no banco:', user.password);
    console.log('Resultado bcrypt:', bcrypt.compareSync(password, user.password));
  }
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Credenciais inválidas' });
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: (user as any).role, storeId: (user as any).storeId }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: (user as any).role, storeId: (user as any).storeId } });
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const existing = await findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ message: 'E-mail já cadastrado' });
  }
  const hashedPassword = bcrypt.hashSync(password, 8);
  const newUser = await createUser(name, email, hashedPassword);
  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: (newUser as any).role, storeId: (newUser as any).storeId }, JWT_SECRET, { expiresIn: '1d' });
  res.status(201).json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: (newUser as any).role, storeId: (newUser as any).storeId } });
};
