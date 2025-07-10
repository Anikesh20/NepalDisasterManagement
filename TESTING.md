# Testing Documentation

This document describes the testing strategy, tools, and instructions for the Nepal Disaster Management project.

---

## 1. Types of Testing

- **Unit Testing:** Test individual components, functions, or modules.
- **Integration Testing:** Test how different parts of the app work together.
- **End-to-End (E2E) Testing:** Test the entire app flow as a user would (not yet set up, see suggestions below).
- **Manual Testing:** Exploratory and device testing.
- **Performance & Security Testing:** (To be added as the project matures)

---

## 2. Tools Used

### Frontend (React Native)
- **Jest:** Test runner for JavaScript/TypeScript.
- **@testing-library/react-native:** For rendering and interacting with React Native components.

### Backend (Node.js/Express)
- **Jest:** Test runner.
- **Supertest:** For HTTP assertions and endpoint testing.

---

## 3. Test File Locations

- **Frontend:**
  - Unit/integration tests: `app/components/*.test.tsx`, or alongside components.
- **Backend:**
  - Tests: `backend/__tests__/*.test.js`

---

## 4. How to Run Tests

### Frontend
1. Install dependencies (if not already):
   ```sh
   npm install
   ```
2. Run tests:
   ```sh
   npm test
   ```

### Backend
1. Install dependencies:
   ```sh
   cd backend
   npm install
   ```
2. Run tests:
   ```sh
   npm test
   ```

---

## 5. Example Test Files

### Frontend Example: `app/components/Button.test.tsx`
```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from './Button';

describe('Button', () => {
  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button title="Click me" onPress={onPressMock} />);
    fireEvent.press(getByText('Click me'));
    expect(onPressMock).toHaveBeenCalled();
  });
});
```

### Backend Example: `backend/__tests__/reports.test.js`
```js
const request = require('supertest');
const app = require('../server');

describe('GET /reports', () => {
  it('should return an array of reports', async () => {
    const res = await request(app).get('/reports');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
```

---

## 6. Suggestions for Further Testing
- **E2E Testing:** Consider adding Detox (for React Native) or Appium for full app flow testing.
- **Performance Testing:** Use tools like Artillery or JMeter for backend, and React Native performance profiling for frontend.
- **Security Testing:** Use OWASP ZAP or manual security reviews for backend APIs.
- **Accessibility Testing:** Use axe or React Native Accessibility API for frontend.

---

## 7. Manual Testing
- Test on multiple devices/emulators.
- Check for UI/UX consistency, responsiveness, and error handling.

---

## 8. Troubleshooting
- If you encounter dependency issues, try installing with `--legacy-peer-deps`.
- For more help, see the official documentation for Jest, React Native Testing Library, and Supertest. 