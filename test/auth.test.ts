import { describe, it, expect } from '@jest/globals';
import { loginRules } from '../src/validators/authValidators.js'; //
import { generateToken, verifyToken } from '../src/utils/jwt.js'; //
import config from '../src/config/config.js'; //

//1. TESTS PARA LOS VALIDADORES DE AUTH ---
describe('Auth Validators (loginRules)', () => {

  it('should have 2 validation rules', () => {
    expect(loginRules).toHaveLength(2); //
  });

  
  it('should have a rule for "email"', () => {
    const emailRule = loginRules[0] as any;
    
    // Comprobamos que es un objeto y que tiene la función 'run'
    // (propia de un validador de express-validator)
    expect(emailRule).toBeInstanceOf(Object);
    expect(typeof emailRule.run).toBe('function');
  });

  it('should have a rule for "password"', () => {
    const passwordRule = loginRules[1] as any;

    expect(passwordRule).toBeInstanceOf(Object);
    expect(typeof passwordRule.run).toBe('function');
  });
});

 // 2. TESTS PARA LAS UTILIDADES DE JWT
describe('JWT Utils (generateToken / verifyToken)', () => {
// Usamos un secreto de prueba
  config.jwt.jwtSecret = 'my_test_secret_for_jest';
  config.jwt.jwtExpires = '7d';

  it('should generate a valid token', () => {
    const payload = { id: 1, role: 1 };
    const token = generateToken(payload); //
    
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);
  });

  it('should verify a token and return the correct payload', () => {
    const payload = { id: 55, role: 2 };
    const token = generateToken(payload);
    
    const decoded = verifyToken(token);
    
    expect(decoded).toBeTruthy();
    expect(decoded?.id).toBe(55);
    expect(decoded?.role).toBe(2);
  });

  it('should return null if the token is invalid', () => {
    const invalidToken = 'a.fake.token';
    const decoded = verifyToken(invalidToken);
    
    expect(decoded).toBeNull();
  });
});
