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

describe('Probar solicitudes de vacaciones', () => {

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

        await User.create({
            first_name: 'Olga',
            last_name: 'Admin',
            email: 'olga@employee.com',
            password_hash: hashedPassword,
            role_id: role.id,
            department_id: dept.id,
            location_id: loc.id,
            available_days: 20,
        });

    });

    describe('Crear solicitud de vacaciones', () => {
        it('debe devolver 201 y cuerpo de la solicitud', async () => {

            const token = tokenFor({ id: 1, role: 3 });

            const res = await request(app)
                .post('/vacations')
                .set('Authorization', `Bearer ${token}`)
                .send({ start_date: '2025-12-20', end_date: '2025-12-22', requested_days: 3, comments: 'Vacaciones orr' })
                ;

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('message', '🎉 Solicitud de vacaciones creada correctamente.');
            expect(res.body).toHaveProperty('request');

            expect(res.body.request).toMatchObject({
                requester_id: 1,
                start_date: '2025-12-20',
                end_date: '2025-12-22',
                requested_days: 3,
                requester_comment: 'Vacaciones orr',
                request_status: 'pending',
            });

            expect(res.body.request).toHaveProperty('id');
            expect(res.body.request).toHaveProperty('createdAt');
            expect(res.body.request).toHaveProperty('updatedAt');
        });
    });
});
