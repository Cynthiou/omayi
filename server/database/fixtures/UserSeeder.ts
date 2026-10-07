import AbstractSeeder from "./AbstractSeeder";

class UserSeeder extends AbstractSeeder {
  constructor() {
    super({ table: "user", truncate: true });
  }

  // Jeu de données volontairement minimal : il sert uniquement à vérifier
  // que db:seed s'exécute de bout en bout. Les vraies données arrivent
  // avec le modèle métier (US02) et l'authentification (US03).
  run() {
    const utilisateurTemoin = {
      refName: "user_demo",
      email: "demo@omayi.local",
      password: "placeholder-remplace-en-US03",
    };

    this.insert(utilisateurTemoin);
  }
}

export default UserSeeder;
