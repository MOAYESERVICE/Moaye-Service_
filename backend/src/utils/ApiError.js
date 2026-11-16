// Cette classe représente une erreur que l'API peut renvoyer au client
export class ApiError extends Error {
  constructor(statusCode, message) {
    // Error est la classe standard des erreurs JavaScript
    super(message)

    // Code HTTP associé, par exemple 404
    this.statusCode = statusCode

    // Indique que l'erreur est prévue par l'application
    this.isOperational = true
  }

  // 400 : les données envoyées sont incorrectes
  static badRequest(message = "Requête invalide") {
    return new ApiError(400, message)
  }

  // 401 : l'utilisateur n'est pas authentifié
  static unauthorized(message = "Non authentifié") {
    return new ApiError(401, message)
  }

  // 403 : l'utilisateur n'a pas le droit d'effectuer cette action
  static forbidden(message = "Accès refusé") {
    return new ApiError(403, message)
  }

  // 404 : la ressource demandée n'existe pas
  static notFound(message = "Ressource introuvable") {
    return new ApiError(404, message)
  }

  // 409 : l'action entre en conflit avec une donnée existante
  static conflict(message = "Conflit") {
    return new ApiError(409, message)
  }

  // 503 : un service externe nécessaire n'est pas configuré ou disponible.
  static serviceUnavailable(message = "Service temporairement indisponible") {
    return new ApiError(503, message)
  }
}
