/**
 * Variables d'environnement obligatoires côté serveur.
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

type NomVariable = (typeof VARIABLES_OBLIGATOIRES)[number];

type SourceEnvironnement = Record<string, string | undefined>;

/**
 * Liste les variables obligatoires absentes ou vides.
 *
 * Toutes les variables manquantes sont renvoyées d'un coup, pour éviter de
 * corriger le .env une variable à la fois.
 */
const listerVariablesManquantes = (
  source: SourceEnvironnement = process.env,
): NomVariable[] =>
  VARIABLES_OBLIGATOIRES.filter((nom) => {
    const valeur = source[nom];

    return valeur == null || valeur.trim() === "";
  });

export { VARIABLES_OBLIGATOIRES, listerVariablesManquantes };
export type { NomVariable, SourceEnvironnement };
