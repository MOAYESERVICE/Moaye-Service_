/**
 * GÉNÉRATEUR ROUTES CRUD AVEC PRISMA
 * ====================================
 * Script pour générer automatiquement les routes CRUD 
 * pour tous les modèles Prisma
 * 
 * Usage:
 *   node generate-crud.js
 * 
 * Génère:
 *   - repositories/ (CRUD operations)
 *   - controllers/ (HTTP handlers)
 *   - routes/ (express routes)
 *   - validations/ (zod schemas)
 */

import { PrismaClient } from "@prisma/client"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const prisma = new PrismaClient()

// Modèles à générer les routes CRUD
const MODELS_TO_GENERATE = [
  "cart",
  "cartItem",
  "order",
  "orderItem",
  "category",
  "quote",
  "contact",
  "review",
  "payment",
  "realization",
]

/**
 * Génère un repository CRUD pour un modèle
 */
function generateRepository(modelName) {
  const Model = modelName.charAt(0).toUpperCase() + modelName.slice(1)
  const modelLower = modelName.charAt(0).toLowerCase() + modelName.slice(1)

  return `// Repository pour ${Model}
import { prisma } from "../../config/database.js"
import { ApiError } from "../../utils/ApiError.js"

/**
 * Récupère tous les ${modelLower}s
 */
export async function findAll(where = {}, include = {}) {
  return prisma.${modelLower}.findMany({
    where,
    include,
  })
}

/**
 * Récupère un ${modelLower} par ID
 */
export async function findById(id, include = {}) {
  const ${modelLower} = await prisma.${modelLower}.findUnique({
    where: { id },
    include,
  })
  
  if (!${modelLower}) {
    throw ApiError.notFound(\`\${${modelName}} not found\`)
  }
  
  return ${modelLower}
}

/**
 * Crée un nouveau ${modelLower}
 */
export async function create(data) {
  return prisma.${modelLower}.create({
    data,
  })
}

/**
 * Met à jour un ${modelLower}
 */
export async function update(id, data) {
  return prisma.${modelLower}.update({
    where: { id },
    data,
  })
}

/**
 * Supprime un ${modelLower}
 */
export async function remove(id) {
  return prisma.${modelLower}.delete({
    where: { id },
  })
}
`
}

/**
 * Génère un controller CRUD pour un modèle
 */
function generateController(modelName) {
  const Model = modelName.charAt(0).toUpperCase() + modelName.slice(1)
  const modelLower = modelName.charAt(0).toLowerCase() + modelName.slice(1)
  const plural = modelName + "s"

  return `// Controller pour ${Model}
import * as repository from "./${modelLower}.repository.js"
import { logger } from "../../config/logger.js"

/**
 * GET /api/${plural}
 * Récupère tous les ${plural}
 */
export async function list(req, res, next) {
  try {
    const items = await repository.findAll()
    
    res.json({
      success: true,
      data: items,
      count: items.length,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/${plural}/:id
 * Récupère un ${modelLower} par ID
 */
export async function show(req, res, next) {
  try {
    const item = await repository.findById(parseInt(req.params.id))
    
    res.json({
      success: true,
      data: item,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/${plural}
 * Crée un nouveau ${modelLower}
 */
export async function create(req, res, next) {
  try {
    const item = await repository.create(req.body)
    
    res.status(201).json({
      success: true,
      data: item,
      message: "${Model} créé avec succès",
    })
  } catch (error) {
    next(error)
  }
}

/**
 * PUT /api/${plural}/:id
 * Met à jour un ${modelLower}
 */
export async function update(req, res, next) {
  try {
    const item = await repository.update(parseInt(req.params.id), req.body)
    
    res.json({
      success: true,
      data: item,
      message: "${Model} mis à jour avec succès",
    })
  } catch (error) {
    next(error)
  }
}

/**
 * DELETE /api/${plural}/:id
 * Supprime un ${modelLower}
 */
export async function remove(req, res, next) {
  try {
    await repository.remove(parseInt(req.params.id))
    
    res.json({
      success: true,
      message: "${Model} supprimé avec succès",
    })
  } catch (error) {
    next(error)
  }
}
`
}

/**
 * Génère les routes pour un modèle
 */
function generateRoutes(modelName) {
  const Model = modelName.charAt(0).toUpperCase() + modelName.slice(1)
  const modelLower = modelName.charAt(0).toLowerCase() + modelName.slice(1)
  const plural = modelName + "s"

  return `// Routes pour ${Model}
import { Router } from "express"
import * as controller from "./${modelLower}.controller.js"
import { requireAuth } from "../../middlewares/auth.middleware.js"
import { requireRole } from "../../middlewares/role.middleware.js"
import { validateBody } from "../../middlewares/validate.middleware.js"
// import { ${modelLower}Schema } from "./${modelLower}.validation.js"

const router = Router()

// Routes publiques
router.get("/", controller.list)
router.get("/:id", controller.show)

// Routes authentifiées
router.post("/", requireAuth, controller.create)
router.put("/:id", requireAuth, controller.update)
router.delete("/:id", requireAuth, controller.remove)

export default router
`
}

/**
 * Crée les fichiers pour un modèle
 */
async function generateModel(modelName) {
  const modulePath = path.join(__dirname, "src", "modules", modelName)

  // Créer le dossier
  if (!fs.existsSync(modulePath)) {
    fs.mkdirSync(modulePath, { recursive: true })
    console.log(`✅ Dossier créé: ${modulePath}`)
  }

  // Créer les fichiers
  const files = {
    [`${modelName}.repository.js`]: generateRepository(modelName),
    [`${modelName}.controller.js`]: generateController(modelName),
    [`${modelName}.routes.js`]: generateRoutes(modelName),
  }

  for (const [filename, content] of Object.entries(files)) {
    const filePath = path.join(modulePath, filename)
    
    // Ne pas overwrite si le fichier existe
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content)
      console.log(`  ✓ ${filename}`)
    } else {
      console.log(`  ⊘ ${filename} (exists)`)
    }
  }
}

/**
 * Main
 */
async function main() {
  console.log("\n🚀 Générateur Routes CRUD avec Prisma\n")

  for (const model of MODELS_TO_GENERATE) {
    console.log(`📦 ${model}:`)
    await generateModel(model)
  }

  console.log("\n✅ Génération terminée!\n")
  
  console.log("Prochaines étapes:")
  console.log("1. Ajouter les routes aux fichiers routes principaux")
  console.log("2. Créer les schémas de validation (validation.js)")
  console.log("3. Ajouter les protections (requireAuth, requireRole)")
  console.log("4. Tester avec Postman/curl\n")
}

main().catch(console.error).finally(() => prisma.$disconnect())
