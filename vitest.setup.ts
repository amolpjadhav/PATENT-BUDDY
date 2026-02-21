// Global mocks applied before every test file

// ── Silence console.error / console.warn in tests unless overridden ──────────
import { vi } from "vitest";

vi.spyOn(console, "error").mockImplementation(() => {});
vi.spyOn(console, "warn").mockImplementation(() => {});
