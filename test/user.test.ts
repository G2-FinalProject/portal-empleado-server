import { jest } from '@jest/globals';

// ====  Mock of User model (in-memory repository) ====
const users: any[] = [];

await jest.unstable_mockModule('../src/models/userModel.js', () => ({
  User: {
    findAll: jest.fn(async () =>
      users.map(u => ({ ...u, password_hash: undefined }))
    ),
    findByPk: jest.fn(async (id: number) =>
      users.find(u => u.id === Number(id)) || null
    ),
    findOne: jest.fn(async ({ where: { email } }: any) =>
      users.find(u => u.email === email) || null
    ),
    create: jest.fn(async (data: any) => {
      const id = users.length + 1;
      const u = { id, ...data };
      users.push(u);
      return u;
    }),
    update: jest.fn(async (data: any) => Object.assign({}, data)),
    destroy: jest.fn(async () => ({})),
  },
}));

// ==== 2 Import the real controller ====
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getVacationSummary,
} = await import('../src/controllers/UserController.js');

// ==== 3 Helpers to simulate req/res ====
function mockRes() {
  const res: any = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

// ==== 4 Tests ====
describe('UserController (unit tests)', () => {
  beforeEach(() => {
    // Reset mock database
    users.length = 0;
    users.push(
      { id: 1, first_name: 'Admin', last_name: 'User', email: 'admin@test.com', password_hash: 'x', role_id: 1, department_id: 1, location_id: 1, available_days: 23 },
      { id: 2, first_name: 'Manager', last_name: 'User', email: 'manager@test.com', password_hash: 'x', role_id: 2, department_id: 1, location_id: 1, available_days: 23 },
      { id: 3, first_name: 'Emp', last_name: 'One', email: 'emp1@test.com', password_hash: 'x', role_id: 3, department_id: 1, location_id: 1, available_days: 23 },
      { id: 4, first_name: 'Emp', last_name: 'Two', email: 'emp2@test.com', password_hash: 'x', role_id: 3, department_id: 2, location_id: 1, available_days: 23 }
    );
  });

  // ==== GET /users ====
  it('should return 200 and a list of users', async () => {
    const req: any = {};
    const res = mockRes();

    await getUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0]).toHaveLength(4);
  });

  // ==== GET /users/:id ====
  it('should return 404 when user does not exist', async () => {
    const req: any = { params: { id: '999' } };
    const res = mockRes();

    await getUserById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should return 200 when user exists', async () => {
    const req: any = { params: { id: '1' } };
    const res = mockRes();

    await getUserById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].email).toBe('admin@test.com');
  });

  // ==== POST /users ====
  it('should return 400 when email already exists', async () => {
    const req: any = {
      body: {
        first_name: 'X',
        last_name: 'Y',
        email: 'emp1@test.com',
        password: 'x',
        role_id: 3,
        department_id: 1,
        location_id: 1,
      },
    };
    const res = mockRes();

    await createUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should create a new user and return 201', async () => {
    const req: any = {
      body: {
        first_name: 'New',
        last_name: 'User',
        email: 'new@test.com',
        password: 'x',
        role_id: 3,
        department_id: 1,
        location_id: 1,
      },
    };
    const res = mockRes();

    await createUser(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  // ==== PATCH /users/:id ====
  it('should return 404 when updating a non-existing user', async () => {
    const req: any = { params: { id: '999' }, body: { first_name: 'X' } };
    const res = mockRes();

    await updateUser(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  // ==== DELETE /users/:id ====
  it('should return 404 when deleting a non-existing user', async () => {
    const req: any = { params: { id: '999' } };
    const res = mockRes();

    await deleteUser(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  // ==== GET /users/:id/vacations/summary ====
  it('should return 200 when fetching own vacation summary', async () => {
    const req: any = { params: { id: '3' }, user: { id: 3, role: 3 } };
    const res = mockRes();

    await getVacationSummary(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0]).toHaveProperty('allowance_days', 23);
  });

  it('should return 403 when a manager accesses another department summary', async () => {
    const req: any = { params: { id: '4' }, user: { id: 2, role: 2 } };
    const res = mockRes();

    await getVacationSummary(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
