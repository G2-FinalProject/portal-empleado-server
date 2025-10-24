import type { Request, Response } from "express";
import { User } from "../models/userModel.js";
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.js'; 

 // POST/auth/login
 
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Buscar si el usuario existe por su email
    const user = await User.findOne({ 
      where: { email },
      include: ['role', 'department'] // Incluimos esto para devolverlo
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Email o contraseña incorrectos.' });
    }

    //  Comparar la contraseña que nos da con la que está guardada
    const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Email o contraseña incorrectos.' });
    }

    //  ¡Si todo está bien, creamos su el token!
    const token = generateToken({
      id: user.id,
      role: user.role_id
    });
     
    const { password_hash, ...userResponse } = user.toJSON();// esto dice saca la contraseña y deja todo lo demas

        res.status(200).json({ token, user: userResponse });

  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error al iniciar sesión.' });
  }
};