import request from 'supertest';
import express from 'express';
import vacationRequestRouter from '../../src/routes/vacationRequestRoutes';
import vacationApprovalRouter from '../../src/routes/vacationApprovalRoutes';
import { User } from '../../src/models/userModel';
import { VacationRequest } from '../../src/models/vacationRequestModel';
import { setupTestDatabase, cleanupTestDatabase } from '../helpers/setupDatabase';
import { seedCoHispaniaUsers } from '../helpers/seedCoHispaniaUsers';
import { cleanDatabase } from '../helpers/cleanDatabase';


const app = express();
app.use(express.json());
app.use('/vacations', vacationRequestRouter);
app.use('/vacations', vacationApprovalRouter);

describe('Vacation Requests - Integration Tests', () => {
    beforeAll(async () => {
        await setupTestDatabase();
    });

    afterAll(async () => {
        await cleanupTestDatabase();
    });


   

  // ==========================================
  // 1: CREAR SOLICITUDES
  // ==========================================
  describe('POST /vacations - Crear solicitud de vacaciones', () => {
    let seededData: Awaited<ReturnType<typeof seedCoHispaniaUsers>>;

    beforeEach(async () => {
      await cleanDatabase();
      seededData = await seedCoHispaniaUsers();
    });

    it('✅ Employee puede crear solicitud válida', async () => {
      const res = await request(app)
        .post('/vacations')
        .set('Authorization', `Bearer ${seededData.tokens.employeeIDToken}`)
        .send({
          start_date: '2025-12-15', // Lunes
          end_date: '2025-12-17',   // Miércoles
          comments: 'Vacaciones de fin de año'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message', '🎉 Solicitud de vacaciones creada correctamente.');
      expect(res.body).toHaveProperty('request');

      expect(res.body.request).toMatchObject({
        requester_id: seededData.userIds.employeeIDId,
        start_date: '2025-12-15',
        end_date: '2025-12-17',
        requester_comment: 'Vacaciones de fin de año',
        request_status: 'pending',
      });

      expect(res.body.request).toHaveProperty('id');
      expect(res.body.request).toHaveProperty('requested_days');
      expect(res.body.request).toHaveProperty('createdAt');
      expect(res.body.request).toHaveProperty('updatedAt');
    });
  });

  // ==========================================
  // 2: VALIDACIONES EN CREACIÓN
  // ==========================================
  describe('POST /vacations - Validaciones', () => {
    let seededData: Awaited<ReturnType<typeof seedCoHispaniaUsers>>;

    beforeEach(async () => {
      await cleanDatabase();
      seededData = await seedCoHispaniaUsers();
      
      // Modificar el employee para que tenga solo 5 días
      await User.update(
        { available_days: 5 },
        { where: { id: seededData.userIds.employeeIDId } }
      );
    });

    it('❌ No debe crear si end_date es anterior a start_date', async () => {
      const res = await request(app)
        .post('/vacations')
        .set('Authorization', `Bearer ${seededData.tokens.employeeIDToken}`)
        .send({
          start_date: '2025-12-20',
          end_date: '2025-12-15', // ← Anterior a start_date
          comments: 'Fechas inválidas'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('end_date cannot be earlier than start_date');
    });

    it('❌ No debe crear si el rango no contiene días hábiles', async () => {
      const res = await request(app)
        .post('/vacations')
        .set('Authorization', `Bearer ${seededData.tokens.employeeIDToken}`)
        .send({
          start_date: '2025-12-06', // Sábado
          end_date: '2025-12-07',   // Domingo
          comments: 'Solo fin de semana'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('no business days');
    });

    it('❌ No debe crear si requested_days supera available_days', async () => {
      // El usuario tiene solo 5 días disponibles
      const res = await request(app)
        .post('/vacations')
        .set('Authorization', `Bearer ${seededData.tokens.employeeIDToken}`)
        .send({
          start_date: '2025-12-15', // Lunes
          end_date: '2025-12-26',   // Viernes siguiente (10 días hábiles)
          comments: 'Más días de los disponibles'
        });

      expect(res.status).toBe(400);
      const errorMsg = JSON.stringify(res.body);
      expect(errorMsg).toMatch(/no puedes solicitar|Solo tienes/i);
    });
  });

  // ==========================================
  // 3: LISTADO DE SOLICITUDES (GET)
  // ==========================================
  describe('GET /vacations - Listado de solicitudes', () => {
    let seededData: Awaited<ReturnType<typeof seedCoHispaniaUsers>>;

    beforeEach(async () => {
      await cleanDatabase();
      seededData = await seedCoHispaniaUsers();

      // Crear 3 solicitudes de diferentes departamentos
      
      // Solicitud 1: Elena (I+D, Madrid)
      await VacationRequest.create({
        requester_id: seededData.userIds.employeeIDId,
        start_date: new Date('2025-12-15'),
        end_date: new Date('2025-12-17'),
        requested_days: 3,
        requester_comment: 'Vacaciones Elena (I+D)',
        request_status: 'pending',
      });

      // Solicitud 2: Ernesto (Sistemas, Barcelona)
      await VacationRequest.create({
        requester_id: seededData.userIds.employeeSistemasId,
        start_date: new Date('2025-12-18'),
        end_date: new Date('2025-12-19'),
        requested_days: 2,
        requester_comment: 'Vacaciones Ernesto (Sistemas)',
        request_status: 'pending',
      });

      // Solicitud 3: Elisa (Contabilidad, Pontevedra)
      await VacationRequest.create({
        requester_id: seededData.userIds.employeeContabilidadId,
        start_date: new Date('2025-12-20'),
        end_date: new Date('2025-12-22'),
        requested_days: 1,
        requester_comment: 'Vacaciones Elisa (Contabilidad)',
        request_status: 'pending',
      });
    });

    it('✅ Admin puede ver TODAS las solicitudes', async () => {
      const res = await request(app)
        .get('/vacations')
        .set('Authorization', `Bearer ${seededData.tokens.adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(3); // ← Ve las 3 solicitudes
    });

    it('✅ Manager I+D solo ve solicitudes de su departamento', async () => {
      const res = await request(app)
        .get('/vacations')
        .set('Authorization', `Bearer ${seededData.tokens.managerIDToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1); // ← Solo ve 1 (Elena de I+D)

      // Verificar que es del departamento correcto
      expect(res.body[0].requester.department_id).toBe(seededData.departmentIds.deptIDId);
      expect(res.body[0].requester_id).toBe(seededData.userIds.employeeIDId);
    });

    it('✅ Manager Sistemas solo ve solicitudes de su departamento', async () => {
      const res = await request(app)
        .get('/vacations')
        .set('Authorization', `Bearer ${seededData.tokens.managerSistemasToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1); // ← Solo ve 1 (Ernesto de Sistemas)

      // Verificar que es del departamento correcto
      expect(res.body[0].requester.department_id).toBe(seededData.departmentIds.deptSistemasId);
      expect(res.body[0].requester_id).toBe(seededData.userIds.employeeSistemasId);
    });

    it('✅ Employee solo ve SUS propias solicitudes', async () => {
      const res = await request(app)
        .get('/vacations/my-requests')
        .set('Authorization', `Bearer ${seededData.tokens.employeeIDToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1); // ← Solo ve la suya

      // Verificar que es su solicitud
      expect(res.body[0].requester_id).toBe(seededData.userIds.employeeIDId);
    });
  });

  // ==========================================
  // 4: APROBACIÓN POR ADMIN
  // ==========================================
  describe('PATCH /vacations/:id/review - Aprobación por Admin', () => {
    let seededData: Awaited<ReturnType<typeof seedCoHispaniaUsers>>;
    let requestId: number;

    beforeEach(async () => {
      await cleanDatabase();
      seededData = await seedCoHispaniaUsers();

      // Crear una solicitud pendiente
      const vacationRequest = await VacationRequest.create({
        requester_id: seededData.userIds.employeeIDId,
        start_date: new Date('2025-12-15'),
        end_date: new Date('2025-12-17'),
        requested_days: 3,
        requester_comment: 'Necesito descansar',
        request_status: 'pending',
      });
      requestId = vacationRequest.id;
    });

    it('✅ Admin puede aprobar solicitud correctamente', async () => {
      const res = await request(app)
        .patch(`/vacations/${requestId}/review`)
        .set('Authorization', `Bearer ${seededData.tokens.adminToken}`)
        .send({
          status: 'approved',
          comment: 'Aprobado, disfruta tus vacaciones'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('approved');

      expect(res.body.request).toMatchObject({
        id: requestId,
        requester_id: seededData.userIds.employeeIDId,
        request_status: 'approved',
        approver_comment: 'Aprobado, disfruta tus vacaciones',
      });

      // Verificar que los días se redujeron
      const updatedEmployee = await User.findByPk(seededData.userIds.employeeIDId);
      expect(updatedEmployee).not.toBeNull();
      expect(updatedEmployee!.available_days).toBe(20); // 23 - 3 = 20
    });

    it('✅ Admin puede rechazar solicitud correctamente', async () => {
      const res = await request(app)
        .patch(`/vacations/${requestId}/review`)
        .set('Authorization', `Bearer ${seededData.tokens.adminToken}`)
        .send({
          status: 'rejected',
          comment: 'No hay suficiente personal en esas fechas'
        });

      expect(res.status).toBe(200);
      expect(res.body.request).toMatchObject({
        id: requestId,
        request_status: 'rejected',
        approver_comment: 'No hay suficiente personal en esas fechas',
      });

      // Los días NO deben reducirse cuando se rechaza
      const updatedEmployee = await User.findByPk(seededData.userIds.employeeIDId);
      expect(updatedEmployee!.available_days).toBe(23); // Siguen siendo 23
    });

    it('⚠️ No debe poder aprobar una solicitud ya aprobada (409)', async () => {
      // Primero la aprobamos
      await request(app)
        .patch(`/vacations/${requestId}/review`)
        .set('Authorization', `Bearer ${seededData.tokens.adminToken}`)
        .send({ status: 'approved', comment: 'Primera aprobación' });

      // Intentamos aprobarla de nuevo
      const res = await request(app)
        .patch(`/vacations/${requestId}/review`)
        .set('Authorization', `Bearer ${seededData.tokens.adminToken}`)
        .send({ status: 'approved', comment: 'Segunda aprobación' });

      expect(res.status).toBe(409); // Conflict
      expect(res.body.message).toContain('ya fue approved');
    });

    it('❌ Employee no debe poder aprobar solicitudes (403)', async () => {
      const res = await request(app)
        .patch(`/vacations/${requestId}/review`)
        .set('Authorization', `Bearer ${seededData.tokens.employeeIDToken}`)
        .send({
          status: 'approved',
          comment: 'Me apruebo yo mismo 😈'
        });

      expect(res.status).toBe(403); // Forbidden
      expect(res.body.message).toContain('No tienes permisos');
    });

    it('❌ No debe aprobar si el empleado no tiene días suficientes', async () => {
      // Modificar al empleado para que tenga solo 2 días
      await User.update(
        { available_days: 2 },
        { where: { id: seededData.userIds.employeeIDId } }
      );

      const res = await request(app)
        .patch(`/vacations/${requestId}/review`)
        .set('Authorization', `Bearer ${seededData.tokens.adminToken}`)
        .send({
          status: 'approved',
          comment: 'Intentando aprobar'
        });

      expect(res.status).toBe(400); // Bad Request
      expect(res.body.message).toContain('no tiene');
      expect(res.body.message).toContain('días');
    });
  });

  // ==========================================
  // 5: APROBACIÓN POR MANAGER
  // ==========================================
  describe('PATCH /vacations/:id/review - Aprobación por Manager', () => {
    let seededData: Awaited<ReturnType<typeof seedCoHispaniaUsers>>;
    let requestIDId: number;        // Solicitud de I+D
    let requestSistemasId: number;  // Solicitud de Sistemas

    beforeEach(async () => {
      await cleanDatabase();
      seededData = await seedCoHispaniaUsers();

      // Solicitud 1: Elena (I+D)
      const requestID = await VacationRequest.create({
        requester_id: seededData.userIds.employeeIDId,
        start_date: new Date('2025-12-15'),
        end_date: new Date('2025-12-17'),
        requested_days: 3,
        requester_comment: 'Vacaciones Elena',
        request_status: 'pending',
      });
      requestIDId = requestID.id;

      // Solicitud 2: Ernesto (Sistemas)
      const requestSistemas = await VacationRequest.create({
        requester_id: seededData.userIds.employeeSistemasId,
        start_date: new Date('2025-12-18'),
        end_date: new Date('2025-12-19'),
        requested_days: 2,
        requester_comment: 'Vacaciones Ernesto',
        request_status: 'pending',
      });
      requestSistemasId = requestSistemas.id;
    });

    it('✅ Manager I+D PUEDE aprobar solicitud de su departamento', async () => {
      const res = await request(app)
        .patch(`/vacations/${requestIDId}/review`)
        .set('Authorization', `Bearer ${seededData.tokens.managerIDToken}`)
        .send({
          status: 'approved',
          comment: 'Aprobado por el manager de I+D'
        });

      expect(res.status).toBe(200);
      expect(res.body.request.request_status).toBe('approved');

      // Verificar descuento de días
      const updatedEmployee = await User.findByPk(seededData.userIds.employeeIDId);
      expect(updatedEmployee!.available_days).toBe(20); // 23 - 3 = 20
    });

    it('❌ Manager I+D NO PUEDE aprobar solicitud de otro departamento', async () => {
      const res = await request(app)
        .patch(`/vacations/${requestSistemasId}/review`)
        .set('Authorization', `Bearer ${seededData.tokens.managerIDToken}`)
        .send({
          status: 'approved',
          comment: 'Intentando aprobar de otro departamento'
        });

      expect(res.status).toBe(403); // Forbidden
      expect(res.body.message).toContain('No tienes permisos para aprobar/rechazar solicitudes de otros departamentos.');
    });

    it('✅ Manager Sistemas PUEDE aprobar solicitud de su departamento', async () => {
      const res = await request(app)
        .patch(`/vacations/${requestSistemasId}/review`)
        .set('Authorization', `Bearer ${seededData.tokens.managerSistemasToken}`)
        .send({
          status: 'approved',
          comment: 'Aprobado por el manager de Sistemas'
        });

      expect(res.status).toBe(200);
      expect(res.body.request.request_status).toBe('approved');

      // Verificar descuento de días
      const updatedEmployee = await User.findByPk(seededData.userIds.employeeSistemasId);
      expect(updatedEmployee!.available_days).toBe(21); // 23 - 2 = 21
    });

    it('❌ Manager Sistemas NO PUEDE aprobar solicitud de otro departamento', async () => {
      const res = await request(app)
        .patch(`/vacations/${requestIDId}/review`)
        .set('Authorization', `Bearer ${seededData.tokens.managerSistemasToken}`)
        .send({
          status: 'approved',
          comment: 'Intentando aprobar de I+D'
        });

      expect(res.status).toBe(403); // Forbidden
      expect(res.body.message).toContain('No tienes permisos para aprobar/rechazar solicitudes de otros departamentos.');
    });
  });

// ==========================================
// 6: OBTENER SOLICITUD POR ID
// ==========================================
describe('GET /vacations/:id - Obtener solicitud por ID', () => {
  let seededData: Awaited<ReturnType<typeof seedCoHispaniaUsers>>;
  let requestId: number;

  beforeEach(async () => {
    await cleanDatabase();
    seededData = await seedCoHispaniaUsers();

    const request = await VacationRequest.create({
      requester_id: seededData.userIds.employeeIDId,
      start_date: new Date('2025-12-15'),
      end_date: new Date('2025-12-17'),
      requested_days: 3,
      requester_comment: 'Vacaciones test',
      request_status: 'pending',
    });
    requestId = request.id;
  });

  it('✅ Debe devolver una solicitud específica por ID', async () => {
    const res = await request(app)
      .get(`/vacations/${requestId}`)
      .set('Authorization', `Bearer ${seededData.tokens.employeeIDToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', requestId);
    expect(res.body).toHaveProperty('requester_id', seededData.userIds.employeeIDId);
    expect(res.body.requester).toHaveProperty('first_name', 'Elena');
  });

  it('❌ Debe devolver 404 si la solicitud no existe', async () => {
    const res = await request(app)
      .get('/vacations/99999')
      .set('Authorization', `Bearer ${seededData.tokens.employeeIDToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain('Solicitud no encontrada');
  });
});

// ==========================================
// 7: ACTUALIZAR SOLICITUD
// ==========================================
describe('PATCH /vacations/:id - Actualizar solicitud', () => {
  let seededData: Awaited<ReturnType<typeof seedCoHispaniaUsers>>;
  let requestId: number;

  beforeEach(async () => {
    await cleanDatabase();
    seededData = await seedCoHispaniaUsers();

    const request = await VacationRequest.create({
      requester_id: seededData.userIds.employeeIDId,
      start_date: new Date('2025-12-15'),
      end_date: new Date('2025-12-17'),
      requested_days: 3,
      requester_comment: 'Comentario original',
      request_status: 'pending',
    });
    requestId = request.id;
  });

  it('✅ Debe actualizar el comentario de la solicitud', async () => {
    const res = await request(app)
      .patch(`/vacations/${requestId}`)
      .set('Authorization', `Bearer ${seededData.tokens.employeeIDToken}`)
      .send({
        comments: 'Comentario actualizado'
      });

    expect(res.status).toBe(200);
    expect(res.body.requester_comment).toBe('Comentario actualizado');
  });

  it('✅ Debe actualizar las fechas y recalcular requested_days', async () => {
    const res = await request(app)
      .patch(`/vacations/${requestId}`)
      .set('Authorization', `Bearer ${seededData.tokens.employeeIDToken}`)
      .send({
        start_date: '2025-12-16', // Martes
        end_date: '2025-12-18',   // Jueves (3 días)
        comments: 'Fechas modificadas'
      });

    expect(res.status).toBe(200);
    expect(res.body.start_date).toBe('2025-12-16');
    expect(res.body.end_date).toBe('2025-12-18');
    expect(res.body.requested_days).toBe(3);
  });

  it('❌ Debe devolver 404 si la solicitud no existe', async () => {
    const res = await request(app)
      .patch('/vacations/99999')
      .set('Authorization', `Bearer ${seededData.tokens.employeeIDToken}`)
      .send({
        comments: 'Intentando actualizar'
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toContain('Solicitud no encontrada');
  });
});

// ==========================================
// 8: ELIMINAR SOLICITUD
// ==========================================
describe('DELETE /vacations/:id - Eliminar solicitud', () => {
  let seededData: Awaited<ReturnType<typeof seedCoHispaniaUsers>>;
  let requestId: number;

  beforeEach(async () => {
    await cleanDatabase();
    seededData = await seedCoHispaniaUsers();

    const request = await VacationRequest.create({
      requester_id: seededData.userIds.employeeIDId,
      start_date: new Date('2025-12-15'),
      end_date: new Date('2025-12-17'),
      requested_days: 3,
      requester_comment: 'Para eliminar',
      request_status: 'pending',
    });
    requestId = request.id;
  });

  it('✅ Debe eliminar una solicitud correctamente', async () => {
    const res = await request(app)
      .delete(`/vacations/${requestId}`)
      .set('Authorization', `Bearer ${seededData.tokens.employeeIDToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('eliminada exitosamente');

    // Verificar que realmente se eliminó
    const deleted = await VacationRequest.findByPk(requestId);
    expect(deleted).toBeNull();
  });

  it('❌ Debe devolver 404 si la solicitud no existe', async () => {
    const res = await request(app)
      .delete('/vacations/99999')
      .set('Authorization', `Bearer ${seededData.tokens.employeeIDToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain('Solicitud no encontrada');
  });
});

// ==========================================
// 9: CASOS EDGE - poco comunes
// ==========================================
describe('GET /vacations - Casos edge', () => {
  let seededData: Awaited<ReturnType<typeof seedCoHispaniaUsers>>;

  beforeEach(async () => {
    await cleanDatabase();
    seededData = await seedCoHispaniaUsers();
  });

  it('✅ Debe devolver array vacío si no hay solicitudes', async () => {
    const res = await request(app)
      .get('/vacations')
      .set('Authorization', `Bearer ${seededData.tokens.adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('✅ Manager ve array vacío si no hay solicitudes en su departamento', async () => {
    await VacationRequest.create({
      requester_id: seededData.userIds.employeeSistemasId,
      start_date: new Date('2025-12-15'),
      end_date: new Date('2025-12-17'),
      requested_days: 3,
      requester_comment: 'Solicitud de Sistemas',
      request_status: 'pending',
    });

    const res = await request(app)
      .get('/vacations')
      .set('Authorization', `Bearer ${seededData.tokens.managerIDToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(0);
  });
});

});
