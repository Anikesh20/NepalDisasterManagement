const bcrypt = require('bcryptjs');
const User = require('../models/user');

describe('User model unit tests', () => {
  describe('verifyPassword', () => {
    it('returns true for correct password', async () => {
      const password = 'testpassword123';
      const hashed = await bcrypt.hash(password, 10);
      const user = { email: 'test@example.com', password: hashed };
      const result = await User.verifyPassword(user, password);
      expect(result).toBe(true);
    });
    it('returns false for incorrect password', async () => {
      const password = 'testpassword123';
      const hashed = await bcrypt.hash(password, 10);
      const user = { email: 'test@example.com', password: hashed };
      const result = await User.verifyPassword(user, 'wrongpassword');
      expect(result).toBe(false);
    });
  });
}); 