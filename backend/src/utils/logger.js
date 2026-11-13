// Winston crée et gère les journaux de l'application
import winston from "winston"

// On récupère le mode déjà vérifié par env.js
import { env } from "../config/env.js"

const { combine, timestamp, errors, json, colorize, simple } = winston.format

export const logger = winston.createLogger({
  // En développement, on affiche aussi les messages de diagnostic
  level: env.NODE_ENV === "production" ? "info" : "debug",

  // Les fichiers de journaux sont enregistrés au format JSON
  format: combine(timestamp(), errors({ stack: true }), json()),

  transports: [
    // Ce fichier contient uniquement les erreurs
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),

    // Ce fichier contient tous les messages
    new winston.transports.File({
      filename: "logs/combined.log",
    }),

    // Affiche les messages dans le terminal pendant le développement
    new winston.transports.Console({
      format: combine(colorize(), simple()),
    }),
  ],
})