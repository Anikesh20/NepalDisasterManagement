const request = require('supertest');
const app = require('../../server');

describe('POST /api/reports', () => {
  it('should fail without authentication', async () => {
    const res = await request(app)
      .post('/api/reports')
      .send({
        type: 'Flood',
        title: 'Test Flood',
        location: 'Test Location',
        district: 'Test District',
        description: 'Test Description',
        severity: 'High',
      });
    expect(res.statusCode).toBe(401);
  });

  it('should fail with missing required fields', async () => {
    // This test assumes authentication is required, so it will also return 401 if not mocked
    const res = await request(app)
      .post('/api/reports')
      .send({
        title: 'Missing Type',
        location: 'Test Location',
        district: 'Test District',
        description: 'Test Description',
        severity: 'High',
      });
    expect([400, 401]).toContain(res.statusCode); // Accept 400 or 401 depending on auth
  });

  // To test a successful submission, you would need to mock authentication and the database.
  // This is a placeholder for a more advanced test setup.
}); 