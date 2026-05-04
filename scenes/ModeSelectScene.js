/*
 ModeSelectScene.js

 This scene acts like the player status/menu screen after the landing page.
 It shows the player's saved rank, highest unlocked level, and level options.
*/

export default class ModeSelectScene extends Phaser.Scene {
    constructor() {
        super('ModeSelectScene');
    }

    create() {
        this.cameras.main.setBackgroundColor('#11161d');

        // Load saved progress from localStorage.
        // If there is no saved progress yet, the player starts at Rank 1 and only Level 1 is unlocked.
        const savedProgress = localStorage.getItem('subjectZeroProgress');
        let playerRank = 1;
        let unlockedLevel = 1;

        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            playerRank = progress.playerRank || 1;
            unlockedLevel = progress.unlockedLevel || 1;
        }

        // Main title
        this.add.text(this.scale.width / 2, 50, 'SUBJECT ZERO', {
            fontSize: '42px',
            fill: '#ffff66',
            align: 'center'
        }).setOrigin(0.5);

        // Player status section
        this.add.text(this.scale.width / 2, 105, 'PLAYER STATUS', {
            fontSize: '28px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(
            this.scale.width / 2,
            155,
            'Current Rank: ' + playerRank + '\nHighest Level Unlocked: ' + unlockedLevel,
            {
                fontSize: '22px',
                fill: '#dddddd',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Level 1 is always playable.
        const level1Button = this.add.text(this.scale.width / 2, 270, 'PLAY LEVEL 1', {
            fontSize: '28px',
            fill: '#00ff88',
            backgroundColor: '#1f2a36',
            padding: { x: 18, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        level1Button.on('pointerdown', () => {
            this.scene.start('GameScene', { level: 1 });
        });

        // Level 2 is locked until the player completes Level 1.
        const level2Text = unlockedLevel >= 2 ? 'PLAY LEVEL 2' : 'LEVEL 2 LOCKED';
        const level2Color = unlockedLevel >= 2 ? '#00ff88' : '#777777';

        const level2Button = this.add.text(this.scale.width / 2, 335, level2Text, {
            fontSize: '28px',
            fill: level2Color,
            backgroundColor: '#1f2a36',
            padding: { x: 18, y: 10 }
        }).setOrigin(0.5);

        if (unlockedLevel >= 2) {
            level2Button.setInteractive({ useHandCursor: true });
            level2Button.on('pointerdown', () => {
                this.scene.start('GameScene', { level: 2 });
            });
        }

        // Survival mode is planned for later, so show it as locked for now.
        this.add.text(this.scale.width / 2, 400, 'SURVIVAL MODE - COMING SOON', {
            fontSize: '24px',
            fill: '#888888',
            backgroundColor: '#1f2a36',
            padding: { x: 18, y: 10 }
        }).setOrigin(0.5);

        this.add.text(
            this.scale.width / 2,
            465,
            'Story Mode: complete levels to unlock the next sector.\nSurvival Mode will be added later as an endless wave mode.',
            {
                fontSize: '18px',
                fill: '#cccccc',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Back button returns to the landing screen.
        const backButton = this.add.text(this.scale.width / 2, 535, 'BACK', {
            fontSize: '22px',
            fill: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        backButton.on('pointerdown', () => {
            this.scene.start('StartScene');
        });
    }
}