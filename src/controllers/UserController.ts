import  type { Request, Response } from "express";
import {User} from "../models/userModel.js";
import { Op } from 'sequelize'; // Para consultas con operadores, como 'LIKE' para buscar por email.
import bcrypt from 'bcryptjs';
import type {UserCreationAttributes} from "../types/userInterface.js";


export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] }, //  No enviamos la contraseña hasheada
      include: ['role', 'department'], // Traemos los datos de rol y departamento
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    res.status(500).json({ message: 'Error al obtener los usuarios.' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] },       //  nunca devolvemos el hash
      include: ['role', 'department'],                  
    });

    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    return res.status(500).json({ message: 'Error al obtener el usuario.' });
  }
};


// CREAR USUSARIO
export const createUser = async (req: Request, res: Response) => {
  const { first_name, last_name, email, password, role_id, department_id, region, city} = req.body;

  try {
    // Verificar si el email ya está registrado
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado.' });
    }

    // Hashear la contraseña con bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario
    const newUser = await User.create({
      first_name,
      last_name,
      email,
      password_hash: hashedPassword,
      role_id,
      department_id,
      region, 
      city    
    } as UserCreationAttributes);

    // Volvemos a consultar el usuario sin enviar el hash
    const userResponse = await User.findByPk(newUser.id, {
      attributes: { exclude: ['password_hash'] },
      include: ['role', 'department'],
    });

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500).json({ message: 'Error al crear el usuario.' });
  }
};


// PATCH /users/:id
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { first_name, last_name, email, password, role_id, department_id } = req.body;

  try {
    // 1) Buscar el usuario
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

    // 2) Si me mandan email NUEVO distinto al actual, valido que no exista
    if (email && email !== user.email) {
      const exists = await User.findOne({ where: { email } });
      if (exists) return res.status(400).json({ message: 'El email ya está en uso.' });
    }

    // 3) Construyo solo los campos que llegaron (evito meter undefined)
    const updatedData: Record<string, unknown> = {};
    if (first_name !== undefined) updatedData.first_name = first_name;
    if (last_name  !== undefined) updatedData.last_name  = last_name;
    if (email      !== undefined) updatedData.email      = email;
    if (role_id    !== undefined) updatedData.role_id    = role_id;
    if (department_id !== undefined) updatedData.department_id = department_id;

    // 4) Si llegó password, la hasheo
    if (password) {
      updatedData.password_hash = await bcrypt.hash(password, 10);
    }

    // 5) Actualizo
    await user.update(updatedData);

    // 6) Respondo SIN el hash y con relaciones (listo para el front)
    const safeUser = await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] },
      include: ['role', 'department'],
    });

    return res.status(200).json(safeUser);
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    return res.status(500).json({ message: 'Error al actualizar el usuario.' });
  }
};

//  DELETE /users/:id  =====
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

    await user.destroy();
    return res.status(200).json({ message: 'Usuario eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    return res.status(500).json({ message: 'Error al eliminar el usuario.' });
  }
};