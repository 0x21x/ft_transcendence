// Initialisation de la scène, de la caméra et du rendu
const scene = new THREE.Scene();
//const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const camera = new THREE.OrthographicCamera( -window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, -window.innerHeight / 2, 1, 1000 );
console.log(window.innerWidth)
console.log(-window.innerWidth / 2)
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Création des objets du jeu
const paddleWidth = 10;
const paddleHeight = 100;
const paddleDepth = 10;
const paddleGeometry = new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleDepth);
const paddleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const playerPaddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
const computerPaddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
const ballGeometry = new THREE.SphereGeometry(7, 40, 40);
const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const ball = new THREE.Mesh(ballGeometry, ballMaterial);

// Variables de vitesse de la balle
let ballSpeedX = 2;
let ballSpeedY = 2;
const acceleration = 1;
// Variables de vitesse maximale de la balle
const maxSpeedX = 6;
const maxSpeedY = 6;

// Variables de mouvement des raquettes
let playerPaddleSpeed = 0;
let computerPaddleSpeed = 0;

// Variables de score
let playerScore = 0;
let computerScore = 0;

// Positionnement des objets
playerPaddle.position.set(-500, 0, 0);
computerPaddle.position.set(500, 0, 0);
ball.position.set(0, 0, 0);

// Ajout des objets à la scène
scene.add(playerPaddle);
scene.add(computerPaddle);
scene.add(ball);

// Positionnement de la caméra
camera.position.z = 200;

// Création de la géométrie de la ligne en pointillés
const lineGeometry = new THREE.PlaneGeometry(2, 450); // Création d'une surface fine pour la ligne
// Création du matériau pour la ligne en pointillés
const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 });
// Création de la ligne en pointillés
const line = new THREE.Mesh(lineGeometry, lineMaterial);
// Positionnement de la ligne au milieu de la surface de jeu
line.position.x = 0;
// Ajout de la ligne à la scène
scene.add(line);

// Création des bordures extérieures du terrain
const borderLeftGeometry = new THREE.BoxGeometry(450, window.innerHeight , 10);
const borderLeftMaterial = new THREE.MeshBasicMaterial({ color: 0x00cfff, transparent: true, opacity: 0.5 });
const borderLeft = new THREE.Mesh(borderLeftGeometry, borderLeftMaterial);
borderLeft.position.x = -(window.innerWidth / 2);
scene.add(borderLeft);

const borderRightGeometry = new THREE.BoxGeometry(450, window.innerHeight , 10);
const borderRightMaterial = new THREE.MeshBasicMaterial({ color: 0x00cfff, transparent: true, opacity: 0.5 });
const borderRight = new THREE.Mesh(borderRightGeometry, borderRightMaterial);
borderRight.position.x = window.innerWidth / 2;
scene.add(borderRight);

const borderTopGeometry = new THREE.BoxGeometry(window.innerWidth, 350, 10);
const borderTopMaterial = new THREE.MeshBasicMaterial({ color: 0x00cfff, transparent: true, opacity: 0.5 });
const borderTop = new THREE.Mesh(borderTopGeometry, borderTopMaterial);
borderTop.position.y = window.innerHeight / 2;
scene.add(borderTop);

const borderBottomGeometry = new THREE.BoxGeometry(window.innerWidth, 350, 10);
const borderBottomMaterial = new THREE.MeshBasicMaterial({ color: 0x00cfff, transparent: true, opacity: 0.5 });
const borderBottom = new THREE.Mesh(borderBottomGeometry, borderBottomMaterial);
borderBottom.position.y = -(window.innerHeight / 2);
scene.add(borderBottom);


// Gestion des événements clavier pour le joueur 1 (z pour monter, s pour descendre)
document.addEventListener('keydown', function (event) {
    if (event.key === 'z') {
        playerPaddleSpeed = 3;
    } else if (event.key === 's') {
        playerPaddleSpeed = -3;
    }
});

document.addEventListener('keyup', function (event) {
    if (event.key === 'z' || event.key === 's') {
        playerPaddleSpeed = 0;
    }
});

// Gestion des événements clavier pour le joueur 2 (flèches haut et bas)
document.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowUp') {
        computerPaddleSpeed = 3;
    } else if (event.key === 'ArrowDown') {
        computerPaddleSpeed = -3;
    }
});

document.addEventListener('keyup', function (event) {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        computerPaddleSpeed = 0;
    }
});

