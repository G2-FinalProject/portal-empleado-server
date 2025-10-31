import  type { Request, Response } from "express";
import {User} from "../models/userModel.js";
import bcrypt from 'bcryptjs';
import type {UserCreationAttributes} from "../types/userInterface.js";


export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] }, //  No enviamos la contraseña hasheada
      include: ['role', 'department', 'location'], // Traemos los datos de rol y departamento y location
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
      include: ['role', 'department', 'location'],                  
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
  const { first_name, last_name, email, password, role_id, department_id, location_id} = req.body;

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
      location_id  // <-- Este es el nuevo campo obligatorio
    } as UserCreationAttributes); // <-- Asegúrate de que tu interface también esté actualizada
    // Volvemos a consultar el usuario sin enviar el hash
    const userResponse = await User.findByPk(newUser.id, {
      attributes: { exclude: ['password_hash'] },
      include: ['role', 'department', 'location'],
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
 const { first_name, last_name, email, password, role_id, department_id, location_id } = req.body;
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
    if (location_id !== undefined) updatedData.location_id = location_id; 

    // 4) Si llegó password, la hasheo
    if (password) {
      updatedData.password_hash = await bcrypt.hash(password, 10);
    }

    // 5) Actualizo
    await user.update(updatedData);

    // 6) Respondo SIN el hash y con relaciones (listo para el front)
    const safeUser = await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] },
      include: ['role', 'department', 'location'],
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


 //Obtiene el resumen de días de vacaciones de un usuario
 //Endpoint: GET /users/:id/vacations/summary
 
export const getVacationSummary = async (req: Request, res: Response) => {
  try {

    const requestedUserId = Number(req.params.id); // ID del usuario que se quiere ver
    const loggedInUserId = req.user!.id;           // ID del usuario que está logueado (sacado del token)
    const loggedInUserRole = req.user!.role;       // Rol de quien está logueado (role_id)

    // Busca al ususario solicitado
    const userToSummarize = await User.findByPk(requestedUserId);

    if (!userToSummarize) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // Hacemos una variable en false para cuando obtengamos la respuesta y se indentique al usuario pase a true y siga
    let isAuthorized = false;

    // a) Regla 1:(ID logueado === ID solicitado)
    if (requestedUserId === loggedInUserId) {
      isAuthorized = true;
    } 
    // b) Regla 2: ¿Eres Admin? (Rol 1)
    else if (loggedInUserRole === 1) { 
      isAuthorized = true;
    } 
    // c) Regla 3: ¿Eres Manager (Rol 2) Y él es de tu equipo?
    else if (loggedInUserRole === 2) {
      const manager = await User.findByPk(loggedInUserId);

      // Comprueba que el departamento del Manager sea el mismo que el del empleado solicitado
      if (manager && manager.department_id === userToSummarize.department_id) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ message: "Acceso denegado. No tienes permisos para ver el resumen de este usuario." });
    }
    
   
    
    // los dias que tienen por defecto los usuarios
    const allowanceDays = 23; 
    
    // Días Restantes: Viene directamente del saldo que actualizó el manager
    const remainingDays = userToSummarize.available_days; 
    
    // Días Usados: Es una simple resta
    const usedDays = allowanceDays - remainingDays; 

  // resultado de la resta
    return res.status(200).json({
      allowance_days: allowanceDays,
      remaining_days: remainingDays,
      used_days: usedDays,
    });

  } catch (error) {
    console.error('Error al obtener el resumen de vacaciones:', error);
    return res.status(500).json({ message: 'Error interno del servidor al obtener el resumen.' });
  }
};