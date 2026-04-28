import StartScene from './scenes/StartScene.js';
import GameScene from './scenes/GameScene.js';

const config = {
    type: Phaser.AUTO,
    width: 1000, // Set game width
    height: 600, // Set game height
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    // Make the game scale to the screen and stay centered
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    // StartScene loads first, then GameScene
    scene: [StartScene, GameScene]
};

new Phaser.Game(config);