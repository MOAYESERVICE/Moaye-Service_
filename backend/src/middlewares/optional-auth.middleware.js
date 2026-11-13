import { ApiError } from "../utils/ApiError.js";
import { findUserById } from "../modules/users/user.repository.js";
import { verifyAccessToken } from "../utils/jwt.js";

// Allows guest quote requests while validating any session token that is provided.
export async function optionalAuth(req, _res, next) {
  const authorization = req.headers.authorization;
  if (!authorization) return next();

  const match = /^Bearer\s+(\S+)$/.exec(authorization);
  if (!match) return next(ApiError.unauthorized());

  const payload = verifyAccessToken(match[1]);
  const userId = Number(payload?.sub);
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return next(ApiError.unauthorized());
  }

  const user = await findUserById(userId);
  if (!user || !user.isActive) return next(ApiError.unauthorized());

  req.user = user;
  return next();
}
