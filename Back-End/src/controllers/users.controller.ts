import { Request, Response } from 'express';
import { supabaseAdmin } from '../utils/supabase';
import bcrypt from 'bcryptjs';

export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        name,
        last_name,
        email,
        role,
        store_id,
        active,
        created_at,
        updated_at,
        stores (
          id,
          name
        )
      `)
      .order('name', { ascending: true });

    if (error) {
      console.error('Erro ao buscar usuários:', error);
      return res.status(500).json({ message: 'Erro ao listar usuários', details: error.message });
    }

    res.json(users);
  } catch (err) {
    console.error('getAllUsersController error', err);
    res.status(500).json({ message: 'Erro ao listar usuários' });
  }
};

export const getUserByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        name,
        last_name,
        email,
        role,
        store_id,
        active,
        created_at,
        updated_at,
        stores (
          id,
          name
        )
      `)
      .eq('id', Number(id))
      .single();

    if (error) {
      console.error('Erro ao buscar usuário:', error);
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (err) {
    console.error('getUserByIdController error', err);
    res.status(500).json({ message: 'Erro ao buscar usuário' });
  }
};

export const createUserController = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role = 'seller', storeId = 1 } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });
    }

    // Verificar se o usuário já existe
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({ message: 'E-mail já cadastrado' });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);
    
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        name,
        email,
        password: hashedPassword,
        role,
        store_id: storeId,
        active: true
      })
      .select(`
        id,
        name,
        last_name,
        email,
        role,
        store_id,
        active,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error('Erro ao criar usuário:', error);
      return res.status(500).json({ message: 'Erro ao criar usuário', details: error.message });
    }

    res.status(201).json(user);
  } catch (err) {
    console.error('createUserController error', err);
    res.status(500).json({ message: 'Erro ao criar usuário' });
  }
};

export const updateUserController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, storeId, active } = req.body;
    
    // Preparar dados para atualização
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (storeId !== undefined) updateData.store_id = storeId;
    if (active !== undefined) updateData.active = active;
    if (password !== undefined) updateData.password = bcrypt.hashSync(password, 8);

    // Se está atualizando o email, verificar se já existe
    if (email) {
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .neq('id', Number(id))
        .single();

      if (existingUser) {
        return res.status(409).json({ message: 'E-mail já cadastrado' });
      }
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', Number(id))
      .select(`
        id,
        name,
        last_name,
        email,
        role,
        store_id,
        active,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error('Erro ao atualizar usuário:', error);
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (err) {
    console.error('updateUserController error', err);
    res.status(500).json({ message: 'Erro ao atualizar usuário' });
  }
};

export const deleteUserController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', Number(id));

    if (error) {
      console.error('Erro ao deletar usuário:', error);
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('deleteUserController error', err);
    res.status(500).json({ message: 'Erro ao deletar usuário' });
  }
};
