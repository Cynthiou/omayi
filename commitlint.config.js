// Convention de commits OMAYI : type(USxx): description
// Exemple : feat(US14): add client search
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "chore", "test", "docs", "refactor"],
    ],
    // Le scope USxx est obligatoire sur chaque commit lié à une US
    "scope-empty": [2, "never"],
    "scope-case": [0],
    "subject-case": [0],
    "scope-us-format": [2, "always"],
  },
  plugins: [
    {
      rules: {
        "scope-us-format": ({ scope }) => [
          typeof scope === "string" && /^US\d{2}$/.test(scope),
          "le scope doit être au format USxx (ex : feat(US14): ...)",
        ],
      },
    },
  ],
  // Les commits de merge générés par Git ne sont pas contrôlés
  ignores: [(commit) => /^Merge /.test(commit)],
};