// Boucle de rendu du jeu
const animate = function () {
    requestAnimationFrame(animate);

    // Mise à jour du jeu
    // Déplacement de la raquette du joueur 1
    playerPaddle.position.y += playerPaddleSpeed;

    // Limite de déplacement de la raquette du joueur 1
    if (playerPaddle.position.y >= 175) {
        playerPaddle.position.y = 175;
    } else if (playerPaddle.position.y <= -175) {
        playerPaddle.position.y = -175;
    }

    // Déplacement de la raquette du joueur 2 (ordinateur)
    computerPaddle.position.y += computerPaddleSpeed;

    // Limite de déplacement de la raquette du joueur 2 (ordinateur)
    if (computerPaddle.position.y >= 175) {
        computerPaddle.position.y = 175;
    } else if (computerPaddle.position.y <= -175) {
        computerPaddle.position.y = -175;
    }

    // Déplacement de la balle
    ball.position.x += ballSpeedX;
    ball.position.y += ballSpeedY;

    // Gestion des collisions avec les bordures extérieures
    if (ball.position.y >= 220 || ball.position.y <= -220) {
        ballSpeedY = -ballSpeedY;
        // Effet de rebond sur les bordures
        ballSpeedX += Math.sign(ballSpeedX) * 0.05; // Augmente la vitesse horizontale
    }
    if (ball.position.x >= 520 || ball.position.x <= -520) {
        // Balle derrière la raquette du joueur
        if (ball.position.x >= 520) {
            computerScore++;
        }
        // Balle derrière la raquette de l'ordinateur
        else {
            playerScore++;
        }
        resetBall();
        // Réinitialisation de la position de la balle
        //ball.position.set(0, 0, 0);
        // Réinitialisation de la vitesse de la balle
    }

    // Gestion des collisions avec les raquettes
    if (
        ball.position.x >= playerPaddle.position.x - paddleWidth / 2 &&
        ball.position.x <= playerPaddle.position.x + paddleWidth / 2 &&
        ball.position.y >= playerPaddle.position.y - paddleHeight / 2 &&
        ball.position.y <= playerPaddle.position.y + paddleHeight / 2
    ) {
        ballSpeedX = -ballSpeedX;
        ballSpeedX += Math.sign(ballSpeedX) * acceleration;
        ballSpeedY += Math.sign(ballSpeedY) * acceleration;
        // Effet de direction sur la balle selon la position de la raquette du joueur 1
        let deltaY = ball.position.y - playerPaddle.position.y;
        ballSpeedY += deltaY * 0.25;
    }

    if (
        ball.position.x >= computerPaddle.position.x - paddleWidth / 2 &&
        ball.position.x <= computerPaddle.position.x + paddleWidth / 2 &&
        ball.position.y >= computerPaddle.position.y - paddleHeight / 2 &&
        ball.position.y <= computerPaddle.position.y + paddleHeight / 2
    ) {
        ballSpeedX = -ballSpeedX;
        ballSpeedX += Math.sign(ballSpeedX) * acceleration;
        ballSpeedY += Math.sign(ballSpeedY) * acceleration;
        // Effet de direction sur la balle selon la position de la raquette du joueur 2
        let deltaY = ball.position.y - computerPaddle.position.y;
        ballSpeedY += deltaY * 0.25;
    }

    // Limite de la vitesse maximale horizontale
    if (Math.abs(ballSpeedX) > maxSpeedX) {
        ballSpeedX = Math.sign(ballSpeedX) * maxSpeedX;
    }

    // Limite de la vitesse maximale verticale
    if (Math.abs(ballSpeedY) > maxSpeedY) {
        ballSpeedY = Math.sign(ballSpeedY) * maxSpeedY;
    }

    // Rendu de la scène
    renderer.render(scene, camera);

    // Mise à jour de l'affichage des scores
    document.getElementById('playerScore').innerText = 'Player 1: ' + playerScore;
    document.getElementById('computerScore').innerText = 'Player 2: ' + computerScore;

    // Vérification du gagnant
    if (playerScore >= 10) {
        resetGame();
        alert('Player wins!');
    } else if (computerScore >= 10) {
        resetGame();
        alert('Computer wins!');
    }
};

function resetGame() {
    playerScore = 0;
    computerScore = 0;
    resetBall(); // Réinitialiser la position et la direction de la balle            // ballSpeedX = 2;
}

function resetBall() {
    ball.position.set(0, 0, 0);
    // Randomiser à nouveau la direction de la balle
    ballSpeedX = 2;
    ballSpeedY = 2;
    randomizeBallDirection();
}

function randomizeBallDirection() {
    // Générer aléatoirement une direction horizontale
    const randomX = Math.random(); // Valeur aléatoire entre 0 et 1
    ballSpeedX = Math.random() * 2 + 1
    if (randomX > 0.5) {
        ballSpeedX *= -1; // Valeur aléatoire entre 1 et 3 pour la vitesse horizontale
    }
    console.log(ballSpeedX);

    // Générer aléatoirement une direction verticale
    const randomY = Math.random(); // Valeur aléatoire entre 0 et 1
    ballSpeedY = Math.random() * 2 + 1
    if (randomY > 0.5) {
        ballSpeedY *= -1; // Valeur aléatoire entre 1 et 3 pour la vitesse horizontale
    }
}


animate();
