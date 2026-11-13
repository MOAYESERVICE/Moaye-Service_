import { ApiError } from "../utils/ApiError.js";

// À placer après requireAuth : ce middleware a alors accès au compte connecté.
export function requireRole(...allowedRoles) {
  return (req, _res, next) => {
    // Sans utilisateur authentifié, on refuse l'accès.
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    // Un utilisateur connecté n'est pas forcément autorisé à administrer les produits.
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden());
    }

    // Le compte possède un rôle autorisé : Express peut poursuivre vers la route.
    return next();
  };
}