import { describe, it, expect, vi, beforeEach } from "vitest";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { updateAlias } from "./actions";

vi.mock("@/lib/supabase/server", () => ({
    createClient: vi.fn()
}));

vi.mock("next/navigation", () => ({
    redirect: vi.fn((url: string) => {
        throw new Error(`REDIRECT:${url}`);
    }),
    RedirectType: { push: "push" }
}));

describe("updateAlias", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("throws error for invalid aliasId", async () => {
        const formData = new FormData();
        formData.append("aliasId", "");
        formData.append("alias", "valid-alias");

        await expect(updateAlias(formData)).rejects.toThrow("Invalid input");
    });

    it("throws error for invalid alias", async () => {
        const formData = new FormData();
        formData.append("aliasId", "1");
        formData.append("alias", "");

        await expect(updateAlias(formData)).rejects.toThrow("Invalid input");
    });

    it("throws error for alias with invalid characters", async () => {
        const { createClient } = await import("@/lib/supabase/server");
        vi.mocked(createClient).mockResolvedValue({
            from: vi.fn(() => ({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn(() => ({ data: { id: 1, value: "old-alias", url_object_id: 1 }, error: null }))
                    }))
                }))
            }))
        } as any);

        const formData = new FormData();
        formData.append("aliasId", "1");
        formData.append("alias", "invalid@alias");

        await expect(updateAlias(formData)).rejects.toThrow("Alias can only contain letters, numbers, and hyphens");
    });

    it("throws error for reserved alias name", async () => {
        const formData = new FormData();
        formData.append("aliasId", "1");
        formData.append("alias", "dashboard");

        await expect(updateAlias(formData)).rejects.toThrow("reserved name");
    });

    it("throws error for alias that is too short", async () => {
        const formData = new FormData();
        formData.append("aliasId", "1");
        formData.append("alias", "ab");

        await expect(updateAlias(formData)).rejects.toThrow("Alias must be between 3 and 50 characters");
    });

    it("throws error when alias not found", async () => {
        const { createClient } = await import("@/lib/supabase/server");
        vi.mocked(createClient).mockResolvedValue({
            from: vi.fn(() => ({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn(() => ({ data: null, error: new Error("Not found") }))
                    }))
                }))
            }))
        } as any);

        const formData = new FormData();
        formData.append("aliasId", "999");
        formData.append("alias", "new-alias");

        await expect(updateAlias(formData)).rejects.toThrow("Alias not found");
    });

    it("redirects when alias value unchanged", async () => {
        const { createClient } = await import("@/lib/supabase/server");
        vi.mocked(createClient).mockResolvedValue({
            from: vi.fn(() => ({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn(() => ({ data: { id: 1, value: "same-alias", url_object_id: 1 }, error: null }))
                    }))
                }))
            }))
        } as any);

        const formData = new FormData();
        formData.append("aliasId", "1");
        formData.append("alias", "SAME-ALIAS");

        await expect(updateAlias(formData)).rejects.toThrow("REDIRECT:/dashboard/urls");
    });

    it("throws error when new alias already exists", async () => {
        const { createClient } = await import("@/lib/supabase/server");
        vi.mocked(createClient).mockResolvedValue({
            from: vi.fn(() => ({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn(() => ({ data: { id: 1, value: "old-alias", url_object_id: 1 }, error: null })),
                        neq: vi.fn(() => ({
                            maybeSingle: vi.fn(() => ({ data: { id: 2, value: "taken-alias" }, error: null }))
                        }))
                    }))
                }))
            }))
        } as any);

        const formData = new FormData();
        formData.append("aliasId", "1");
        formData.append("alias", "taken-alias");

        await expect(updateAlias(formData)).rejects.toThrow("Alias already exists");
    });

    it("successfully updates alias when valid", async () => {
        const mockEq = vi.fn(() => ({ error: null }));
        
        const { createClient } = await import("@/lib/supabase/server");
        vi.mocked(createClient).mockResolvedValue({
            from: vi.fn(() => ({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn(() => ({ data: { id: 1, value: "old-alias", url_object_id: 1 }, error: null })),
                        neq: vi.fn(() => ({
                            maybeSingle: vi.fn(() => ({ data: null, error: null }))
                        }))
                    }))
                })),
                update: vi.fn(() => ({ eq: mockEq }))
            }))
        } as any);

        const formData = new FormData();
        formData.append("aliasId", "1");
        formData.append("alias", "new-alias");

        await expect(updateAlias(formData)).rejects.toThrow("REDIRECT:/dashboard/urls");
    });
});
