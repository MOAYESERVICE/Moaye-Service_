// Importe Router pour créer un groupe de routes Express.
import { Router } from "express"
// Importe les routes d'inscription et de connexion.
import authRouter from "../modules/auth/auth.routes.js"
// Importe le groupe qui contient la route /health.
import healthRouter from "./health.routes.js"
// Importe les routes consacrées aux produits.
import productRouter from "../modules/products/product.routes.js"
// Importe les routes des commandes.
import ordersRouter from "../modules/orders/orders.routes.js"
// Importe les routes du profil utilisateur.
import usersRouter from "../modules/users/users.routes.js"
// Importe les routes du panier.
import cartRouter from "../modules/cart/cart.routes.js"
// Importe les routes de l'assistant IA.
import aiRouter from "./ai.js"
// Importe les routes des messages de contact.
import contactRouter from "../modules/contact/contact.routes.js"
// Importe les routes des demandes de devis.
import quotesRouter from "../modules/quotes/quotes.routes.js"
import adminUsersRouter from "../modules/users/admin-users.routes.js"
import homepageRouter from "../modules/homepage/homepage.routes.js"

// Crée le routeur principal de l'API.
const apiRouter = Router()

// Ajoute les routes de santé au routeur principal.
apiRouter.use(healthRouter)

// Routes d'authentification
apiRouter.use("/auth", authRouter)

// Routes de produits
apiRouter.use("/products", productRouter)

// Photos publiées sur la page d'accueil.
apiRouter.use("/home", homepageRouter)

// Routes de commandes
apiRouter.use("/orders", ordersRouter)

// Routes du profil
apiRouter.use("/profile", usersRouter)

// Gestion des comptes réservée aux administrateurs.
apiRouter.use("/users", adminUsersRouter)

// Routes du panier
apiRouter.use("/cart", cartRouter)

// Routes de contact
apiRouter.use("/contact", contactRouter)

// Routes de devis
apiRouter.use("/quotes", quotesRouter)

// Routes IA
apiRouter.use("/ai", aiRouter)

// Rend le routeur principal disponible pour app.js.
export default apiRouter
