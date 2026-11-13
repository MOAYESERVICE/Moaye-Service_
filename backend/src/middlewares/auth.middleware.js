import { ApiError } from "../utils/ApiError.js";
import { findUserById } from "../modules/users/user.repository.js";
import { verifyAccessToken } from "../utils/jwt.js";

export async function requireAuth(req, _res, next) {
  const authorization = req.headers.authorization ?? "";
  const match = /^Bearer\s+(\S+)$/.exec(authorization);

  if (!match) {
    return next(ApiError.unauthorized());
  }

  const payload = verifyAccessToken(match[1]);

  if (!payload) {
    return next(ApiError.unauthorized());
  }

  const userId = Number(payload.sub);

  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return next(ApiError.unauthorized());
  }

  const user = await findUserById(userId);

  if (!user || !user.isActive) {
    return next(ApiError.unauthorized());
  }

  req.user = user;
  return next();
}
