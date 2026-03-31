import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';

// Global cleanup: restore all mocks after each test to prevent leakage between test files
// This restores original implementations AND resets call counts
afterEach(() => {
    vi.restoreAllMocks();
});
