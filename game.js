// ========== GAME VARIABLES ==========
let score = 0;
let lives = 3;
let level = 1;
let gameActive = false;
let gameLoopId = null;

// Colors for falling squares
const colors = [
    '#ff6b6b', // Red
    '#4ecdc4', // Teal
    '#ffd166', // Yellow
    '#06d6a0', // Green
    '#118ab2', // Blue
    '#ef476f', // Pink
    '#9d4edd'  // Purple
];

// Game objects
const player = {
    element: document.getElementById('player'),
    x: 0,
    width: 120,
    speed: 10
};

let colorDrops = [];

// ========== DOM ELEMENTS ==========
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const levelElement = document.getElementById('level');
const gameArea = document.getElementById('gameArea');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// ========== GAME FUNCTIONS ==========
function initGame() {
    // Center player
    player.x = (gameArea.offsetWidth - player.width) / 2;
    player.element.style.left = player.x + 'px';
    
    // Clear any existing color drops
    colorDrops.forEach(drop => {
        if (drop.element && drop.element.parentNode) {
            drop.element.remove();
        }
    });
    colorDrops = [];
}

function startGame() {
    if (gameActive) return;
    
    // Reset game state
    score = 0;
    lives = 3;
    level = 1;
    gameActive = true;
    
    // Update UI
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    levelElement.textContent = level;
    
    // Enable/disable buttons
    startBtn.disabled = true;
    restartBtn.disabled = false;
    startBtn.textContent = 'GAME RUNNING';
    
    // Initialize game
    initGame();
    
    // Start game loop
    gameLoopId = setInterval(gameLoop, 16); // ~60fps
}

function gameLoop() {
    if (!gameActive) return;
    
    // Move player
    player.element.style.left = player.x + 'px';
    
    // Spawn new color drops randomly
    if (Math.random() < 0.03 + (level * 0.005)) {
        spawnColorDrop();
    }
    
    // Update all color drops
    updateColorDrops();
    
    // Check for collisions
    checkCollisions();
}

function spawnColorDrop() {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const x = Math.random() * (gameArea.offsetWidth - 45);
    
    const dropElement = document.createElement('div');
    dropElement.className = 'color-drop';
    dropElement.style.backgroundColor = color;
    dropElement.style.left = x + 'px';
    dropElement.style.top = '-50px'; // Start above screen
    
    gameArea.appendChild(dropElement);
    
    colorDrops.push({
        element: dropElement,
        x: x,
        y: -50, // Start above screen
        color: color,
        speed: 2 + (level * 0.7) // Speed increases with level
    });
}

function updateColorDrops() {
    const gameAreaHeight = gameArea.offsetHeight;
    const dangerLineY = gameAreaHeight * 0.75; // 75% from top
    
    for (let i = colorDrops.length - 1; i >= 0; i--) {
        const drop = colorDrops[i];
        
        // Move drop down
        drop.y += drop.speed;
        drop.element.style.top = drop.y + 'px';
        
        // Check if past danger line
        if (drop.y > dangerLineY) {
            // Change appearance to show it's too late
            drop.element.style.opacity = '0.5';
            drop.element.style.boxShadow = '0 0 5px red';
        }
        
        // Check if completely off screen
        if (drop.y > gameAreaHeight) {
            // Remove drop
            drop.element.remove();
            colorDrops.splice(i, 1);
            
            // Only lose life if drop was past danger line
            if (drop.y > dangerLineY + 50) { // Give some buffer
                loseLife();
            }
        }
    }
}

function checkCollisions() {
    const playerRect = {
        left: player.x,
        right: player.x + player.width,
        top: gameArea.offsetHeight - 45, // Player Y position
        bottom: gameArea.offsetHeight - 20
    };
    
    for (let i = colorDrops.length - 1; i >= 0; i--) {
        const drop = colorDrops[i];
        
        // Only check drops that are near the bottom
        if (drop.y > gameArea.offsetHeight - 100) {
            const dropRect = {
                left: drop.x,
                right: drop.x + 45,
                top: drop.y,
                bottom: drop.y + 45
            };
            
            // Simple rectangle collision
            if (dropRect.left < playerRect.right &&
                dropRect.right > playerRect.left &&
                dropRect.top < playerRect.bottom &&
                dropRect.bottom > playerRect.top) {
                
                // Caught! Add points
                score += 10;
                scoreElement.textContent = score;
                
                // Visual feedback
                drop.element.style.transform = 'scale(1.3)';
                drop.element.style.opacity = '0';
                
                // Remove after animation
                setTimeout(() => {
                    drop.element.remove();
                }, 200);
                
                colorDrops.splice(i, 1);
                
                // Check level up every 100 points
                const newLevel = Math.floor(score / 100) + 1;
                if (newLevel > level) {
                    level = newLevel;
                    levelElement.textContent = level;
                    // Visual feedback for level up
                    player.element.style.boxShadow = '0 0 30px gold';
                    setTimeout(() => {
                        player.element.style.boxShadow = '0 0 20px rgba(76, 201, 240, 0.8)';
                    }, 500);
                }
            }
        }
    }
}

function loseLife() {
    lives--;
    livesElement.textContent = lives;
    
    // Visual feedback for lost life
    player.element.style.background = 'linear-gradient(to right, #ff6b6b, #ef476f)';
    setTimeout(() => {
        player.element.style.background = 'linear-gradient(to right, #4cc9f0, #4361ee)';
    }, 300);
    
    // Check game over
    if (lives <= 0) {
        endGame();
    }
}

function endGame() {
    gameActive = false;
    
    // Stop game loop
    if (gameLoopId) {
        clearInterval(gameLoopId);
    }
    
    // Remove all color drops
    colorDrops.forEach(drop => {
        drop.element.remove();
    });
    colorDrops = [];
    
    // Update buttons
    startBtn.disabled = false;
    restartBtn.disabled = true;
    startBtn.textContent = 'START GAME';
    
    // Show game over
    setTimeout(() => {
        alert(`🎮 GAME OVER!\n\nFinal Score: ${score}\nLevel Reached: ${level}\n\nClick START to play again!`);
    }, 500);
}

function restartGame() {
    endGame();
    setTimeout(startGame, 100);
}

// ========== PLAYER CONTROLS ==========
document.addEventListener('keydown', (e) => {
    if (!gameActive) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            player.x = Math.max(0, player.x - player.speed);
            break;
        case 'ArrowRight':
            player.x = Math.min(gameArea.offsetWidth - player.width, player.x + player.speed);
            break;
    }
});

// ========== EVENT LISTENERS ==========
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);

// ========== INITIALIZE ==========
// Center player when window loads
window.addEventListener('load', () => {
    initGame();
    
    // Add some starter instructions in the game area
    const startMsg = document.createElement('div');
    startMsg.style.position = 'absolute';
    startMsg.style.top = '50%';
    startMsg.style.left = '50%';
    startMsg.style.transform = 'translate(-50%, -50%)';
    startMsg.style.color = '#4cc9f0';
    startMsg.style.fontSize = '20px';
    startMsg.style.textAlign = 'center';
    startMsg.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    startMsg.style.padding = '20px';
    startMsg.style.borderRadius = '10px';
    startMsg.innerHTML = 'Click START GAME to begin!<br>Use ← → keys to move';
    startMsg.id = 'startMessage';
    
    gameArea.appendChild(startMsg);
    
    // Remove message when game starts
    startBtn.addEventListener('click', () => {
        const msg = document.getElementById('startMessage');
        if (msg) msg.remove();
    });
});

console.log('🎮 Color Catch Game Ready!');