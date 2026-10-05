// Charge les variables d'environnement depuis le fichier .env
import "dotenv/config";

import { listerVariablesManquantes } from "./config/env";

/* ************************************************************************* */

// Vérification de la configuration avant toute autre chose : il vaut mieux
// une erreur explicite au démarrage qu'une panne silencieuse plus tard.

const variablesManquantes = listerVariablesManquantes();

if (variablesManquantes.length > 0) {
  console.error(
    "Démarrage impossible. Variables d'environnement manquantes :",
    variablesManquantes.join(", "),
  );
  console.error(
    "Copie server/.env.sample en server/.env puis renseigne ces variables.",
  );

  process.exit(1);
}

/* ************************************************************************* */

// Vérifie la connexion à la base de données
// Un échec n'empêche pas le démarrage : c'est /api/health qui fait foi
import "../database/checkConnection";

// Importe l'application Express
import app from "./app";

const port = process.env.APP_PORT;

app
  .listen(port, () => {
    console.info(`Serveur à l'écoute sur le port ${port}`);
  })
  .on("error", (err: Error) => {
    console.error("Erreur :", err.message);
  });
