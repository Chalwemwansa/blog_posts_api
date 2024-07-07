const request = require('supertest');
const app = require('../server');

describe('AuthController', () => {
  it('should sign in successfully', async () => {
    const response = await request(app).post('/api/signin').send({
      username: 'testuser',
      password: 'testpassword',
    });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Sign in successful');
  });

  it('should sign out successfully', async () => {
    const response = await request(app).post('/api/signout');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Sign out successful');
  });
});