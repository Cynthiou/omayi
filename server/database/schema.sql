-- Schéma minimal OMAYI.
--
-- Les tables d'exemple du template (item) ont été retirées.
-- Le vrai modèle de données métier (clients, chantiers, devis, catalogue)
-- est défini en US02 : la table ci-dessous n'est qu'un socle technique
-- permettant de vérifier que db:migrate et db:seed s'exécutent.

create table user (
  id int unsigned primary key auto_increment not null,
  email varchar(255) not null unique,
  password varchar(255) not null
);
