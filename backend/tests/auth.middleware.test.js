import { jest } from "@jest/globals";

process.env.JWT_SECRET ??= "a".repeat(64);
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";

const findUserById = jest.fn();

jest.unstable_mockModule("../src/modules/users/user.repository.js", () => ({
  findUserById,
}));

const [{ requireAuth }, { createAccessToken, createRefreshToken }] =
  await Promise.all([
    import("../src/middlewares/auth.middleware.js"),
    import("../src/utils/jwt.js"),
  ]);

describe("requireAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects refresh tokens as access tokens", async () => {
    const req = {
      headers: { authorization: `Bearer ${createRefreshToken(7)}` },
    };
    const next = jest.fn();

    await requireAuth(req, {}, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401 }),
    );
    expect(findUserById).not.toHaveBeenCalled();
  });

  it("attaches an active user for a valid access token", async () => {
    const user = { id: 7, isActive: true };
    findUserById.mockResolvedValue(user);
    const req = {
      headers: { authorization: `Bearer ${createAccessToken(user.id)}` },
    };
    const next = jest.fn();

    await requireAuth(req, {}, next);

    expect(findUserById).toHaveBeenCalledWith(user.id);
    expect(req.user).toBe(user);
    expect(next).toHaveBeenCalledWith();
  });

  it("rejects malformed authorization headers", async () => {
    const req = { headers: { authorization: "Bearer token extra" } };
    const next = jest.fn();

    await requireAuth(req, {}, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401 }),
    );
    expect(findUserById).not.toHaveBeenCalled();
  });
});
