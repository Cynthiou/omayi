// Charge les variables d'environnement depuis le fichier .env
import "dotenv/config";

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import database from "../database/client";
import {
  VARIABLES_BASE_DE_DONNEES,
  listerVariablesManquantes,
} from "../src/config/env";

import type { AbstractSeeder } from "../database/fixtures/AbstractSeeder";

const fixturesPath = path.join(__dirname, "../database/fixtures");

const seed = async () => {
  const variablesManquantes = listerVariablesManquantes(
    VARIABLES_BASE_DE_DONNEES,
  );

  if (variablesManquantes.length > 0) {
    console.error(
      "Remplissage impossible. Variables d'environnement manquantes :",
      variablesManquantes.join(", "),
    );

    process.exit(1);
  }

  try {
    const dependencyMap: { [key: string]: AbstractSeeder } = {};

    // Construit chaque seeder présent dans le dossier fixtures
    const filePaths = fs
      .readdirSync(fixturesPath)
      .filter((filePath: string) => !filePath.startsWith("Abstract"));

    for (const filePath of filePaths) {
      // pathToFileURL plutôt qu'une concaténation : sous Windows, un chemin
      // comme C:\... ne forme pas une URL file:// valide sans conversion.
      const moduleUrl = pathToFileURL(path.join(fixturesPath, filePath)).href;

      const { default: SeederClass } = await import(moduleUrl);

      const seeder = new SeederClass() as AbstractSeeder;

      dependencyMap[SeederClass.toString()] = seeder;
    }

    // Trie les seeders selon leurs dépendances
    const sortedSeeders: AbstractSeeder[] = [];

    const solveDependencies = (n: AbstractSeeder) => {
      for (const DependencyClass of n.dependencies) {
        const dependency = dependencyMap[DependencyClass.toString()];

        if (!sortedSeeders.includes(dependency)) {
          solveDependencies(dependency);
        }
      }

      if (!sortedSeeders.includes(n)) {
        sortedSeeders.push(n);
      }
    };

    for (const seeder of Object.values(dependencyMap)) {
      solveDependencies(seeder);
    }

    // Vide les tables en commençant par les dépendantes
    // delete plutôt que truncate, pour ne pas heurter les clés étrangères
    for (const seeder of sortedSeeders.toReversed()) {
      await database.query(`delete from ${seeder.table}`);
    }

    // Exécute chaque seeder dans l'ordre des dépendances
    for (const seeder of sortedSeeders) {
      await seeder.run();

      await Promise.all(seeder.promises);
    }

    await database.end();

    console.info(
      `Base ${process.env.DB_NAME} remplie depuis '${path.normalize(fixturesPath)}'`,
    );
  } catch (err) {
    const { message } = err as Error;

    console.error("Échec du remplissage de la base :", message);

    // Sortie en échec : sans cela le script annoncerait un succès alors
    // qu'aucune donnée n'a été insérée.
    process.exit(1);
  }
};

seed();
