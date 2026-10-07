import express from "express";

import healthActions from "./modules/health/healthActions";

const router = express.Router();

/* ************************************************************************* */
// Routes de l'API OMAYI
// Chaque route suit la chaîne Router -> Action -> Repository -> MySQL.
/* ************************************************************************* */

// Santé du service : serveur et base de données
router.get("/api/health", healthActions.read);

/* ************************************************************************* */

export default router;
