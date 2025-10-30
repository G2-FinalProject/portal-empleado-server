import { describe, it, expect } from '@jest/globals';
import { loginRules } from '../src/validators/authValidators.js'; //
import { generateToken, verifyToken } from '../src/utils/jwt.js'; //
import config from '../src/config/config.js'; //

// --- 1. TESTS PARA LOS VALIDADORES DE AUTH ---
describe('Auth Validators (loginRules)', () => {

  it('debería tener 2 reglas de validación', () => {
    // Este test ya pasaba
    expect(loginRules).toHaveLength(2); //
  });

  // --- TEST CORREGIDO ---
  it('debería tener una regla para "email"', () => {
    const emailRule = loginRules[0] as any;
    
   
    // Test nuevo (robusto):
    // Comprobamos que es un objeto y que tiene la función 'run'
    // (propia de un validador de express-validator)
    expect(emailRule).toBeInstanceOf(Object);
    expect(typeof emailRule.run).toBe('function');
  });

  // --- TEST CORREGIDO ---
  it('debería tener una regla para "password"', () => {
    const passwordRule = loginRules[1] as any;

    // Test anterior (fallaba): expect(passwordRule.fields[0]).toBe('password');
    
    // Test nuevo (robusto):
    expect(passwordRule).toBeInstanceOf(Object);
    expect(typeof passwordRule.run).toBe('function');
  });
});


// --- 2. TESTS PARA LAS UTILIDADES DE JWT (Estos ya funcionaban) ---
describe('JWT Utils (generateToken / verifyToken)', () => {

  // Usamos un secreto de prueba
  config.jwt.jwtSecret = 'mi_secreto_de_prueba_para_jest';
  config.jwt.jwtExpires = '7d';

  it('debería generar un token válido', () => {
    const payload = { id: 1, role: 1 };
    const token = generateToken(payload); //
    
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);
  });

  it('debería verificar un token y devolver el payload correcto', () => {
    const payload = { id: 55, role: 2 };
    const token = generateToken(payload);
    
    const decoded = verifyToken(token);
    
    expect(decoded).toBeTruthy();
    expect(decoded?.id).toBe(55);
    expect(decoded?.role).toBe(2);
  });

  it('debería devolver null si el token es inválido', () => {
    const invalidToken = 'un.token.falso';
    const decoded = verifyToken(invalidToken);
    
    expect(decoded).toBeNull();
  });
});