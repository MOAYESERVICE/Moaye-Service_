import { jest } from "@jest/globals";

process.env.JWT_SECRET ??= "a".repeat(64);
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";

const createAccessToken = jest.fn(() => "new-access");
const createRefreshToken = jest.fn(() => "new-refresh");
const verifyRefreshToken = jest.fn();
const findUserById = jest.fn();
const findValidRefreshToken = jest.fn();
const rotateRefreshToken = jest.fn();

jest.unstable_mockModule("../src/utils/hash.js", () => ({
  comparePassword: jest.fn(),
  hashPassword: jest.fn(),
}));
jest.unstable_mockModule("../src/utils/jwt.js", () => ({
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
}));
jest.unstable_mockModule("../src/modules/users/user.repository.js", () => ({
  createUser: jest.fn(),
  findUserByEmail: jest.fn(),
  findUserById,
}));
jest.unstable_mockModule("../src/modules/auth/refreshToken.repository.js", () => ({
  createRefreshToken: jest.fn(),
  findValidRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken: jest.fn(),
  revokeAllUserTokens: jest.fn(),
}));

const { refreshAccessToken } = await import("../src/modules/auth/auth.service.js");

describe("refreshAccessToken", () => {
  const user = { id: 7, isActive: true };

  beforeEach(() => {
    jest.clearAllMocks();
    verifyRefreshToken.mockReturnValue({ sub: "7" });
    findValidRefreshToken.mockResolvedValue({
      userId: 7,
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
    });
    findUserById.mockResolvedValue(user);
    rotateRefreshToken.mockResolvedValue(true);
  });

  it("rotates the refresh token before returning a new token pair", async () => {
    await expect(refreshAccessToken("old-refresh")).resolves.toEqual({
      accessToken: "new-access",
      refreshToken: "new-refresh",
    });

    expect(rotateRefreshToken).toHaveBeenCalledWith(
      7,
      "old-refresh",
      "new-refresh",
      expect.any(Date),
    );
    expect(createAccessToken).toHaveBeenCalledWith(7);
  });

  it("rejects a token that was revoked or already rotated", async () => {
    rotateRefreshToken.mockResolvedValue(false);

    await expect(refreshAccessToken("old-refresh")).rejects.toMatchObject({
      statusCode: 401,
    });
    expect(createAccessToken).not.toHaveBeenCalled();
  });

  it("rejects an expired token before attempting rotation", async () => {
    findValidRefreshToken.mockResolvedValue({
      userId: 7,
      expiresAt: new Date(Date.now() - 60_000),
      revokedAt: null,
    });

    await expect(refreshAccessToken("old-refresh")).rejects.toMatchObject({
      statusCode: 401,
    });
    expect(rotateRefreshToken).not.toHaveBeenCalled();
  });
});
