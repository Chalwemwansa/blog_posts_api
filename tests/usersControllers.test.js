const request = require('supertest');
const app = require('../server');

describe('UsersController', () => {
  it('should get all users', async () => {
    const response = await request(app).get('/api/users');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Get all users');
  });

  it('should get a user by ID', async () => {
    const response = await request(app).get('/api/user/1');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Get user with ID 1');
  });

  it('should add a new user', async () => {
    const response = await request(app).post('/api/signup').send({
      username: 'newuser',
      password: 'newpassword',
    });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Add new user');
  });

  it('should edit a user', async () => {
    const response = await request(app).put('/api/user').send({
      userId: 1,
      username: 'updateduser',
    });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Edit user');
  });

  it('should delete a user', async () => {
    const response = await request(app).delete('/api/user').send({
      userId: 1,
    });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Delete user');
  });

  it('should delete a user picture', async () => {
    const response = await request(app).delete('/api/user/picture').send({
      userId: 1,
    });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Delete user picture');
  });
});