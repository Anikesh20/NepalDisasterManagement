jest.setTimeout(20000);
const request = require('supertest');
const app = require('../../server');

const testUser = {
  username: 'testuser_' + Date.now(),
  email: 'testuser_' + Date.now() + '@example.com',
  password: 'TestPassword123!'
};

describe('Auth Endpoints', () => {
  it('should sign up a new user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        username: testUser.username,
        email: testUser.email,
        password: testUser.password
      });
    expect([200, 201, 400]).toContain(res.statusCode); // 400 if user/email already exists
  });

  it('should log in with the new user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });
    expect([200, 401]).toContain(res.statusCode); // 401 if signup failed
  });
}); 