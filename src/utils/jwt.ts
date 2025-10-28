 import jwt from "jsonwebtoken";
 import config from '../config/config.js';

export interface TokenPayload {
  id: number;
  role: number; // Esto será el role_id
}

export const generateToken = (payload: TokenPayload): string => {
  
// valores del archivo config.ts
  const secret = config.jwt.jwtSecret;
  const expiresIn = config.jwt.jwtExpires;

  const token = jwt.sign(
    payload,
    secret,
    { expiresIn: expiresIn }
  );

  return token;
};
//verifica si el token es valido 
export const verifyToken = (token: string): TokenPayload | null => {
  try {
    // Verificamos el token con mi secret
    const decoded = jwt.verify(token, config.jwt.jwtSecret);
    
    // Devolvemos el contenido del pase 
    return decoded as TokenPayload;
  } catch (error) {
    // Si el token es falso o expiró, devolvemos null
    return null;
  }
};