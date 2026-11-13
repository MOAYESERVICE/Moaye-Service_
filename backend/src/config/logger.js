/**
 * LOGGER STRUCTURÉ AVEC WINSTON
 * =============================
 * Enregistre tous les événements importants
 * Format: JSON + timestamp + niveau (info/warn/error)
 */

import winston from 'winston'
import path from 'path'
import { fileURLToPath } from 'url'
import { env } from './env.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Format personnalisé
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level: level.toUpperCase(),
      message,
      ...meta
    })
  })
)

/**
 * Configuration Winston
 * - Console: pour le développement
 * - File: pour tous les logs
 * - ErrorFile: pour les erreurs seulement
 */
export const logger = winston.createLogger({
  level: env.LOG_LEVEL || 'info',
  format: customFormat,
  transports: [
    // Console (coloriée en dev)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),

    // Fichier: tous les logs
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/app.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),

    // Fichier: erreurs uniquement
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
})

// En production, moins de logs
if (env.NODE_ENV === 'production') {
  logger.level = 'warn'
}

/**
 * Middleware pour logger les requêtes HTTP
 */
export const httpLogger = (req, res, next) => {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id
    })
  })

  next()
}
