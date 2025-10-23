import  type { Request, Response } from "express";
import {User} from "../models/userModel.js";
import { Op } from 'sequelize'; // Para consultas con operadores, como 'LIKE' para buscar por email.
import bcrypt from 'bcryptjs';
import type {UserCreationAttributes} from "../types/userInterface.js";


// 1. Obtener todos los usuarios
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      include: ['role', 'department'], // Incluir la relación con 'role' y 'department'
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    res.status(500).json({ message: 'Error al obtener los usuarios.' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { first_name, last_name, email, password, role_id, department_id } = req.body;

  try {
    // Verificar si el email ya está registrado
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado.' });
    }

    // Hashear la contraseña usando bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el nuevo usuario en la base de datos
    const newUser = await User.create({
      first_name,
      last_name,
      email,
      password_hash: hashedPassword,
      role_id,
      department_id,
    } as UserCreationAttributes);  // Asegurándote de que se cumpla el tipo UserCreationAttributes

    res.status(201).json(newUser); // Retornar el nuevo usuario creado
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500).json({ message: 'Error al crear el usuario.' });
  }
};
// 3. Actualizar un usuario
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { first_name, last_name, email, password, role_id, department_id } = req.body;

  try {
    // Buscar el usuario por ID
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Si la contraseña fue enviada, la hasheamos
    let updatedData: any = { first_name, last_name, email, role_id, department_id };
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedData.password_hash = hashedPassword;
    }

    // Actualizar el usuario
    await user.update(updatedData);
    res.status(200).json(user); // Retornar el usuario actualizado
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.status(500).json({ message: 'Error al actualizar el usuario.' });
  }
};

// 4. Eliminar un usuario
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Buscar el usuario por ID
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Eliminar el usuario de la base de datos
    await user.destroy();
    res.status(200).json({ message: 'Usuario eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    res.status(500).json({ message: 'Error al eliminar el usuario.' });
  }
};

