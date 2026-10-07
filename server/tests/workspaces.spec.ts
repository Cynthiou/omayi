import fs from "node:fs";
import path from "node:path";

const racine = path.join(__dirname, "../..");

const lirePackageRacine = (): { workspaces?: string[] } =>
  JSON.parse(fs.readFileSync(path.join(racine, "package.json"), "utf8"));

describe("monorepo", () => {
  it("déclare client, server et shared comme workspaces npm", () => {
    const { workspaces } = lirePackageRacine();

    expect(workspaces).toEqual(
      expect.arrayContaining(["client", "server", "shared"]),
    );
  });

  it("installe shared depuis la racine", () => {
    // npm install à la racine doit lier shared dans node_modules,
    // sans installation séparée dans chaque espace.
    const chemin = path.join(racine, "node_modules", "@omayi", "shared");

    expect(fs.existsSync(chemin)).toBe(true);
  });
});
