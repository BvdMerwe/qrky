import { describe, it, expect, vi, beforeEach } from "vitest";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { updateQrCode } from "./actions";

vi.mock("@/lib/supabase/server", () => ({
    createClient: vi.fn()
}));

vi.mock("next/navigation", () => ({
    redirect: vi.fn((url: string) => {
        throw new Error(`REDIRECT:${url}`);
    }),
    RedirectType: { push: "push" }
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn()
}));

describe("updateQrCode", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("throws error for missing QR code ID", async () => {
        const formData = new FormData();
        formData.append("fg_color", "#000000");
        formData.append("bg_color", "#ffffff");
        formData.append("corner_radius", "0.45");

        await expect(updateQrCode(formData)).rejects.toThrow("Invalid input: missing QR code ID");
    });

    it("throws error for invalid foreground color", async () => {
        const formData = new FormData();
        formData.append("qr_code_id", "test-uuid");
        formData.append("fg_color", "not-a-color");
        formData.append("bg_color", "#ffffff");
        formData.append("corner_radius", "0.45");

        await expect(updateQrCode(formData)).rejects.toThrow("Invalid foreground color");
    });

    it("throws error for invalid background color", async () => {
        const formData = new FormData();
        formData.append("qr_code_id", "test-uuid");
        formData.append("fg_color", "#000000");
        formData.append("bg_color", "invalid");
        formData.append("corner_radius", "0.45");

        await expect(updateQrCode(formData)).rejects.toThrow("Invalid background color");
    });

    it("throws error for corner radius out of range", async () => {
        const formData = new FormData();
        formData.append("qr_code_id", "test-uuid");
        formData.append("fg_color", "#000000");
        formData.append("bg_color", "#ffffff");
        formData.append("corner_radius", "0.8");

        await expect(updateQrCode(formData)).rejects.toThrow("Invalid corner radius");
    });

    it("throws error for logo file too large", async () => {
        const { createClient } = await import("@/lib/supabase/server");
        vi.mocked(createClient).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "user-123" } },
                    error: null
                })
            },
            from: vi.fn(() => ({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn().mockResolvedValue({
                            data: { id: "qr-uuid", url_object_id: "url-id" },
                            error: null
                        })
                    }))
                })),
                update: vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) }))
            })),
            storage: {
                from: vi.fn(() => ({
                    upload: vi.fn(),
                    getPublicUrl: vi.fn()
                }))
            }
        } as any);

        const formData = new FormData();
        formData.append("qr_code_id", "test-uuid");
        formData.append("fg_color", "#000000");
        formData.append("bg_color", "#ffffff");
        
        const file = new File(["x".repeat(600 * 1024)], "logo.png", { type: "image/png" });
        formData.append("logo", file);

        await expect(updateQrCode(formData)).rejects.toThrow("file size must be less than 500KB");
    });

    it("throws error for invalid logo file type", async () => {
        const { createClient } = await import("@/lib/supabase/server");
        vi.mocked(createClient).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "user-123" } },
                    error: null
                })
            },
            from: vi.fn(() => ({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn().mockResolvedValue({
                            data: { id: "qr-uuid", url_object_id: "url-id" },
                            error: null
                        })
                    }))
                })),
                update: vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) }))
            })),
            storage: {
                from: vi.fn(() => ({
                    upload: vi.fn(),
                    getPublicUrl: vi.fn()
                }))
            }
        } as any);

        const formData = new FormData();
        formData.append("qr_code_id", "test-uuid");
        formData.append("fg_color", "#000000");
        formData.append("bg_color", "#ffffff");

        const file = new File(["test"], "logo.gif", { type: "image/gif" });
        formData.append("logo", file);

        await expect(updateQrCode(formData)).rejects.toThrow("only SVG, PNG, and JPG files are allowed");
    });

    it("throws error when user not authenticated", async () => {
        const { createClient } = await import("@/lib/supabase/server");
        vi.mocked(createClient).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: null },
                    error: new Error("Not authenticated")
                })
            }
        } as any);

        const formData = new FormData();
        formData.append("qr_code_id", "test-uuid");
        formData.append("fg_color", "#000000");
        formData.append("bg_color", "#ffffff");
        formData.append("corner_radius", "0.45");

        await expect(updateQrCode(formData)).rejects.toThrow("Authentication required");
    });

    it("throws error when QR code not found", async () => {
        const { createClient } = await import("@/lib/supabase/server");
        vi.mocked(createClient).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "user-123" } },
                    error: null
                })
            },
            from: vi.fn(() => ({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn().mockResolvedValue({
                            data: null,
                            error: new Error("Not found")
                        })
                    }))
                }))
            }))
        } as any);

        const formData = new FormData();
        formData.append("qr_code_id", "nonexistent-uuid");
        formData.append("fg_color", "#000000");
        formData.append("bg_color", "#ffffff");
        formData.append("corner_radius", "0.45");

        await expect(updateQrCode(formData)).rejects.toThrow("QR code not found");
    });

    it("redirects on successful update without logo", async () => {
        const mockEq = vi.fn(() => ({ error: null }));
        
        let callCount = 0;
        const { createClient } = await import("@/lib/supabase/server");
        vi.mocked(createClient).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "user-123" } },
                    error: null
                })
            },
            from: vi.fn(() => {
                callCount++;
                return {
                    select: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            single: vi.fn().mockResolvedValue({
                                data: callCount === 1 
                                    ? { id: "qr-uuid", url_object_id: "url-obj-id" }
                                    : { id: "url-obj-id", user_id: "user-123" },
                                error: null
                            })
                        }))
                    })),
                    update: vi.fn(() => ({ eq: mockEq }))
                };
            })
        } as any);

        const formData = new FormData();
        formData.append("qr_code_id", "qr-uuid");
        formData.append("fg_color", "#000000");
        formData.append("bg_color", "#ffffff");
        formData.append("corner_radius", "0.45");

        await expect(updateQrCode(formData)).rejects.toThrow("REDIRECT:/dashboard/urls");
    });

    it("redirects on successful update with logo", async () => {
        const mockUpload = vi.fn().mockResolvedValue({ error: null });
        
        let callCount = 0;
        const { createClient } = await import("@/lib/supabase/server");
        vi.mocked(createClient).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "user-123" } },
                    error: null
                })
            },
            from: vi.fn(() => {
                callCount++;
                return {
                    select: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            single: vi.fn().mockResolvedValue({
                                data: callCount === 1 
                                    ? { id: "qr-uuid", url_object_id: "url-obj-id" }
                                    : { id: "url-obj-id", user_id: "user-123" },
                                error: null
                            })
                        }))
                    })),
                    update: vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) }))
                };
            }),
            storage: {
                from: vi.fn(() => ({
                    upload: mockUpload,
                    getPublicUrl: vi.fn().mockReturnValue({
                        data: { publicUrl: "https://storage.example.com/qr-logos/user-123/test.png" }
                    })
                }))
            }
        } as any);

        const formData = new FormData();
        formData.append("qr_code_id", "qr-uuid");
        formData.append("fg_color", "#000000");
        formData.append("bg_color", "#ffffff");
        formData.append("corner_radius", "0.45");
        formData.append("logo_scale", "0.2");

        const file = new File(["test"], "logo.png", { type: "image/png" });
        formData.append("logo", file);

        await expect(updateQrCode(formData)).rejects.toThrow("REDIRECT:/dashboard/urls");
    });

    it("allows empty corner radius (use default)", async () => {
        const mockEq = vi.fn(() => ({ error: null }));
        
        let callCount = 0;
        const { createClient } = await import("@/lib/supabase/server");
        vi.mocked(createClient).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "user-123" } },
                    error: null
                })
            },
            from: vi.fn(() => {
                callCount++;
                return {
                    select: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            single: vi.fn().mockResolvedValue({
                                data: callCount === 1 
                                    ? { id: "qr-uuid", url_object_id: "url-obj-id" }
                                    : { id: "url-obj-id", user_id: "user-123" },
                                error: null
                            })
                        }))
                    })),
                    update: vi.fn(() => ({ eq: mockEq }))
                };
            })
        } as any);

        const formData = new FormData();
        formData.append("qr_code_id", "qr-uuid");
        formData.append("fg_color", "#000000");
        formData.append("bg_color", "#ffffff");
        // No corner_radius provided

        await expect(updateQrCode(formData)).rejects.toThrow("REDIRECT:/dashboard/urls");
    });
});
