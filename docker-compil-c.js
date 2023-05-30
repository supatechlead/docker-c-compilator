const Docker = require('dockerode');
const fs = require('fs');
require('dotenv').config();

// Créer une instance de Dockerode
const docker = new Docker();

// Chemin absolu vers le fichier source C sur l'hôte
const sourcePathOnHost = process.env.HOSTPATH.concat("/programme.c");


// Chemin à utiliser dans le conteneur pour le fichier source C
const sourcePathInContainer = '/app/programme.c'; // Par exemple, /app/ est un chemin arbitraire dans le conteneur

// Lire le contenu du fichier source
// const sourceCode = fs.readFileSync(sourcePathOnHost, 'utf-8'); // Utilisez sourcePathOnHost au lieu de sourcePath

// Chemin vers le fichier de sortie binaire
const outputPath = '/app/programme';

// Créer un conteneur Docker
docker.createContainer(
  {
    Image: 'gcc',
    Tty: true,
    Cmd: [
        'sh',
        '-c',
        `mkdir -p /app/ && gcc ${sourcePathInContainer} -o ${outputPath} && ${outputPath}`
    ],
    HostConfig: {
      Binds: [`${sourcePathOnHost}:${sourcePathInContainer}`], // Montage du volume
    },
  },
  function(err, container) {
    if (err) {
      console.error('Une erreur s\'est produite lors de la création du conteneur :', err);
      return;
    }

    // Démarrer le conteneur
    container.start(function(err) {
      if (err) {
        console.error('Une erreur s\'est produite lors du démarrage du conteneur :', err);
        return;
      }

      // Attendre que le conteneur se termine
    container.wait(function(err, data) {
      if (err) {
        console.error('Une erreur s\'est produite lors de l\'attente de la fin du conteneur :', err);
        return;
      }

        // Vérifier le code de sortie du conteneur
      if (data.StatusCode === 0) {
          console.log('Programme exécuté avec succès !');
      } else {
          console.error('L\'exécution du programme a échoué. Code de sortie :', data.StatusCode);
      }

        // Récupérer les journaux de sortie du conteneur
      container.logs({ stdout: true, stderr: true }, function(err, logs) {
        if (err) {
          console.error('Une erreur s\'est produite lors de la récupération des journaux du conteneur :', err);
          return;
        }

          console.log('Journaux de sortie du conteneur :');
          console.log(logs.toString('utf-8'));

          // Supprimer le conteneur
          container.remove(function(err) {
            if (err) {
              console.error('Une erreur s\'est produite lors de la suppression du conteneur :', err);
              return;
            }

            console.log('Conteneur supprimé avec succès !');
          });
        });
      });
    });
  }
);


