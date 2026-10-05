/**
 * Point d'entrée unique du code partagé entre le client et le serveur.
 *
 * Il n'y a aucune règle métier ici pour l'instant : les trois dossiers
 * (types, catalogue, regles) sont des emplacements réservés qui seront
 * remplis par les US suivantes (US02 pour les types, US09 pour le
 * catalogue, US11 pour les règles).
 */

/**
 * Témoin temporaire de l'espace shared.
 *
 * Il ne sert qu'à une chose en US00 : prouver que le code partagé est bien
 * importable depuis le client, depuis le serveur et depuis un test Jest.
 * À retirer en US09, quand le vrai catalogue prendra sa place.
 */
export const SHARED_READY = "shared-ready";

export * from "./types";
export * from "./catalogue";
export * from "./regles";
