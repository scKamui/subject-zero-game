/*
 ModeSelectScene.js

 This scene acts like the player status/menu screen after the landing page.
 It shows the player's saved rank, highest unlocked level, and level options.
*/

export default class ModeSelectScene extends Phaser.Scene {
    constructor() {
        super('ModeSelectScene');
    }

    preload() {
        // Load pickup images here because this scene appears before GameScene.
        // Without this, Phaser shows missing-texture boxes on the pickup info screen.
        this.load.image('akPickup', 'assets/pickups/ak.png');
        this.load.image('damageBoostPickup', 'assets/pickups/dmgboost.png');
        this.load.image('shotgunPickup', 'assets/pickups/shotgunPickup.png');
        this.load.image('armorPickup', 'assets/pickups/armorPickup.png');
        // The hearts image contains several hearts in one file.
        // For this menu, we create a simple one-heart icon in create() instead of using the full sheet.
    }

    create() {
        this.cameras.main.setBackgroundColor('#11161d');

        // Create a simple one-heart texture for the pickup info panel.
        // This avoids showing the full hearts image with multiple hearts.
        if (!this.textures.exists('menuHeartIcon')) {
            const heartGraphics = this.make.graphics({ x: 0, y: 0, add: false });
            heartGraphics.fillStyle(0xff3333, 1);
            heartGraphics.fillCircle(10, 10, 8);
            heartGraphics.fillCircle(22, 10, 8);
            heartGraphics.fillTriangle(3, 14, 29, 14, 16, 31);
            heartGraphics.generateTexture('menuHeartIcon', 32, 32);
            heartGraphics.destroy();
        }

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

        // Level 3 is locked until the player completes Level 2.
        const level3Text = unlockedLevel >= 3 ? 'PLAY LEVEL 3' : 'LEVEL 3 LOCKED';
        const level3Color = unlockedLevel >= 3 ? '#00ff88' : '#777777';

        const level3Button = this.add.text(this.scale.width / 2, 400, level3Text, {
            fontSize: '28px',
            fill: level3Color,
            backgroundColor: '#1f2a36',
            padding: { x: 18, y: 10 }
        }).setOrigin(0.5);

        if (unlockedLevel >= 3) {
            level3Button.setInteractive({ useHandCursor: true });
            level3Button.on('pointerdown', () => {
                this.scene.start('GameScene', { level: 3 });
            });
        }

        // Info buttons explain pickups and rank benefits without crowding the menu.
        const pickupInfoButton = this.add.text(this.scale.width / 2 - 105, 465, 'PICKUPS', {
            fontSize: '22px',
            fill: '#ffffff',
            backgroundColor: '#263747',
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        pickupInfoButton.on('pointerdown', () => {
            this.showPickupInfo();
        });

        const rankInfoButton = this.add.text(this.scale.width / 2 + 105, 465, 'RANK INFO', {
            fontSize: '22px',
            fill: '#ffffff',
            backgroundColor: '#263747',
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        rankInfoButton.on('pointerdown', () => {
            this.showRankInfo();
        });

        // Survival mode is planned for later, so show it as locked for now.
        this.add.text(this.scale.width / 2, 520, 'SURVIVAL MODE - COMING SOON', {
            fontSize: '24px',
            fill: '#888888',
            backgroundColor: '#1f2a36',
            padding: { x: 18, y: 10 }
        }).setOrigin(0.5);

        this.add.text(
            this.scale.width / 2,
            575,
            'Story Mode: complete levels to unlock the next sector.\nSurvival Mode will be added later as an endless wave mode.',
            {
                fontSize: '18px',
                fill: '#cccccc',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Back button returns to the landing screen.
        const backButton = this.add.text(this.scale.width / 2, 635, 'BACK', {
            fontSize: '22px',
            fill: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        backButton.on('pointerdown', () => {
            this.scene.start('StartScene');
        });
    }


    // Shows an overlay explaining what each pickup does.
    // Also displays the pickup image beside each description.
    showPickupInfo() {
        this.showInfoPanel('PICKUPS', '');

        const pickupEntries = [
            {
                key: 'akPickup',
                scale: 0.035,
                text: 'AK Pickup - unlocks automatic fire.'
            },
            {
                key: 'menuHeartIcon',
                scale: 1.2,
                text: 'Health Pickup - restores one heart.'
            },
            {
                key: 'damageBoostPickup',
                scale: 0.025,
                text: 'Damage Boost - temporarily increases bullet damage.'
            },
            {
                key: 'shotgunPickup',
                scale: 0.020,
                text: 'Shotgun Pickup - gives temporary spread shots.'
            },
            {
                key: 'armorPickup',
                scale: 0.025,
                text: 'Armor Pickup - blocks the next hit you take.'
            }
        ];

        const startY = 185;
        const spacingY = 72;

        for (let i = 0; i < pickupEntries.length; i++) {
            const entry = pickupEntries[i];
            const currentY = startY + (i * spacingY);

            let pickupImage;

            pickupImage = this.add.image(250, currentY, entry.key);

            pickupImage.setScale(entry.scale);
            pickupImage.setDepth(1001);
            this.infoPanelObjects.push(pickupImage);

            const pickupText = this.add.text(310, currentY, entry.text, {
                fontSize: '20px',
                fill: '#ffffff',
                wordWrap: { width: 430 }
            }).setOrigin(0, 0.5);

            pickupText.setDepth(1001);
            this.infoPanelObjects.push(pickupText);
        }
    }

    // Shows an overlay explaining the rank progression system.
    showRankInfo() {
        this.showInfoPanel(
            'RANK BENEFITS',
            'Rank 1 - starting combat stats.\n\n' +
            'Rank 2 - faster shooting unlocked.\n\n' +
            'Rank 3 - bullet damage increase unlocked.\n\n' +
            'Rank 4 - max rank with strongest upgrades.\n\n' +
            'Note: zombies also become stronger as your rank increases.'
        );
    }

    // Reusable popup panel for menu information.
    showInfoPanel(title, bodyText) {
        if (this.infoPanelObjects) {
            for (let i = 0; i < this.infoPanelObjects.length; i++) {
                this.infoPanelObjects[i].destroy();
            }
        }

        this.infoPanelObjects = [];

        const overlay = this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            720,
            430,
            0x0b0f14,
            0.97
        );
        overlay.setStrokeStyle(3, 0x5f7082);
        overlay.setDepth(1000);
        this.infoPanelObjects.push(overlay);

        const titleText = this.add.text(this.scale.width / 2, 120, title, {
            fontSize: '32px',
            fill: '#ffff66',
            align: 'center'
        }).setOrigin(0.5);
        titleText.setDepth(1001);
        this.infoPanelObjects.push(titleText);

        // Only create the body text if text was provided.
        // The pickup panel builds its own custom layout with images.
        if (bodyText !== '') {
            const body = this.add.text(this.scale.width / 2, 300, bodyText, {
                fontSize: '22px',
                fill: '#ffffff',
                align: 'left',
                wordWrap: { width: 600 }
            }).setOrigin(0.5);

            body.setDepth(1001);
            this.infoPanelObjects.push(body);
        }

        const closeButton = this.add.text(this.scale.width / 2, 500, 'CLOSE', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 18, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeButton.setDepth(1001);
        this.infoPanelObjects.push(closeButton);

        closeButton.on('pointerdown', () => {
            for (let i = 0; i < this.infoPanelObjects.length; i++) {
                this.infoPanelObjects[i].destroy();
            }

            this.infoPanelObjects = [];
        });
    }
}