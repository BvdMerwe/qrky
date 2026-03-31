import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';

// Global cleanup: restore all mocks except module-level spies
// Module-level spies (like console.error) should use mockClear() in their own afterEach
afterEach(() => {
    vi.clearAllMocks();
});
