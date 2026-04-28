export default class StartScene extends Phaser.Scene {

    constructor() {
        super('StartScene');
    }

    create() {
        // Get the center of the screen so everything can be aligned nicely
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Set a dark background to match the game theme
        this.cameras.main.setBackgroundColor('#0a0a0a');

        // Add some background shapes to give the screen a lab-style look
        this.add.rectangle(200, 150, 400, 300, 0x1a1a2e, 0.3).setDepth(-1);
        this.add.rectangle(600, 250, 350, 250, 0x16213e, 0.2).setDepth(-1);
        this.add.rectangle(100, 350, 300, 200, 0x0f3460, 0.25).setDepth(-1);

        // Add a dark panel behind the main menu text
        this.add.rectangle(centerX, centerY, 600, 500, 0x000000, 0.7).setDepth(-1);

        // Game title
        this.add.text(centerX, centerY - 180, 'SUBJECT ZERO', {
            fontSize: '64px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Subtitle under the title
        this.add.text(centerX, centerY - 110, 'Containment Breach Detected', {
            fontSize: '24px',
            fill: '#ff4444',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        // Short description of the game
        this.add.text(centerX, centerY - 55, 'You are immune. Escape the infected lab.', {
            fontSize: '20px',
            fill: '#cccccc',
            align: 'center'
        }).setOrigin(0.5);

        // Warning message
        this.add.text(centerX, centerY - 5, 'Warning: Infection Level Critical', {
            fontSize: '18px',
            fill: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Background panel for controls
        this.add.rectangle(centerX, centerY + 115, 700, 230, 0x333333, 0.8).setDepth(-1);

        // Controls title
        this.add.text(centerX, centerY + 35, 'CONTROLS', {
            fontSize: '26px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // List of controls
        this.add.text(centerX, centerY + 125,
            'Move: WASD / Arrow Keys\n' +
            'Shoot: Space / Left Mouse\n' +
            'AR Weapon: Hold Space / Mouse\n' +
            'Pause: P\n' +
            'Restart: R    Home: H',
            {
                fontSize: '18px',
                fill: '#ffffff',
                align: 'center',
                lineSpacing: 12
            }
        ).setOrigin(0.5);

        // Text telling the player how to start
        this.startText = this.add.text(centerX, centerY + 255, 'Press ENTER to Start', {
            fontSize: '32px',
            fill: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Add a simple pulsing effect to the start text
        this.tweens.add({
            targets: this.startText,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Pressing Enter will start the game
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    update() {
        // When Enter is pressed, switch to the main game scene
        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.scene.start('GameScene');
        }
    }
}