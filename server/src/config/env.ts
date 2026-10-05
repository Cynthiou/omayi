/**
 * Variables d'environnement obligatoires pour démarrer le serveur.
 *
 * Cette liste est volontairement alignée sur server/.env.sample : si une
 * variable est ajoutée à l'un, elle doit l'être à l'autre.
 */
const VARIABLES_OBLIGATOIRES = [
  "APP_PORT",
  "DB_HOST",
  "DB_PORT",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
  "CLIENT_URL",
] as const;

/**
 * Sous-ensemble nécessaire aux scripts de base de données (db:migrate et
 * db:seed) : ils n'ont besoin ni du port HTTP ni de l'origine du client.
 */
const VARIABLES_BASE_DE_DONNEES = [
  "DB_HOST",
  "DB_PORT",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
] as const;

type SourceEnvironnement = Record<string, string | undefined>;

/**
 * Liste les variables absentes ou vides parmi celles attendues.
 *
 * Toutes les variables manquantes sont renvoyées d'un coup, pour éviter de
 * corriger le .env une variable à la fois.
 */
const listerVariablesManquantes = (
  noms: readonly string[] = VARIABLES_OBLIGATOIRES,
  source: SourceEnvironnement = process.env,
): string[] =>
  noms.filter((nom) => {
    const valeur = source[nom];

    return valeur == null || valeur.trim() === "";
  });

export {
  VARIABLES_BASE_DE_DONNEES,
  VARIABLES_OBLIGATOIRES,
  listerVariablesManquantes,
};
export type { SourceEnvironnement };
