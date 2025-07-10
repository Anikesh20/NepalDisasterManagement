const request = require('supertest');
const app = require('../../server');

describe('GET /api/reports', () => {
  it('should return an array of reports', async () => {
    const res = await request(app).get('/api/reports');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
}); 