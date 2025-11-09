import request from 'supertest';
import express from 'express';
import vacationRequestRouter from '../../src/routes/vacationRequestRoutes';
import router from '../../src/routes/vacationApprovalRoutes';
import { User } from '../../src/models/userModel';
import { Role } from '../../src/models/roleModel';
import { Department } from '../../src/models/departmentModel';
import { Location } from '../../src/models/locationModel';
import { VacationRequest } from '../../src/models/vacationRequestModel';
import { setupTestDatabase, cleanupTestDatabase } from '../helpers/setupDatabase';
import { tokenFor } from '../utils';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());
app.use('/vacations', vacationRequestRouter);
app.use('/vacations', router);

describe('Probar solicitudes de vacaciones', () => {
    let userId: number;
    let userRoleId: number;

    beforeAll(async () => {
        await setupTestDatabase();
    });

    afterAll(async () => {
        await cleanupTestDatabase();
    });

    beforeEach(async () => {

        await VacationRequest.destroy({ where: {}, force: true, cascade: true });
        await User.destroy({ where: {}, force: true, cascade: true });
        await Department.destroy({ where: {}, force: true });
        await Location.destroy({ where: {}, force: true });
        await Role.destroy({ where: {}, force: true });

        const role = await Role.create({ role_name: 'Employee' });
        const dept = await Department.create({ department_name: 'IT' });
        const loc = await Location.create({ location_name: 'HQ' });

        const hashedPassword = await bcrypt.hash('correcta', 10);

        const user = await User.create({
            first_name: 'Olga',
            last_name: 'Admin',
            email: 'olga@employee.com',
            password_hash: hashedPassword,
            role_id: role.id,
            department_id: dept.id,
            location_id: loc.id,
            available_days: 20,
        });

        userId = user.id;
        userRoleId = role.id;

    });

    describe('Crear solicitud de vacaciones', () => {
        it('debe devolver 201 y cuerpo de la solicitud', async () => {

            const token = tokenFor({ id: userId, role: userRoleId });

            const res = await request(app)
                .post('/vacations')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    start_date: '2025-12-20',
                    end_date: '2025-12-22',
                    comments: 'Vacaciones orr'
                });
            console.log('Status:', res.status);
            console.log('Body:', res.body);

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('message', '🎉 Solicitud de vacaciones creada correctamente.');
            expect(res.body).toHaveProperty('request');

            expect(res.body.request).toMatchObject({
                requester_id: userId,
                start_date: '2025-12-20',
                end_date: '2025-12-22',
                requested_days: 1,
                requester_comment: 'Vacaciones orr',
                request_status: 'pending',
            });

            expect(res.body.request).toHaveProperty('id');
            expect(res.body.request).toHaveProperty('createdAt');
            expect(res.body.request).toHaveProperty('updatedAt');
        });
    });


    describe('Aprobar solicitud de vacaciones', () => {

        // Variables para los dos usuarios (Employee y Admin)
        let employeeId: number;
        let employeeRoleId: number;
        let adminId: number;
        let adminRoleId: number;
        let requestId: number;

        beforeEach(async () => {
            // 1. Limpiar base de datos
            await VacationRequest.destroy({ where: {}, force: true });
            await Department.destroy({ where: {}, force: true });
            await User.destroy({ where: {}, force: true });
            await Location.destroy({ where: {}, force: true });
            await Role.destroy({ where: {}, force: true });

            // 2. Crear roles
            const employeeRole = await Role.create({ role_name: 'Employee' });
            const adminRole = await Role.create({ role_name: 'Admin' });

            // 3. Crear departamento y ubicación
            const dept = await Department.create({ department_name: 'IT' });
            const loc = await Location.create({ location_name: 'Madrid' });

            const hashedPassword = await bcrypt.hash('password123', 10);

            // 4. Crear usuario EMPLOYEE (quien solicita vacaciones)
            const employee = await User.create({
                first_name: 'Olga',
                last_name: 'Employee',
                email: 'olga@employee.com',
                password_hash: hashedPassword,
                role_id: employeeRole.id,
                department_id: dept.id,
                location_id: loc.id,
                available_days: 20, // ← Tiene 20 días disponibles
            });

            // 5. Crear usuario ADMIN (quien aprueba)
            const admin = await User.create({
                first_name: 'Gabriela',
                last_name: 'Admin',
                email: 'gaby@admin.com',
                password_hash: hashedPassword,
                role_id: adminRole.id,
                department_id: dept.id, // Mismo departamento (aunque al admin no le importa)
                location_id: loc.id,
                available_days: 25,
            });

            // 6. Guardar los IDs para usar en los tests
            employeeId = employee.id;
            employeeRoleId = employeeRole.id;
            adminId = admin.id;
            adminRoleId = adminRole.id;

            // 7. Crear una solicitud de vacaciones del EMPLOYEE
            //    (simulando que ya la creó previamente)
            const vacationRequest = await VacationRequest.create({
                requester_id: employeeId,
                start_date: '2025-12-15', // Lunes
                end_date: '2025-12-17',   // Miércoles (3 días hábiles)
                requested_days: 3,
                requester_comment: 'Necesito descansar',
                request_status: 'pending',
            });

            requestId = vacationRequest.id;
        });

        it('Admin debe poder aprobar solicitud correctamente', async () => {
            // 1. Crear token del ADMIN
            const adminToken = tokenFor({ id: adminId, role: adminRoleId });

            // 2. Hacer la petición de aprobación
            const res = await request(app)
                .patch(`/vacations/${requestId}/review`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    status: 'approved',
                    comment: 'Aprobado, disfruta tus vacaciones'
                });

            // Debug
            console.log('Status:', res.status);
            console.log('Body:', JSON.stringify(res.body, null, 2));

            // 3. Verificar respuesta exitosa
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toContain('approved');

            // 4. Verificar que la solicitud cambió de estado
            expect(res.body.request).toMatchObject({
                id: requestId,
                requester_id: employeeId,
                request_status: 'approved',
                approver_comment: 'Aprobado, disfruta tus vacaciones',
            });

            // 5. Verificar que los días disponibles del EMPLOYEE se redujeron
            const updatedEmployee = await User.findByPk(employeeId);
            expect(updatedEmployee).not.toBeNull();
            expect(updatedEmployee!.available_days).toBe(17); // 20 - 3 = 17
        });

        it('Admin debe poder rechazar solicitud correctamente', async () => {
            const adminToken = tokenFor({ id: adminId, role: adminRoleId });

            const res = await request(app)
                .patch(`/vacations/${requestId}/review`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    status: 'rejected',
                    comment: 'No hay suficiente personal en esas fechas'
                });

            console.log('Status:', res.status);
            console.log('Body:', JSON.stringify(res.body, null, 2));

            expect(res.status).toBe(200);
            expect(res.body.request).toMatchObject({
                id: requestId,
                request_status: 'rejected',
                approver_comment: 'No hay suficiente personal en esas fechas',
            });

            // Los días NO deben reducirse cuando se rechaza
            const updatedEmployee = await User.findByPk(employeeId);
            expect(updatedEmployee!.available_days).toBe(20); // Siguen siendo 20
        });

        it('No debe poder aprobar una solicitud ya aprobada', async () => {
            const adminToken = tokenFor({ id: adminId, role: adminRoleId });

            // Primero la aprobamos
            await request(app)
                .patch(`/vacations/${requestId}/review`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'approved', comment: 'Primera aprobación' });

            // Intentamos aprobarla de nuevo
            const res = await request(app)
                .patch(`/vacations/${requestId}/review`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'approved', comment: 'Segunda aprobación' });

            expect(res.status).toBe(409);
            expect(res.body.message).toContain('ya fue approved');
        });

        it('Employee no debe poder aprobar solicitudes (403 Forbidden)', async () => {
            // Intentamos que el EMPLOYEE apruebe su propia solicitud
            const employeeToken = tokenFor({ id: employeeId, role: employeeRoleId });

            const res = await request(app)
                .patch(`/vacations/${requestId}/review`)
                .set('Authorization', `Bearer ${employeeToken}`)
                .send({
                    status: 'approved',
                    comment: 'Me apruebo yo mismo 😈'
                });

            expect(res.status).toBe(403); // Forbidden
            expect(res.body.message).toContain('No tienes permisos');
        });

        it('No debe aprobar si el empleado no tiene días suficientes', async () => {
            // Modificamos al empleado para que tenga solo 2 días disponibles
            await User.update(
                { available_days: 2 },
                { where: { id: employeeId } }
            );

            const adminToken = tokenFor({ id: adminId, role: adminRoleId });

            const res = await request(app)
                .patch(`/vacations/${requestId}/review`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    status: 'approved',
                    comment: 'Intentando aprobar'
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('no tiene');
            expect(res.body.message).toContain('días');
        });
    });


});
