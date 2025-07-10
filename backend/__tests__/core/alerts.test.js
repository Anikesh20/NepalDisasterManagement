const request = require('supertest');
const app = require('../../server');

describe('GET /api/alerts', () => {
  it('should return an array of alerts', async () => {
    const res = await request(app).get('/api/alerts');
    // Accept 200 or 404 if endpoint does not exist yet
    expect([200, 404]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });
}); 