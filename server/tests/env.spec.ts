import {
  VARIABLES_BASE_DE_DONNEES,
  VARIABLES_OBLIGATOIRES,
  listerVariablesManquantes,
} from "../src/config/env";

/** Construit un environnement complet, privé des variables indiquées. */
const environnementSauf = (
  ...absentes: readonly string[]
): Record<string, string> =>
  Object.fromEntries(
    VARIABLES_OBLIGATOIRES.filter((nom) => !absentes.includes(nom)).map(
      (nom) => [nom, "valeur"],
    ),
  );

describe("variables d'environnement", () => {
  it("ne signale rien quand tout est renseigné", () => {
    const manquantes = listerVariablesManquantes(
      VARIABLES_OBLIGATOIRES,
      environnementSauf(),
    );

    expect(manquantes).toEqual([]);
  });

  it("liste toutes les variables absentes d'un seul coup", () => {
    const source = environnementSauf("DB_USER", "CLIENT_URL");

    expect(listerVariablesManquantes(VARIABLES_OBLIGATOIRES, source)).toEqual([
      "DB_USER",
      "CLIENT_URL",
    ]);
  });

  it("traite une variable vide comme manquante", () => {
    const source = { ...environnementSauf(), DB_PASSWORD: "   " };

    expect(listerVariablesManquantes(VARIABLES_OBLIGATOIRES, source)).toEqual([
      "DB_PASSWORD",
    ]);
  });

  it("n'exige que les variables de base pour db:migrate et db:seed", () => {
    const source: Record<string, string> = Object.fromEntries(
      VARIABLES_BASE_DE_DONNEES.map((nom) => [nom, "valeur"]),
    );

    expect(
      listerVariablesManquantes(VARIABLES_BASE_DE_DONNEES, source),
    ).toEqual([]);

    expect(listerVariablesManquantes(VARIABLES_OBLIGATOIRES, source)).toEqual([
      "APP_PORT",
      "CLIENT_URL",
    ]);
  });
});
