import createLevel1 from '../levels/level1.js';
import createLevel2 from '../levels/level2.js';
import createLevel3 from '../levels/level3.js';
import { createSurvivalArena } from '../levels/survivalArena.js';
export default class GameScene extends Phaser.Scene {

    // Basic setup for the game scene
    constructor() {
        super('GameScene');
    }

    init(data) {
        data = data || {};

        // Story mode uses levels.
        // Survival mode uses one arena and endless waves.
        this.currentMode = data.mode || 'story';
        this.currentLevel = data.level || 1;
    }

    // Load all the images and spritesheets we need for the game
    preload() {
        // Load zombie sprite sheets before the scene starts
        this.load.spritesheet('zombie_walk1', 'assets/zombies/zombie_walk1.png', {
            frameWidth: 128,
            frameHeight: 128
        });

        this.load.spritesheet('zombie_walk2', 'assets/zombies/zombie_walk2.png', {
            frameWidth: 128,
            frameHeight: 128
        });

        this.load.spritesheet('zombie_walk3', 'assets/zombies/zombie_walk3.png', {
            frameWidth: 128,
            frameHeight: 128
        });

        this.load.spritesheet('zombie_walk4', 'assets/zombies/zombie_walk4.png', {
            frameWidth: 128,
            frameHeight: 128
        });

        // Load player animations as spritesheets
        this.load.spritesheet('player_idle', 'assets/player/player_idle.png', {
            frameWidth: 128,
            frameHeight: 128
        });

        this.load.spritesheet('player_walk', 'assets/player/player_walk.png', {
            frameWidth: 128,
            frameHeight: 128
        });

        this.load.spritesheet('hearts', 'assets/ui/hearts.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.image('akPickup', 'assets/pickups/ak.png');

        this.load.image('damageBoostPickup', 'assets/pickups/dmgboost.png');
        this.load.image('shotgunPickup', 'assets/pickups/shotgunPickup.png');
        this.load.image('armorPickup', 'assets/pickups/armorPickup.png');
    }

    // Set up the game world, player, zombies, controls, and UI
    create() {
        // Create the player as an animated sprite
        this.player = this.physics.add.sprite(100, 200, 'player_idle');
        this.player.setScale(0.75);
        this.player.setCollideWorldBounds(true);
        this.player.body.setAllowGravity(false);

        // Restore the original player hitbox for proper collision behavior
        this.player.body.setSize(20, 14);
        this.player.body.setOffset(54, 90);

        if (this.currentMode === 'survival') {
            // survival arena is 3600 wide, so the world bound needs to match it.
            this.levelWidth = 3600;
        } else if (this.currentLevel === 3) {
            this.levelWidth = 6000;
        } else if (this.currentLevel === 2) {
            this.levelWidth = 5000;
        } else {
            this.levelWidth = 3600;
        }

        // Make the level wider than the screen so the camera can scroll sideways
        this.physics.world.setBounds(0, 0, this.levelWidth, 400);

        // Arrow key input
        this.cursors = this.input.keyboard.createCursorKeys();

        // WASD input
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        // Spacebar input for shooting
        this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // P key pauses and resumes the game
        this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.quitKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

        // R restarts the level, H returns to the home screen, and Enter dismisses the level briefing
        this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.homeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.nextLevelKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N);

        // Temporary testing shortcut for Assignment 3.
        // Press T to reset saved rank progress back to Rank 1.
        this.resetRankKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);


        // Player movement speed
        this.playerSpeed = 150;

        // Build the current level layout using the separate Level 1 file
        if (this.currentMode === 'survival') {
            createSurvivalArena(this);
        } else if (this.currentLevel === 3) {
            createLevel3(this);
        } else if (this.currentLevel === 2) {
            createLevel2(this);
        } else {
            createLevel1(this);
        }

        // Survival starts the player near the middle of the arena.
        if (this.currentMode === 'survival') {
            this.player.setPosition(this.playerStartX || 1800, this.playerStartY || 200);
        }
        
        // Let the player collide with the level walls and obstacles from Level 1.
        if (this.labWallGroup) {
            this.physics.add.collider(this.player, this.labWallGroup);
        }

        // Bullet settings
        this.bulletSpeed = 400;
        this.lastFired = 0;
        this.fireRate = 250; // milliseconds between shots

        // Store bullets in a normal array for now
        this.bullets = [];
        this.enemyProjectiles = [];
        this.randomPickups = [];

        // Store zombies in an array
        this.zombies = [];

        // Zombie speed
        this.zombieSpeed = 80;

        // Set up zombie walking animations so they look alive when moving
        this.anims.create({
            key: 'zombie1_walk',
            frames: this.anims.generateFrameNumbers('zombie_walk1', { start: 0, end: 9 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'zombie2_walk',
            frames: this.anims.generateFrameNumbers('zombie_walk2', { start: 0, end: 9 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'zombie3_walk',
            frames: this.anims.generateFrameNumbers('zombie_walk3', { start: 0, end: 9 }),
            frameRate: 12,
            repeat: -1
        });

        this.anims.create({
            key: 'zombie4_walk',
            frames: this.anims.generateFrameNumbers('zombie_walk4', { start: 0, end: 9 }),
            frameRate: 9,
            repeat: -1
        });

        // Player animations for idle and walking
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player_idle', { start: 0, end: 6 }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('player_walk', { start: 0, end: 6 }),
            frameRate: 10,
            repeat: -1
        });


        // Score starts at 0
        this.score = 0;

        // --- Rank system (Assignment 3) ---
        // Keeps track of player progression and scaling difficulty

        this.playerRank = 1;           // current rank
        this.nextRankScore = 1000;     // score needed for next rank
        this.maxRank = 4;              // max rank cap

        this.baseBulletDamage = 1;     // base damage (increases later)
        this.rankFireRateBonus = 0;    // reduces delay between shots

        this.zombieHealthMultiplier = 1; // zombies get tougher over time
        this.zombieSpeedMultiplier = 1;  // zombies get faster over time

        // Load saved rank progress if this player has played before.
        this.loadProgress();
        this.bulletDamage = this.baseBulletDamage;
        this.unlockedLevel = this.unlockedLevel || 1;

        // Place zombies after rank/difficulty values are set.
        // Story mode uses fixed enemy placement. Survival mode starts waves after the briefing.
        if (this.currentMode === 'survival') {
            this.setupSurvivalMode();
        } else {
            this.spawnWave('entrance');
            this.spawnWave('armory');
            this.spawnWave('corridor');
            this.spawnWave('testchamber');
            this.spawnWave('final');
        }

        // Level 3 objective setup.
        // The player must hold both terminal areas before the exit unlocks.
        this.terminalHoldRequired = 10000; // 10 seconds per terminal
        this.terminalAProgress = 0;
        this.terminalBProgress = 0;
        this.terminalAActivated = false;
        this.terminalBActivated = false;
        this.level3ExitUnlocked = this.currentLevel !== 3;

        // Level 3 holdout spawn flags.
        // These make sure each terminal only triggers its defense wave once.
        this.terminalASpawnedDefense = false;
        this.terminalBSpawnedDefense = false;

        
        // Only show the score in the HUD.
        // Use the loaded rank values right away so the briefing screen shows the correct saved progress.
        const startingPointsNeeded = this.nextRankScore - this.score;
        let startingHudText = 'Score: 0 | Rank: ' + this.playerRank + ' | Need: ' + startingPointsNeeded;

        if (this.currentMode === 'survival') {
            startingHudText = 'Wave: 0 | Score: 0 | Rank: ' + this.playerRank;
        } else if (this.playerRank >= this.maxRank) {
            startingHudText = 'Score: 0 | Rank: MAX';
        }

        this.uiText = this.add.text(16, this.scale.height - 70, startingHudText, {
            fontSize: '24px',
            fill: '#ffffff'
        });
        this.uiText.setScrollFactor(0);
        this.uiText.setDepth(20);

        // Show player's health as 3 hearts below the score
        this.heartFullFrame = 0;
        this.heartEmptyFrame = 4;
        this.heartVisibleScale = 1.8;
        this.hearts = [];

        for (let i = 0; i < 3; i++) {
            const heart = this.add.image(30 + i * 32, this.scale.height - 25, 'hearts', this.heartFullFrame);
            heart.setScrollFactor(0);
            heart.setScale(this.heartVisibleScale);
            heart.setDepth(20);
            this.hearts.push(heart);
        }

        // Temporary text in the middle for pickups and status updates.
        this.pickupText = this.add.text(this.scale.width / 2, 120, '', {
            fontSize: '28px',
            fill: '#ffff66',
            align: 'center'
        }).setOrigin(0.5, 0.5);
        this.pickupText.setFixedSize(this.scale.width, 0);
        this.pickupText.setAlign('center');
        this.pickupText.setScrollFactor(0);
        this.pickupText.setDepth(1000);
        this.pickupText.setVisible(false);

        // Start health at 105 so losing 35 each hit matches cleanly with 3 hearts.
        this.playerHealth = 105;

        // Replace the placeholder health pickup with a heart image.
        // Level 1 keeps its guaranteed health pickup.
        // Level 2 and Level 3 use randomized pickups instead.
        if (this.healthPickup) {
            const pickupX = this.healthPickup.x;
            const pickupY = this.healthPickup.y;
            this.healthPickup.destroy();

            if (this.currentLevel === 1) {
                this.healthPickup = this.add.image(pickupX, pickupY, 'hearts', this.heartFullFrame);
                this.healthPickup.setScale(2.2);
                this.healthPickup.setDepth(10);

                this.tweens.add({
                    targets: this.healthPickup,
                    y: pickupY - 8,
                    duration: 800,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            } else {
                this.healthPickup = null;
            }
        }

        // Replace the placeholder damage boost pickup with the PNG version.
        // Level 1 keeps its guaranteed damage boost pickup.
        // Level 2 and Level 3 use randomized pickups instead.
        if (this.damagePickup) {
            const pickupX = this.damagePickup.x;
            const pickupY = this.damagePickup.y;
            this.damagePickup.destroy();

            if (this.currentLevel === 1) {
                this.damagePickup = this.add.image(pickupX, pickupY, 'damageBoostPickup');
                this.damagePickup.setScale(0.02);
                this.damagePickup.setDepth(5);
                this.damagePickup.setAngle(20);

                this.tweens.add({
                    targets: this.damagePickup,
                    y: pickupY - 8,
                    duration: 800,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });

                this.tweens.add({
                    targets: this.damagePickup,
                    scale: 0.025,
                    duration: 500,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            } else {
                this.damagePickup = null;
            }
        }

        // Damage cooldown so the player does not take damage every frame
        this.lastHitTime = 0;
        this.hitCooldown = 1000; // 1 second between hits

        // Brief hit state so the player flashes when damage is taken
        this.playerHitTimer = 0;

        // Replace the placeholder AR pickup with the AK image.
        // Keep the same position and pickup behavior.
        if (this.arPickup) {
            const pickupX = this.arPickup.x;
            const pickupY = this.arPickup.y;
            this.arPickup.destroy();
            this.arPickup = this.add.image(pickupX, pickupY, 'akPickup');
            this.arPickup.setScale(0.02);
            this.arPickup.setDepth(10);
            this.arPickup.setAngle(-15);

            this.tweens.add({
                targets: this.arPickup,
                y: pickupY - 6,
                duration: 900,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // Randomize non-AR pickups in Level 2 and Level 3.
        // The AR stays guaranteed because it is important for later levels.
        if (this.currentLevel === 2 || this.currentLevel === 3) {
            this.spawnRandomPickupsForLevel();
        }
        
        // Player starts with the pistol weapon.
        this.currentWeapon = 'pistol';

        // Set up mouse shooting
        // Shoot when the left mouse button is clicked
        this.input.on('pointerdown', (pointer) => {
            if (pointer.button === 0) { // left click

                // Update the aim position right when the player clicks.
                // This makes the shot use the exact click location instead of an older mouse position.
                this.mouseWorldX = pointer.worldX;
                this.mouseWorldY = pointer.worldY;

                if (!this.levelIntroActive && !this.isPaused && !this.gameEnded && this.time.now > this.lastFired) {
                    if (this.currentWeapon === 'shotgun') {
                        this.shootShotgun();
                    } else {
                        this.shootBullet();
                    }

                    this.lastFired = this.time.now + this.fireRate;
                }
            }
        });

        // Store an initial mouse position for aiming
        this.mouseWorldX = this.player.x + 100;
        this.mouseWorldY = this.player.y;

        // Small crosshair that shows where the player is aiming.
        // I removed the long aim line because it was too distracting on the screen.
        // This still gives the player aim feedback without covering the level.
        this.aimMarker = this.add.graphics();
        this.aimMarker.setDepth(1000);

        // Update the mouse position for aiming
        this.input.on('pointermove', (pointer) => {
            // Save the mouse position in world space so aiming still works while the camera scrolls
            this.mouseWorldX = pointer.worldX;
            this.mouseWorldY = pointer.worldY;
        });

        // Base bullet damage for both weapons at the start
        this.bulletDamage = this.baseBulletDamage;

        // Timer for the temporary damage boost
        this.damageBoostTimer = 0;

        // Keep track of whether the damage boost is active
        this.damageBoostActive = false;

        // Armor pickup state.
        // When this is true, the next zombie/spitter hit will be blocked.
        this.hasArmor = false;

        // Shotgun pickup state.
        // The shotgun is temporary, so this timer counts down after pickup.
        this.shotgunTimer = 0;
        this.previousWeaponBeforeShotgun = null;

        // Timer for pickup/status text shown in the middle of the screen
        this.pickupMessageTimer = 0;

        // Keep track of whether the game is paused
        this.isPaused = false;

        // Keep track of whether the game has ended
        this.gameEnded = false;
        this.levelCompleted = false;
        this.deathPending = false;
        this.deathEvent = null;

        // Make the camera follow the player through the level
        this.cameras.main.setBounds(0, 0, this.levelWidth, 400);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

        // Pause message shown in the middle of the screen
        this.pauseText = this.add.text(this.scale.width / 2, 200, 'PAUSED\nPress P to Resume\nPress R to Restart\nPress Q for Home', {
            fontSize: '36px',
            fill: '#ffff00',
            align: 'center'
        }).setOrigin(0.5, 0.5);
        this.pauseText.setFixedSize(this.scale.width, 0);
        this.pauseText.setAlign('center');
        this.pauseText.setScrollFactor(0);
        this.pauseText.setDepth(1000);

        // Hide the pause text until the game is paused
        this.pauseText.setVisible(false);

        // Win message shown when the player reaches the exit
        this.winText = this.add.text(
            this.scale.width / 2,
            200,
            this.currentLevel === 1
                ? 'LEVEL 1 COMPLETE!\nPress N for Level 2\nPress R to Restart\nPress H for Home'
                : 'YOU ESCAPED!\nPress R to Restart\nPress H for Home',
            {
                fontSize: '36px',
                fill: '#00ff00',
                align: 'center'
            }
        ).setOrigin(0.5, 0.5);
        this.winText.setFixedSize(this.scale.width, 0);
        this.winText.setAlign('center');
        this.winText.setScrollFactor(0);
        this.winText.setDepth(1000);
        this.winText.setVisible(false);

        // Create the game over message here so all deaths use the same screen
        this.gameOverText = this.add.text(this.scale.width / 2, 200, 'GAME OVER\nPress R to Restart\nPress H for Home', {
            fontSize: '36px',
            fill: '#ff4444',
            align: 'center'
        }).setOrigin(0.5, 0.5);
        this.gameOverText.setFixedSize(this.scale.width, 0);
        this.gameOverText.setAlign('center');
        this.gameOverText.setScrollFactor(0);
        this.gameOverText.setDepth(1000);
        this.gameOverText.setVisible(false);

        // Show a level briefing before gameplay starts
        this.levelIntroActive = true;

        this.levelIntroBox = this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2 + 10,
            840,
            420,
            0x11161d,
            0.94
        );
        this.levelIntroBox.setStrokeStyle(3, 0x5f7082);
        this.levelIntroBox.setScrollFactor(0);
        this.levelIntroBox.setDepth(1100);

        let briefingTitle = 'LEVEL 1 BRIEFING';

        if (this.currentMode === 'survival') {
            briefingTitle = 'SURVIVAL MODE';
        } else if (this.currentLevel === 2) {
            briefingTitle = 'LEVEL 2 BRIEFING';
        } else if (this.currentLevel === 3) {
            briefingTitle = 'LEVEL 3 BRIEFING';
        }

        this.levelIntroTitle = this.add.text(this.scale.width / 2, 75, briefingTitle, {
            fontSize: '34px',
            fill: '#ffff66',
            align: 'center'
        }).setOrigin(0.5, 0.5);
        this.levelIntroTitle.setScrollFactor(0);
        this.levelIntroTitle.setDepth(1101);

        let briefingText =
            'Goal: survive and reach the exit.\n\n' +
            'Move: WASD or Arrow Keys\n' +
            'Aim: Mouse Cursor\n' +
            'Shoot: Left Click or Spacebar\n\n' +
            'Health packs restore one heart.\n' +
            'Damage boosts increase bullet damage briefly.\n\n' +
            'AIM FOR THE HEAD.\n\n' +
            'Beware of tank zombies — they are slow, tough, and deal heavy damage.\n\n' +
            'Press ENTER when you are ready.';

        if (this.currentLevel === 2) {
            briefingText =
                'Goal: restore power and reach the exit.\n\n' +
                'The next sector is longer and the exit is locked.\n' +
                'Find the power room switch first.\n\n' +
                'New threat detected: faster infected may appear.\n\n' +
                'Move: WASD or Arrow Keys\n' +
                'Aim: Mouse Cursor\n' +
                'Shoot: Left Click or Spacebar\n\n' +
                'Press ENTER when you are ready.';
        }

        if (this.currentLevel === 3) {
            briefingText =
                'Goal: activate both terminals and reach the exit.\n\n' +
                'Stand inside each terminal area to upload the override.\n' +
                'Leaving the area pauses the upload, so hold your ground.\n\n' +
                'New threat detected: spitter infected can attack from range.\n\n' +
                'Activate Terminal A and Terminal B to unlock the exit.\n\n' +
                'Press ENTER when you are ready.';
        }

        if (this.currentMode === 'survival') {
            briefingText =
                'Goal: survive as many waves as possible.\n\n' +
                'Zombies get stronger and more numerous each wave.\n' +
                'Random pickups may appear between waves.\n\n' +
                'Enemy types unlock over time: runners, tanks, and spitters.\n\n' +
                'Press ENTER when you are ready.';
        }

        this.levelIntroText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 + 8,
            briefingText,
            {
                fontSize: '24px',
                fill: '#ffffff',
                align: 'center',
                wordWrap: { width: 620 }
            }
        ).setOrigin(0.5, 0.5);
        this.levelIntroText.setFixedSize(620, 0);
        this.levelIntroText.setAlign('center');
        this.levelIntroText.setScrollFactor(0);
        this.levelIntroText.setDepth(1101);
    }

    // Main game loop - runs every frame to update game state
    update(time, delta) {
        // If the game is over, allow restart or return to the main menu
        if (this.gameEnded) {
            // Level 1 -> Level 2
            if (this.levelCompleted && this.currentLevel === 1 && Phaser.Input.Keyboard.JustDown(this.nextLevelKey)) {
                this.scene.start('GameScene', { level: 2 });
                return;
            }

            // Level 2 -> Level 3
            if (this.levelCompleted && this.currentLevel === 2 && Phaser.Input.Keyboard.JustDown(this.nextLevelKey)) {
                this.scene.start('GameScene', { level: 3 });
                return;
            }

            if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
                if (this.deathEvent) {
                    this.deathEvent.remove(false);
                    this.deathEvent = null;
                }
                if (this.currentMode === 'survival') {
                    this.scene.restart({ mode: 'survival' });
                } else {
                    this.scene.restart({ level: this.currentLevel });
                }
            }

            if (Phaser.Input.Keyboard.JustDown(this.homeKey)) {
                if (this.deathEvent) {
                    this.deathEvent.remove(false);
                    this.deathEvent = null;
                }
                this.scene.start('ModeSelectScene');
            }

            return;
        }
        
        // If the player already took a fatal hit, wait for the delayed game over screen
        if (this.deathPending) {
            return;
        }

        // Keep the level intro on screen until Enter is pressed
        if (this.levelIntroActive) {
            if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
                this.levelIntroActive = false;
                this.levelIntroBox.setVisible(false);
                this.levelIntroTitle.setVisible(false);
                this.levelIntroText.setVisible(false);

                // Survival waves only start after the player closes the briefing.
                if (this.currentMode === 'survival' && !this.survivalStarted) {
                    this.survivalStarted = true;
                    this.startNextSurvivalWave();
                }
            }
            return;
        }

        // Press P to pause or unpause the game
        if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
            this.isPaused = !this.isPaused;
            this.pauseText.setVisible(this.isPaused);
        }

            if (this.isPaused) {
                // Allow restarting from the pause menu
                if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
                    if (this.currentMode === 'survival') {
                        this.scene.restart({ mode: 'survival' });
                    } else {
                        this.scene.restart({ level: this.currentLevel });
                    }
                }

                // Allow quitting to main menu while paused
                if (Phaser.Input.Keyboard.JustDown(this.quitKey)) {
                    this.scene.start('ModeSelectScene');
                }

                return;
            }

        // Temporary testing shortcut: press T to reset saved rank progress.
        // This helps test localStorage without manually clearing browser data.
        if (Phaser.Input.Keyboard.JustDown(this.resetRankKey)) {
            this.resetProgress();
        }

        // Keep the aim position updated using world coordinates.
        // This matters because the camera scrolls, so screen coordinates alone would make aiming feel off.
        const pointer = this.input.activePointer;
        const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        this.mouseWorldX = worldPoint.x;
        this.mouseWorldY = worldPoint.y;

        // Redraw the crosshair at the current aim position every frame.
        // The marker is small on purpose so it helps aiming without blocking the view.
        this.aimMarker.clear();
        this.aimMarker.lineStyle(2, 0xffdd66, 0.9);
        this.aimMarker.strokeCircle(this.mouseWorldX, this.mouseWorldY, 1);
        this.aimMarker.lineBetween(this.mouseWorldX - 5, this.mouseWorldY, this.mouseWorldX + 5, this.mouseWorldY);
        this.aimMarker.lineBetween(this.mouseWorldX, this.mouseWorldY - 5, this.mouseWorldX, this.mouseWorldY + 5);

        // Reset velocity each frame to prevent speed buildup
        this.player.body.setVelocity(0);

        // Handle player movement with WASD or arrow keys
        // LEFT movement
        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            this.player.body.setVelocityX(-this.playerSpeed);
        }
        // RIGHT movement
        else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            this.player.body.setVelocityX(this.playerSpeed);
        }

        // UP movement
        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            this.player.body.setVelocityY(-this.playerSpeed);
        }
        // DOWN movement
        else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            this.player.body.setVelocityY(this.playerSpeed);
        }

        // Normalize velocity so moving diagonally isn't faster than straight lines
        this.player.body.velocity.normalize().scale(this.playerSpeed);

        if (this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0) {
            this.player.anims.play('walk', true);
        } else {
            this.player.anims.play('idle', true);
        }

        // Update depth based on y-position for better top-down layering
        this.player.setDepth(this.player.y);

        // Flip player sprite to face the mouse cursor for aiming
        if (this.mouseWorldX < this.player.x) {
            this.player.setFlipX(true);
        } else if (this.mouseWorldX > this.player.x) {
            this.player.setFlipX(false);
        }

        // If mouse is too close to center, face based on movement direction instead
        if (Math.abs(this.mouseWorldX - this.player.x) < 6) {
            if (this.player.body.velocity.x < 0) {
                this.player.setFlipX(true);
            } else if (this.player.body.velocity.x > 0) {
                this.player.setFlipX(false);
            }
        }

        // Change fire rate based on the current weapon
        // Fire rate gets faster as rank increases
        if (this.currentWeapon === 'pistol') {
            this.fireRate = Math.max(120, 250 - this.rankFireRateBonus);
        } else if (this.currentWeapon === 'ar') {
            this.fireRate = Math.max(60, 100 - this.rankFireRateBonus);
        } else if (this.currentWeapon === 'shotgun') {
            // Shotgun fires slower because it shoots multiple pellets at once.
            this.fireRate = 450;
        }

        // Shooting works differently depending on the weapon.
        // Pistol fires one shot at a time, while the AR can be held down.
        if (this.currentWeapon === 'pistol') {
            if (Phaser.Input.Keyboard.JustDown(this.shootKey) && time > this.lastFired) {
                this.shootBullet();
                this.lastFired = time + this.fireRate;
            }
        } else if (this.currentWeapon === 'ar') {
            // AR keeps firing while spacebar or the mouse button is held.
            if ((this.shootKey.isDown || this.input.activePointer.isDown) && time > this.lastFired) {
                this.shootBullet();
                this.lastFired = time + this.fireRate;
            }
        } else if (this.currentWeapon === 'shotgun') {
            // Shotgun now fires continuously while holding shoot.
            // It still shoots slower than the AR because each shot fires multiple pellets.
            if ((this.shootKey.isDown || this.input.activePointer.isDown) && time > this.lastFired) {
                this.shootShotgun();
                this.lastFired = time + this.fireRate;
            }
        }

        // Update bullet positions each frame since they're not using physics
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];

            // Move bullet in the direction it was fired, using saved velocity
            bullet.x += bullet.velocityX * (delta / 1000);
            bullet.y += bullet.velocityY * (delta / 1000);

            // Remove bullets that go off-screen to prevent buildup
            if (bullet.x < -50 || bullet.x > this.levelWidth + 50 || bullet.y < -50 || bullet.y > 450) {
                bullet.destroy();
                this.bullets.splice(i, 1);
                continue;
            }

            // Check if the bullet hits a wall or obstacle.
            // Bullets should not pass through level objects.
            let bulletHitWall = false;

            if (this.labWalls && this.labWalls.length > 0) {
                for (let w = 0; w < this.labWalls.length; w++) {
                    const wall = this.labWalls[w];

                    if (Phaser.Geom.Intersects.RectangleToRectangle(bullet.getBounds(), wall.getBounds())) {
                        bullet.destroy();
                        this.bullets.splice(i, 1);
                        bulletHitWall = true;
                        break;
                    }
                }
            }

            // If the bullet hit a wall, skip zombie checks for this bullet.
            if (bulletHitWall) {
                continue;
            }

            // Check if this bullet hits any zombie
            let bulletHitZombie = false;

            for (let j = this.zombies.length - 1; j >= 0; j--) {
                const zombie = this.zombies[j];

                // Use simple rectangle overlap collision detection
                if (
                    bullet.x < zombie.x + 20 &&
                    bullet.x + 12 > zombie.x - 20 &&
                    bullet.y < zombie.y + 20 &&
                    bullet.y + 4 > zombie.y - 20
                ) {
                    // Show a quick hit flash effect at the impact point
                    const hitFlash = this.add.circle(bullet.x, bullet.y, 6, 0xffcc66);
                    hitFlash.setDepth(14);

                    this.tweens.add({
                        targets: hitFlash,
                        alpha: 0,
                        scale: 1.8,
                        duration: 100,
                        onComplete: () => {
                            hitFlash.destroy();
                        }
                    });

                    // Remove the bullet right away so it stops on impact
                    bullet.destroy();
                    this.bullets.splice(i, 1);
                    bulletHitZombie = true;

                    // Deal damage to the zombie based on current bullet power
                    zombie.health -= this.bulletDamage;

                    // Remove the zombie if its health reaches 0
                    if (zombie.health <= 0) {
                        zombie.destroy();
                        this.zombies.splice(j, 1);

                        // Add score based on zombie type, then check if the player should rank up.
                        this.score += zombie.scoreValue || 50;
                        this.checkRankUp();
                    }

                    // Stop after the first zombie hit
                    break;
                }
            }

            // If the bullet hit a zombie, stop processing this bullet
            if (bulletHitZombie) {
                continue;
            }
        }

        // Move enemy spit projectiles and check if they hit the player.
        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            const spit = this.enemyProjectiles[i];

            spit.x += spit.velocityX * (delta / 1000);
            spit.y += spit.velocityY * (delta / 1000);

            if (spit.x < -50 || spit.x > this.levelWidth + 50 || spit.y < -50 || spit.y > 450) {
                spit.destroy();
                this.enemyProjectiles.splice(i, 1);
                continue;
            }

            // Use a much smaller hitbox for spit projectiles so they feel fairer.
            // The player now has to be hit more directly instead of taking splash-like damage.
            const playerSpitHitbox = new Phaser.Geom.Rectangle(
                this.player.x - 10,
                this.player.y - 12,
                20,
                24
            );

            if (Phaser.Geom.Intersects.RectangleToRectangle(spit.getBounds(), playerSpitHitbox)) {
                spit.destroy();
                this.enemyProjectiles.splice(i, 1);

                if (time > this.lastHitTime) {
                    // Armor blocks one spitter hit before health is reduced.
                    if (this.hasArmor) {
                        this.hasArmor = false;
                        this.player.clearTint();
                        this.showPickupMessage('Armor absorbed hit');
                        this.lastHitTime = time + this.hitCooldown;
                        continue;
                    }

                    this.playerHealth -= 35;
                    this.lastHitTime = time + this.hitCooldown;
                    this.playerHitTimer = 200;
                    this.player.setTint(0xff0000);
                    this.cameras.main.shake(100, 0.003);

                    if (this.playerHealth <= 0) {
                        this.playerHealth = 0;
                        this.player.body.setVelocity(0, 0);
                        this.deathPending = true;
                        this.gameOver();
                        return;
                    }
                }
            }
        }

        // Keep the player red for a brief moment after taking damage
        if (this.playerHitTimer > 0) {
            this.playerHitTimer -= delta;
            this.player.setTint(0xff0000);
        } else {
            // Return to normal after hit flash, unless armor is active.
            if (this.hasArmor) {
                this.player.setTint(0xaaddff);
            } else {
                this.player.clearTint();
            }
        }

        // Count down the damage boost timer and reset damage when it ends
        if (this.damageBoostTimer > 0) {
            this.damageBoostTimer -= delta;
            this.damageBoostActive = true;

            if (this.damageBoostTimer <= 0) {
                this.bulletDamage = this.baseBulletDamage;
                this.damageBoostTimer = 0;
                this.damageBoostActive = false;
                this.showPickupMessage('Boost Off');
            }
        } else {
            this.damageBoostActive = false;
        }

        // Count down the temporary shotgun pickup.
        // When the timer ends, switch back to the previous weapon.
        if (this.shotgunTimer > 0) {
            this.shotgunTimer -= delta;

            if (this.shotgunTimer <= 0) {
                this.shotgunTimer = 0;
                this.currentWeapon = this.previousWeaponBeforeShotgun || 'pistol';
                this.previousWeaponBeforeShotgun = null;
                this.showPickupMessage('Shotgun expired');
            }
        }

        // Hide pickup/status text after about 2 seconds
        if (this.pickupMessageTimer > 0) {
            this.pickupMessageTimer -= delta;

            if (this.pickupMessageTimer <= 0) {
                this.pickupMessageTimer = 0;
                this.pickupText.setVisible(false);
            }
        }

        // Show score, current rank, and how many more points are needed for the next rank.
        const pointsNeeded = this.nextRankScore - this.score;
        if (this.currentMode === 'survival') {
            this.uiText.setText('Wave: ' + this.survivalWave + ' | Score: ' + this.score + ' | Rank: ' + this.playerRank);
        } else if (this.playerRank < this.maxRank) {
            this.uiText.setText(
                'Score: ' + this.score +
                ' | Rank: ' + this.playerRank +
                ' | Need: ' + pointsNeeded
            );
        } else {
            this.uiText.setText('Score: ' + this.score + ' | Rank: MAX');
        }

        // Update the heart display - each heart shows 35 health points
        const heartsRemaining = Math.ceil(this.playerHealth / 35);

        for (let i = 0; i < this.hearts.length; i++) {
            if (i < heartsRemaining) {
                this.hearts[i].setFrame(this.heartFullFrame);
                this.hearts[i].setVisible(true);
                this.hearts[i].setScale(this.heartVisibleScale);
            } else {
                this.hearts[i].setVisible(false);
            }
        }

        // Check if the player picks up the AK.
        // Use a smaller box so it only collects when the player is actually close.
        if (this.arPickup) {
            const akPickupBox = new Phaser.Geom.Rectangle(
                this.arPickup.x - 18,
                this.arPickup.y - 10,
                36,
                20
            );

            if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), akPickupBox)) {
                // Switch from the pistol to the AR
                this.currentWeapon = 'ar';
                this.showPickupMessage('AK Equipped\nAutomatic fire: hold shoot');

                // Remove the pickup after collecting it
                this.arPickup.destroy();
                this.arPickup = null;
            }
        }

        // Check if the player picks up the health pack.
        // Use a smaller hitbox so the player has to get close.
        if (this.healthPickup) {
            const healthPickupBox = new Phaser.Geom.Rectangle(
                this.healthPickup.x - 10,
                this.healthPickup.y - 10,
                20,
                20
            );

            if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), healthPickupBox)) {
                this.playerHealth += 35;

                if (this.playerHealth > 105) {
                    this.playerHealth = 105;
                }

                this.showPickupMessage('Health Restored');

                this.healthPickup.destroy();
                this.healthPickup = null;
            }
        }

        // Check if the player picks up the damage boost.
        // Use a smaller box so it only collects when the player is actually close.
        if (this.damagePickup) {
            const damagePickupBox = new Phaser.Geom.Rectangle(
                this.damagePickup.x - 12,
                this.damagePickup.y - 12,
                24,
                24
            );

            if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), damagePickupBox)) {
                // Increase bullet damage for a short time
                this.bulletDamage = this.baseBulletDamage + 1;
                this.damageBoostTimer = 6000; // 6 seconds
                this.showPickupMessage('Boost On');

                // Remove the pickup after collecting it
                this.damagePickup.destroy();
                this.damagePickup = null;
            }
        }

        // Check randomized pickups for Level 2 and Level 3.
        // These pickups can be health, damage boost, shotgun, or armor.
        for (let i = this.randomPickups.length - 1; i >= 0; i--) {
            const pickup = this.randomPickups[i];

            if (!pickup || !pickup.active) {
                this.randomPickups.splice(i, 1);
                continue;
            }

            const pickupBox = new Phaser.Geom.Rectangle(
                pickup.x - 14,
                pickup.y - 14,
                28,
                28
            );

            if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), pickupBox)) {
                this.collectRandomPickup(pickup);
                this.randomPickups.splice(i, 1);
            }
        }

        // Survival checks if the wave is cleared and starts the next wave.
        if (this.currentMode === 'survival') {
            this.updateSurvivalMode(delta);
        }

        // Check if the player activates the Level 2 power switch.
        // The Level 2 exit stays locked until the power is restored.
        if (this.powerSwitch && !this.powerRestored) {
            const powerBox = new Phaser.Geom.Rectangle(
                this.powerSwitch.x - 10,
                this.powerSwitch.y - 10,
                20,
                20
            );

            if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), powerBox)) {
                this.powerRestored = true;
                this.powerSwitch.destroy();
                this.powerSwitch = null;

                if (this.powerSwitchLabel) {
                    this.powerSwitchLabel.destroy();
                    this.powerSwitchLabel = null;
                }

                this.showPickupMessage('Power Restored!\nExit unlocked');
            }
        }

        // Level 3 terminal objective only applies to story mode.
        if (this.currentMode !== 'survival' && this.currentLevel === 3) {
            this.updateTerminalObjective(delta);
        }

        // Check if the player reaches the exit and wins.
        // Use a smaller center box so the level only ends when the visible player is really inside it.
        if (this.exitZone) {
            const playerCenterBox = new Phaser.Geom.Rectangle(
                this.player.x - 8,
                this.player.y - 10,
                16,
                20
            );

            if (Phaser.Geom.Intersects.RectangleToRectangle(playerCenterBox, this.exitZone.getBounds())) {
                if (this.currentLevel === 2 && !this.powerRestored) {
                    this.showPickupMessage('Exit locked\nRestore power first');
                } else if (this.currentLevel === 3 && !this.level3ExitUnlocked) {
                    this.showPickupMessage('Exit locked\nActivate both terminals');
                } else {
                    this.winGame();
                    return;
                }
            }
        }

        // Zombies are already placed in the level.
        // They only start chasing when the player gets close.

        // Move zombies toward the player
        for (let i = this.zombies.length - 1; i >= 0; i--) {
            const zombie = this.zombies[i];

            // Skip destroyed zombies safely
            if (!zombie || !zombie.body) {
                continue;
            }

            // Work out the direction from the zombie to the player
            const dx = this.player.x - zombie.x;
            const dy = this.player.y - zombie.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Activate the zombie if the player gets close enough
            if (distance < 600) {
                zombie.activeChase = true;
            }

            let velocityX = 0;
            let velocityY = 0;

            // Only move once activated.
            // Spitters keep distance and shoot instead of rushing the player.
            if (zombie.activeChase && distance > 0) {
                if (zombie.isSpitter) {
                    if (distance > zombie.preferredDistance + 80) {
                        velocityX = (dx / distance) * zombie.speed;
                        velocityY = (dy / distance) * zombie.speed;
                    } else if (distance < zombie.preferredDistance - 60) {
                        velocityX = -(dx / distance) * zombie.speed;
                        velocityY = -(dy / distance) * zombie.speed;
                    }

                    if (time > zombie.lastSpitTime + zombie.spitCooldown) {
                        this.shootSpit(zombie);
                        zombie.lastSpitTime = time;
                    }
                } else {
                    velocityX = (dx / distance) * zombie.speed;
                    velocityY = (dy / distance) * zombie.speed;
                }
            }

            // If zombie gets stuck on obstacles, make it move vertically to get unstuck
            if (zombie.rerouteTime > 0) {
                zombie.body.setVelocityX(0);
                zombie.body.setVelocityY(zombie.rerouteDirection * zombie.speed);
                zombie.rerouteTime -= delta;
            } else {
                // Chase the player normally when not stuck
                zombie.body.setVelocityX(velocityX);

                if (Math.abs(zombie.body.velocity.x) < 5) {
                    zombie.body.setVelocityY(velocityY);
                } else {
                    zombie.body.setVelocityY(velocityY * 0.35);
                }

                // If the zombie is trying to move but barely moving, count it as stuck
                if (Math.abs(dx) > 20 && Math.abs(zombie.body.velocity.x) < 10) {
                    zombie.stuckTime += delta;
                } else {
                    zombie.stuckTime = 0;
                }

                // If stuck too long, switch to reroute mode
                if (zombie.stuckTime > 300) {
                    zombie.rerouteTime = 500;
                    zombie.rerouteDirection = Phaser.Math.Between(0, 1) ? 1 : -1;
                    zombie.stuckTime = 0;
                }
            }

            // Flip the zombie sprite based on movement direction
            if (zombie.body.velocity.x > 0) {
                zombie.setFlipX(false); // face right
            } else if (zombie.body.velocity.x < 0) {
                zombie.setFlipX(true); // face left
            }

            // Update zombie depth based on y-position
            zombie.setDepth(zombie.y);

            // Check if the zombie touches the player
            if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), zombie.getBounds())) {
                const dist = Phaser.Math.Distance.Between(
                    zombie.x, zombie.y,
                    this.player.x, this.player.y
                );

                // Make sure the zombie is actually close enough before dealing damage
                if (dist < 60) {
                    // Only apply damage if the hit cooldown has passed
                    if (time > this.lastHitTime) {
                        // Armor blocks one zombie hit before health is reduced.
                        if (this.hasArmor) {
                            this.hasArmor = false;
                            this.player.clearTint();
                            this.showPickupMessage('Armor absorbed hit');
                            this.lastHitTime = time + this.hitCooldown;
                            continue;
                        }

                        // Tank zombies are still dangerous, but they do not kill instantly anymore.
                        // This gives the player a fair chance to recover instead of losing from one touch.
                        if (zombie.isTankZombie) {
                            this.playerHealth -= 70; // tank hit removes two hearts
                        } else {
                            this.playerHealth -= 35; // normal hit removes one heart
                        }

                        // Update the hearts right after taking damage.
                        // This makes sure the last heart disappears before the game over screen shows.
                        const heartsAfterHit = Math.ceil(this.playerHealth / 35);

                        for (let h = 0; h < this.hearts.length; h++) {
                            if (h < heartsAfterHit) {
                                this.hearts[h].setFrame(this.heartFullFrame);
                                this.hearts[h].setVisible(true);
                                this.hearts[h].setScale(this.heartVisibleScale);
                            } else {
                                this.hearts[h].setVisible(false);
                            }
                        }

                        // Set cooldown so player doesn't take damage every frame
                        this.lastHitTime = time + this.hitCooldown;

                        // Flash player red and shake camera for hit feedback
                        this.playerHitTimer = 200;
                        this.player.setTint(0xff0000);

                        // Small camera shake to make the hit feel clearer
                        this.cameras.main.shake(120, 0.004);

                        // Check if the player's health has reached zero
                        if (this.playerHealth <= 0) {
                            this.playerHealth = 0;
                            const pointsNeededOnDeath = this.nextRankScore - this.score;
                            if (this.playerRank < this.maxRank) {
                                this.uiText.setText(
                                    'Score: ' + this.score +
                                    ' | Rank: ' + this.playerRank +
                                    ' | Need: ' + pointsNeededOnDeath
                                );
                            } else {
                                this.uiText.setText('Score: ' + this.score + ' | Rank: MAX');
                            }

                            // Stop player movement right away
                            this.player.body.setVelocity(0, 0);

                            console.log('Game Over');

                            // Use the same delayed game over flow for every death.
                            // Remove any old pending death event first.
                            this.deathPending = true;

                            if (this.deathEvent) {
                                this.deathEvent.remove(false);
                                this.deathEvent = null;
                            }

                            this.deathEvent = this.time.delayedCall(120, () => {
                                this.deathEvent = null;

                                if (!this.gameEnded) {
                                    this.deathPending = false;
                                    this.gameOver();
                                }
                            });
                            return;
                        }
                    }
                }
            }

            // Remove zombies if they somehow go too far outside the level
            if (zombie.x < -100 || zombie.x > this.levelWidth + 100) {
                zombie.destroy();
                this.zombies.splice(i, 1);
            }
        }
    }

    // Spitter zombie ranged attack.
    // Creates a slow red projectile that travels toward the player.
    shootSpit(zombie) {
        const dx = this.player.x - zombie.x;
        const dy = this.player.y - zombie.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= 0) {
            return;
        }

        const directionX = dx / distance;
        const directionY = dy / distance;
        const spitSpeed = 120;

        const spit = this.add.circle(zombie.x, zombie.y, 6, 0xff3333, 0.95);
        spit.setStrokeStyle(1, 0x000000);
        spit.setDepth(13);
        spit.velocityX = directionX * spitSpeed;
        spit.velocityY = directionY * spitSpeed;

        this.enemyProjectiles.push(spit);
    }

    // Create and fire a bullet toward the mouse cursor
    shootBullet() {
        // Get the current mouse position in world space so aiming still works with camera scrolling
        const mouseX = this.mouseWorldX;
        const mouseY = this.mouseWorldY;

        // Face the shooting direction before firing
        if (mouseX < this.player.x) {
            this.player.setFlipX(true);
        } else if (mouseX > this.player.x) {
            this.player.setFlipX(false);
        }

        // Work out the direction from the player to the mouse cursor
        const dx = mouseX - this.player.x;
        const dy = mouseY - this.player.y;

        // Get the distance to the mouse cursor
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Normalize the direction so the bullet always moves at the same speed
        let shootDirectionX = 0;
        let shootDirectionY = 0;

        if (distance > 0) {
            shootDirectionX = dx / distance;
            shootDirectionY = dy / distance;
        }

        // Spawn the bullet from the end of the gun so the shot lines up with the aiming visual.
        const bullet = this.add.rectangle(
            this.player.x + shootDirectionX * 30,
            this.player.y + 2 + shootDirectionY * 30,
            8,
            2,
            0xd4a017
        );
        
        // black outline so the bullet stands out more
        bullet.setStrokeStyle(1, 0x000000);
        // slightly lower alpha so it looks a bit softer
        bullet.setAlpha(0.9);
        // draw it above most objects
        bullet.setDepth(12);

        // Give the bullet velocity based on the aim direction
        bullet.velocityX = shootDirectionX * this.bulletSpeed;
        bullet.velocityY = shootDirectionY * this.bulletSpeed;

        // Rotate the bullet so it points in the direction it is traveling
        bullet.rotation = Math.atan2(shootDirectionY, shootDirectionX);

        // Store the bullet so it can be updated in the main update loop
        this.bullets.push(bullet);
    }

    // Create a zombie at the given position, with option for type (normal, tank, runner, spitter)
    spawnZombieAt(spawnX, spawnY, zombieType = 'normal') {
        let zombie;

        // Older spawn calls used true/false, so keep those working while adding named zombie types.
        if (zombieType === true) {
            zombieType = 'tank';
        } else if (zombieType === false) {
            zombieType = 'normal';
        }

        // Set default zombie stats first. These are used for normal zombies.
        let zombieKey = 'zombie_walk1';
        let zombieAnim = 'zombie1_walk';
        let baseHealth = 2;
        let baseSpeed = this.zombieSpeed;
        let scoreValue = 50;
        let zombieScale = 0.9;
        let isTankZombie = false;
        let isSpitter = false;

        // Tank zombie: slower, tougher, and worth more points.
        if (zombieType === 'tank') {
            zombieKey = 'zombie_walk2';
            zombieAnim = 'zombie2_walk';
            baseHealth = 5;
            baseSpeed = 35;
            scoreValue = 100;
            isTankZombie = true;
        }

        // Runner zombie: faster zombie for later levels.
        if (zombieType === 'runner') {
            zombieKey = 'zombie_walk3';
            zombieAnim = 'zombie3_walk';
            baseHealth = 2;
            baseSpeed = 125;
            scoreValue = 75;
            zombieScale = 0.82;
        }

        // Spitter zombie: Level 3 enemy that attacks from range.
        // It is not as tanky as the tank zombie, but it forces the player to keep moving.
        if (zombieType === 'spitter') {
            zombieKey = 'zombie_walk4';
            zombieAnim = 'zombie4_walk';
            baseHealth = 3;
            baseSpeed = 45;
            scoreValue = 120;
            zombieScale = 0.88;
            isSpitter = true;
        }

        zombie = this.add.sprite(spawnX, spawnY, zombieKey);
        zombie.setScale(zombieScale);
        zombie.setDepth(10);
        zombie.zombieType = zombieType;
        zombie.health = Math.ceil(baseHealth * this.zombieHealthMultiplier);
        zombie.speed = baseSpeed * this.zombieSpeedMultiplier;
        zombie.scoreValue = scoreValue;
        zombie.isTankZombie = isTankZombie;
        zombie.isSpitter = isSpitter;
        zombie.lastSpitTime = 0;
        zombie.spitCooldown = 3000;
        zombie.preferredDistance = 220;

        // Anti-stuck values to help zombies move around obstacles
        zombie.stuckTime = 0;
        zombie.rerouteTime = 0;
        zombie.rerouteDirection = 0;

        // Zombies stay inactive until the player gets close
        zombie.activeChase = false;

        // Start the walk animation right away
        if (!zombie.anims.isPlaying) {
            zombie.play(zombieAnim);
        }

        // Give the zombie a physics body so it can collide with level walls.
        this.physics.add.existing(zombie);
        zombie.body.setCollideWorldBounds(true);
        zombie.body.setAllowGravity(false);

        // Set the zombie hitbox size
        zombie.body.setSize(28, 40);
        zombie.body.setOffset(50, 44);

        // Let the zombie collide with the level walls and obstacles.
        if (this.labWallGroup) {
            this.physics.add.collider(zombie, this.labWallGroup);
        }

        // Store the zombie so it can be updated later
        this.zombies.push(zombie);

        // Return the zombie so other systems, like Survival Mode, can change its behavior after spawning.
        return zombie;
    }

    // Fire a shotgun spread using several pellets.
    // This gives the player a short-range burst weapon for crowded areas.
    shootShotgun() {
        const mouseX = this.mouseWorldX;
        const mouseY = this.mouseWorldY;

        if (mouseX < this.player.x) {
            this.player.setFlipX(true);
        } else if (mouseX > this.player.x) {
            this.player.setFlipX(false);
        }

        const dx = mouseX - this.player.x;
        const dy = mouseY - this.player.y;
        const baseAngle = Math.atan2(dy, dx);
        const pelletAngles = [-0.28, -0.14, 0, 0.14, 0.28];

        for (let i = 0; i < pelletAngles.length; i++) {
            const angle = baseAngle + pelletAngles[i];
            const directionX = Math.cos(angle);
            const directionY = Math.sin(angle);

            const pellet = this.add.rectangle(
                this.player.x + directionX * 30,
                this.player.y + 2 + directionY * 30,
                7,
                2,
                0xffcc66
            );

            pellet.setStrokeStyle(1, 0x000000);
            pellet.setAlpha(0.9);
            pellet.setDepth(12);
            pellet.velocityX = directionX * (this.bulletSpeed * 0.9);
            pellet.velocityY = directionY * (this.bulletSpeed * 0.9);
            pellet.rotation = angle;

            this.bullets.push(pellet);
        }
    }

    // Place zombies in different areas of the level based on section name
    spawnWave(sectionName) {
        // Place zombies in different parts of the level.

        if (sectionName === 'entrance') {
            this.spawnZombieAt(350, 140, false);
            this.spawnZombieAt(480, 260, false);
            this.spawnZombieAt(520, 180, false);
            this.spawnZombieAt(430, 210, false);
        }

        if (sectionName === 'armory') {
            this.spawnZombieAt(650, 260, false);
            this.spawnZombieAt(860, 260, false);
            this.spawnZombieAt(760, 120, true);
            this.spawnZombieAt(720, 300, false);
            this.spawnZombieAt(800, 200, false);
            this.spawnZombieAt(700, 180, false);
            this.spawnZombieAt(900, 180, false);
        }

        if (sectionName === 'corridor') {
            this.spawnZombieAt(1120, 120, false);
            this.spawnZombieAt(1260, 280, false);
            this.spawnZombieAt(1420, 120, false);
            this.spawnZombieAt(1580, 280, true);
            this.spawnZombieAt(1500, 200, false);
            this.spawnZombieAt(1350, 200, false);
            this.spawnZombieAt(1450, 260, false);
            this.spawnZombieAt(1600, 180, false);

            // Extra Level 2 pressure in the longer corridor.
            // Runners start showing up in Level 2 to make this level feel different.
            if (this.currentLevel === 2) {
                this.spawnZombieAt(1680, 130, 'runner');
                this.spawnZombieAt(1780, 280, false);
                this.spawnZombieAt(1880, 190, 'runner');
            }

            // Level 3 corridor adds early runner and spitter pressure.
            if (this.currentLevel === 3) {
                this.spawnZombieAt(1680, 130, 'runner');
                this.spawnZombieAt(1820, 280, false);
                this.spawnZombieAt(1980, 170, 'spitter');
                this.spawnZombieAt(2180, 260, 'runner');
                this.spawnZombieAt(2350, 140, true);
            }
        }

        if (sectionName === 'testchamber') {
            this.spawnZombieAt(1850, 300, false);
            this.spawnZombieAt(2000, 120, false);
            this.spawnZombieAt(2200, 300, false);
            this.spawnZombieAt(2380, 140, true);
            this.spawnZombieAt(2480, 280, false);
            this.spawnZombieAt(2100, 210, false);
            this.spawnZombieAt(2320, 220, false);
            this.spawnZombieAt(2250, 200, false);
            this.spawnZombieAt(2400, 220, false);
            this.spawnZombieAt(1950, 170, false);
            this.spawnZombieAt(2450, 180, true);

            // Extra Level 2 enemies before the power room.
            // This makes the player fight harder before reaching the objective.
            if (this.currentLevel === 2) {
                this.spawnZombieAt(2550, 130, 'runner');
                this.spawnZombieAt(2680, 280, false);
                this.spawnZombieAt(2820, 180, true);
                this.spawnZombieAt(2950, 240, 'runner');
            }

            // Level 3 terminal zones are defended by mixed enemy types.
            if (this.currentLevel === 3) {
                this.spawnZombieAt(2720, 140, 'runner');
                this.spawnZombieAt(2880, 285, 'spitter');
                this.spawnZombieAt(3060, 135, false);
                this.spawnZombieAt(3220, 275, 'runner');
                this.spawnZombieAt(3380, 170, true);

                this.spawnZombieAt(3920, 135, 'spitter');
                this.spawnZombieAt(4080, 285, 'runner');
                this.spawnZombieAt(4250, 160, false);
                this.spawnZombieAt(4420, 275, 'spitter');
                this.spawnZombieAt(4560, 180, true);
            }
        }

        if (sectionName === 'final') {
            this.spawnZombieAt(2760, 120, false);
            this.spawnZombieAt(2920, 300, false);
            this.spawnZombieAt(3080, 160, true);
            this.spawnZombieAt(3240, 300, false);
            this.spawnZombieAt(3380, 180, false);
            this.spawnZombieAt(3480, 280, true);
            this.spawnZombieAt(3320, 260, false);
            this.spawnZombieAt(2860, 200, false);
            this.spawnZombieAt(3000, 260, false);
            this.spawnZombieAt(3180, 200, false);
            this.spawnZombieAt(3420, 220, true);

            // Extra Level 2 enemies after the power switch.
            // This makes the unlocked exit route feel like a final push instead of empty space.
            if (this.currentLevel === 2) {
                this.spawnZombieAt(3500, 150, 'runner');
                this.spawnZombieAt(3620, 260, false);
                this.spawnZombieAt(3720, 130, 'runner');
                this.spawnZombieAt(3840, 280, 'runner');
                this.spawnZombieAt(3980, 170, false);
                this.spawnZombieAt(4100, 260, 'runner');
                this.spawnZombieAt(4200, 180, true);
                this.spawnZombieAt(4300, 280, 'runner');
            }

            // Level 3 final route uses all enemy types so the ending stays active.
            if (this.currentLevel === 3) {
                this.spawnZombieAt(4850, 150, 'runner');
                this.spawnZombieAt(5000, 285, false);
                this.spawnZombieAt(5150, 170, 'spitter');
                this.spawnZombieAt(5320, 260, 'runner');
                this.spawnZombieAt(5480, 145, true);
                this.spawnZombieAt(5620, 285, 'spitter');
                this.spawnZombieAt(5750, 180, 'runner');
            }
        }
    }

    // Sets up Survival Mode wave values.
    setupSurvivalMode() {
        this.survivalWave = 0;
        this.survivalStarted = false;
        this.survivalWaveActive = false;
        this.survivalNextWaveTimer = 0;
        this.survivalWaitingForStartZone = false;
        this.survivalStartZoneWidth = 95;
        this.survivalStartZoneHeight = 55;
        this.survivalARSpawned = false;
    }

    // Starts the next Survival Mode wave.
    startNextSurvivalWave() {
        this.survivalWave++;
        this.survivalWaveActive = true;
        this.survivalNextWaveTimer = 0;

        this.showPickupMessage('Wave ' + this.survivalWave + ' incoming');
        this.spawnSurvivalWave();
        this.spawnSurvivalPickupReward();

        // The AK appears as a survival reward after a few waves.
        if (this.survivalWave === 3 && !this.survivalARSpawned && !this.arPickup && this.currentWeapon !== 'ar') {
            this.survivalARSpawned = true;
            this.arPickup = this.add.image(1600, 105, 'akPickup');
            this.arPickup.setScale(0.02);
            this.arPickup.setDepth(10);
            this.arPickup.setAngle(-15);
            this.showPickupMessage('AK dropped in the arena');
        }
    }

    // Spawns enemies for the current Survival Mode wave.
    spawnSurvivalWave() {
        // Spawn away from the start zone so new waves do not feel unfair.
        const spawnPoints = [
            { x: 250, y: 90 },
            { x: 250, y: 300 },
            { x: 3350, y: 90 },
            { x: 3350, y: 300 },
            { x: 900, y: 70 },
            { x: 2700, y: 330 }
        ];

        // Increase survival pressure so early waves feel more active.
        // The zombie count scales faster now to keep the arena intense.
        const zombieCount = 6 + (this.survivalWave * 4);

        for (let i = 0; i < zombieCount; i++) {
            const spawnPoint = Phaser.Utils.Array.GetRandom(spawnPoints);
            let zombieType = 'normal';

            if (this.survivalWave >= 7 && Phaser.Math.Between(1, 100) <= 25) {
                zombieType = 'spitter';
            } else if (this.survivalWave >= 5 && Phaser.Math.Between(1, 100) <= 25) {
                zombieType = 'tank';
            } else if (this.survivalWave >= 3 && Phaser.Math.Between(1, 100) <= 40) {
                zombieType = 'runner';
            }

            const zombie = this.spawnZombieAt(spawnPoint.x, spawnPoint.y, zombieType);

            // Survival enemies should chase right away so the player does not have to search the map for them.
            if (zombie) {
                zombie.activeChase = true;
            }
        }
    }

    // Spawns a random pickup reward during Survival Mode.
    spawnSurvivalPickupReward() {
        const pickupChance = Math.min(90, 35 + (this.survivalWave * 8));

        if (Phaser.Math.Between(1, 100) > pickupChance) {
            return;
        }

        const pickupSpots = [
            { x: 1200, y: 125 },
            { x: 2000, y: 125 },
            { x: 1200, y: 275 },
            { x: 2000, y: 275 },
            { x: 1600, y: 200 }
        ];

        const pickupTypes = ['health', 'damage', 'shotgun', 'armor'];
        const spot = Phaser.Utils.Array.GetRandom(pickupSpots);
        const type = Phaser.Utils.Array.GetRandom(pickupTypes);

        this.createRandomPickup(spot.x, spot.y, type);
    }

    // Checks if the current Survival Mode wave is cleared.
    // After each wave, the player must return to the green start zone before the next wave begins.
    updateSurvivalMode(delta) {
        if (!this.survivalStarted) {
            return;
        }

        if (this.survivalWaveActive && this.zombies.length === 0) {
            this.survivalWaveActive = false;
            this.survivalWaitingForStartZone = true;
            this.showPickupMessage('Wave ' + this.survivalWave + ' cleared\nReturn to start zone');
        }

        if (!this.survivalWaveActive && this.survivalWaitingForStartZone) {
            const startX = this.playerStartX || 1800;
            const startY = (this.playerStartY || 200) - 22;

            const insideSafeZone =
                Math.abs(this.player.x - startX) <= this.survivalStartZoneWidth &&
                Math.abs(this.player.y - startY) <= this.survivalStartZoneHeight;

            if (insideSafeZone) {
                this.survivalWaitingForStartZone = false;
                this.startNextSurvivalWave();
            }
        }
    }

    // Level 3 terminal objective management
    updateTerminalObjective(delta) {
        if (!this.terminalA || !this.terminalB) return;

        const terminalABox = new Phaser.Geom.Rectangle(
            this.terminalA.x - 45,
            this.terminalA.y - 45,
            90,
            90
        );

        const terminalBBox = new Phaser.Geom.Rectangle(
            this.terminalB.x - 45,
            this.terminalB.y - 45,
            90,
            90
        );

        if (!this.terminalAActivated && Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), terminalABox)) {
            this.terminalAProgress += delta;

            // Spawn a small defense wave when Terminal A upload starts.
            if (!this.terminalASpawnedDefense) {
                this.terminalASpawnedDefense = true;
                this.spawnZombieAt(this.terminalA.x - 420, this.terminalA.y - 110, 'runner');
                this.spawnZombieAt(this.terminalA.x + 420, this.terminalA.y + 110, 'spitter');
                this.spawnZombieAt(this.terminalA.x + 520, this.terminalA.y - 100, false);
                this.showPickupMessage('Terminal A defense wave incoming');
            }

            const percentA = Math.min(100, Math.floor((this.terminalAProgress / this.terminalHoldRequired) * 100));
            this.showPickupMessage('Uploading Terminal A... ' + percentA + '%');

            if (this.terminalAProgress >= this.terminalHoldRequired) {
                this.terminalAActivated = true;
                this.terminalA.setFillStyle(0x00ff88);
                this.showPickupMessage('Terminal A activated');
            }
        }

        if (!this.terminalBActivated && Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), terminalBBox)) {
            this.terminalBProgress += delta;

            // Spawn a stronger defense wave when Terminal B upload starts.
            if (!this.terminalBSpawnedDefense) {
                this.terminalBSpawnedDefense = true;
                this.spawnZombieAt(this.terminalB.x - 470, this.terminalB.y + 110, 'runner');
                this.spawnZombieAt(this.terminalB.x + 420, this.terminalB.y - 110, 'spitter');
                this.spawnZombieAt(this.terminalB.x + 520, this.terminalB.y + 100, true);
                this.spawnZombieAt(this.terminalB.x - 570, this.terminalB.y - 100, false);
                this.showPickupMessage('Terminal B defense wave incoming');
            }

            const percentB = Math.min(100, Math.floor((this.terminalBProgress / this.terminalHoldRequired) * 100));
            this.showPickupMessage('Uploading Terminal B... ' + percentB + '%');

            if (this.terminalBProgress >= this.terminalHoldRequired) {
                this.terminalBActivated = true;
                this.terminalB.setFillStyle(0x00ff88);
                this.showPickupMessage('Terminal B activated');
            }
        }

        if (!this.level3ExitUnlocked && this.terminalAActivated && this.terminalBActivated) {
            this.level3ExitUnlocked = true;
            this.showPickupMessage('Both terminals active\nExit unlocked');
        }
    }

    // Handle player death - stop gameplay and show game over screen
    gameOver() {
        // Stop gameplay and show the game over message
        this.isPaused = true;
        this.gameEnded = true;
        this.deathPending = false;

        if (this.deathEvent) {
            this.deathEvent.remove(false);
            this.deathEvent = null;
        }

        this.pauseText.setVisible(false);
        this.winText.setVisible(false);
        this.pickupText.setVisible(false);

        // Clear the crosshair once the game is over so it does not sit on top of the game over screen.
        if (this.aimMarker) {
            this.aimMarker.clear();
        }

        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            this.enemyProjectiles[i].destroy();
        }
        this.enemyProjectiles = [];

        this.gameOverText.setVisible(true);
        if (this.currentMode === 'survival') {
            // Save the best Survival Mode result so the Mode Select screen can show it later.
            this.saveSurvivalStats();

            this.gameOverText.setText(
                'SURVIVAL OVER\n' +
                'Wave Reached: ' + this.survivalWave + '\n' +
                'Score: ' + this.score + '\n' +
                'Press R to Restart\n' +
                'Press H for Menu'
            );
        } else {
            this.gameOverText.setText('GAME OVER\nPress R to Restart\nPress H for Menu');
        }
        this.gameOverText.setPosition(this.scale.width / 2, 200);
        this.gameOverText.setDepth(1000);
    }

    // Handle level completion - stop gameplay and show win screen
    winGame() {
        // Stop gameplay and show the win message
        this.isPaused = true;
        this.gameEnded = true;
        this.levelCompleted = true;
        if (this.deathEvent) {
            this.deathEvent.remove(false);
            this.deathEvent = null;
        }
        this.pauseText.setVisible(false);

        // Clear the crosshair once the player wins so the win screen stays clean.
        if (this.aimMarker) {
            this.aimMarker.clear();
        }

        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            this.enemyProjectiles[i].destroy();
        }
        this.enemyProjectiles = [];

        if (this.gameOverText) {
            this.gameOverText.setVisible(false);
        }

        if (this.currentLevel === 1 && this.unlockedLevel < 2) {
            this.unlockedLevel = 2;
            this.saveProgress();
        }

        if (this.currentLevel === 2 && this.unlockedLevel < 3) {
            this.unlockedLevel = 3;
            this.saveProgress();
        }

        // Set the win text when the player actually finishes the level
        if (this.currentLevel === 1) {
            this.winText.setText('LEVEL 1 COMPLETE!\nPress N for Level 2\nPress R to Restart\nPress H for Menu');
        } else if (this.currentLevel === 2) {
            this.winText.setText('LEVEL 2 COMPLETE!\nPress N for Level 3\nPress R to Restart\nPress H for Menu');
        } else {
            this.winText.setText('YOU ESCAPED!\nPress R to Restart\nPress H for Menu');
        }

        this.winText.setVisible(true);
    }

    // Checks if the player has enough score to rank up.
    // Every rank makes the player stronger and also makes zombies harder.
    checkRankUp() {
        while (this.score >= this.nextRankScore && this.playerRank < this.maxRank) {
            this.playerRank++;
            this.nextRankScore += 1000;

            this.rankFireRateBonus += 20;
            this.zombieHealthMultiplier += 0.5;
            this.zombieSpeedMultiplier += 0.08;

            if (this.playerRank >= 3) {
                this.baseBulletDamage = 2;

                if (!this.damageBoostActive) {
                    this.bulletDamage = this.baseBulletDamage;
                }
            }

            let unlockMessage = 'Faster shooting unlocked';

            if (this.playerRank >= 3) {
                unlockMessage = 'Damage increase unlocked';
            }

            this.showPickupMessage('RANK UP!\nRank ' + this.playerRank + '\n' + unlockMessage);
            this.cameras.main.shake(180, 0.004);

            this.saveProgress();
        }
    }

    // Saves the player's rank progress in the browser.
    saveProgress() {
        const progress = {
            playerRank: this.playerRank,
            nextRankScore: this.nextRankScore,
            baseBulletDamage: this.baseBulletDamage,
            rankFireRateBonus: this.rankFireRateBonus,
            zombieHealthMultiplier: this.zombieHealthMultiplier,
            zombieSpeedMultiplier: this.zombieSpeedMultiplier,
            unlockedLevel: this.unlockedLevel || 1
        };

        localStorage.setItem('subjectZeroProgress', JSON.stringify(progress));
    }

    // Saves the player's best Survival Mode wave and score.
    // This is shown later on the Mode Select screen.
    saveSurvivalStats() {
        const savedStats = localStorage.getItem('subjectZeroSurvivalStats');
        let bestWave = 0;
        let bestScore = 0;

        if (savedStats) {
            const stats = JSON.parse(savedStats);
            bestWave = stats.bestWave || 0;
            bestScore = stats.bestScore || 0;
        }

        if (this.survivalWave > bestWave) {
            bestWave = this.survivalWave;
        }

        if (this.score > bestScore) {
            bestScore = this.score;
        }

        const newStats = {
            bestWave: bestWave,
            bestScore: bestScore
        };

        localStorage.setItem('subjectZeroSurvivalStats', JSON.stringify(newStats));
    }

    // Loads saved rank progress from the browser if it exists.
    loadProgress() {
        const savedProgress = localStorage.getItem('subjectZeroProgress');

        if (savedProgress) {
            const progress = JSON.parse(savedProgress);

            this.playerRank = progress.playerRank || 1;
            this.nextRankScore = progress.nextRankScore || 1000;
            this.baseBulletDamage = progress.baseBulletDamage || 1;
            this.rankFireRateBonus = progress.rankFireRateBonus || 0;
            this.zombieHealthMultiplier = progress.zombieHealthMultiplier || 1;
            this.zombieSpeedMultiplier = progress.zombieSpeedMultiplier || 1;
            this.unlockedLevel = progress.unlockedLevel || 1;
        }
    }

    // Resets saved rank progress for testing.
    // This clears localStorage and puts the player back to the starting rank values.
    resetProgress() {
        localStorage.removeItem('subjectZeroProgress');

        this.playerRank = 1;
        this.nextRankScore = 1000;
        this.baseBulletDamage = 1;
        this.rankFireRateBonus = 0;
        this.zombieHealthMultiplier = 1;
        this.zombieSpeedMultiplier = 1;
        this.unlockedLevel = 1;
        this.bulletDamage = this.baseBulletDamage;
        this.saveProgress();

        this.showPickupMessage('Rank progress reset\nBack to Rank 1');
    }

    // Creates randomized non-AR pickups for Level 2 and Level 3.
    // The AR always stays guaranteed, but these pickups change each run.
    spawnRandomPickupsForLevel() {
        let pickupSpots = [];

        if (this.currentLevel === 2) {
            pickupSpots = [
                { x: 3150, y: 115 },
                { x: 3500, y: 285 },
                { x: 4050, y: 110 },
                { x: 4550, y: 280 }
            ];
        } else if (this.currentLevel === 3) {
            pickupSpots = [
                { x: 2600, y: 115 },
                { x: 3650, y: 280 },
                { x: 4700, y: 200 },
                { x: 5450, y: 115 }
            ];
        }

        const pickupTypes = ['health', 'damage', 'shotgun', 'armor'];

        for (let i = 0; i < pickupSpots.length; i++) {
            // 70 percent chance that a pickup appears at this spot.
            if (Phaser.Math.Between(1, 100) <= 70) {
                const randomType = Phaser.Utils.Array.GetRandom(pickupTypes);
                this.createRandomPickup(pickupSpots[i].x, pickupSpots[i].y, randomType);
            }
        }
    }

    // Creates one random pickup image at the selected location.
    createRandomPickup(x, y, pickupType) {
        let pickup;

        if (pickupType === 'health') {
            pickup = this.add.image(x, y, 'hearts', this.heartFullFrame);
            pickup.setScale(2.1);
        } else if (pickupType === 'damage') {
            pickup = this.add.image(x, y, 'damageBoostPickup');
            pickup.setScale(0.02);
            pickup.setAngle(20);
        } else if (pickupType === 'shotgun') {
            pickup = this.add.image(x, y, 'shotgunPickup');
            pickup.setScale(0.01);
            pickup.setAngle(-12);
        } else if (pickupType === 'armor') {
            pickup = this.add.image(x, y, 'armorPickup');
            pickup.setScale(0.02);
        }

        if (!pickup) {
            return;
        }

        pickup.pickupType = pickupType;
        pickup.setDepth(10);

        this.tweens.add({
            targets: pickup,
            y: y - 8,
            duration: 850,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.randomPickups.push(pickup);
    }

    // Applies the effect when the player collects a randomized pickup.
    collectRandomPickup(pickup) {
        if (pickup.pickupType === 'health') {
            this.playerHealth += 35;

            if (this.playerHealth > 105) {
                this.playerHealth = 105;
            }

            this.showPickupMessage('Health Restored');
        } else if (pickup.pickupType === 'damage') {
            this.bulletDamage = this.baseBulletDamage + 1;
            this.damageBoostTimer = 6000;
            this.showPickupMessage('Boost On');
        } else if (pickup.pickupType === 'shotgun') {
            if (this.currentWeapon !== 'shotgun') {
                this.previousWeaponBeforeShotgun = this.currentWeapon;
            }

            this.currentWeapon = 'shotgun';
            this.shotgunTimer = 12000;
            this.showPickupMessage('Shotgun Equipped\nSpread shots for 12 seconds');
        } else if (pickup.pickupType === 'armor') {
            this.hasArmor = true;
            this.playerHitTimer = 0;
            this.player.setTint(0xaaddff);
            this.showPickupMessage('Armor Equipped\nBlocks next hit');
        }

        pickup.destroy();
    }

    // Display a temporary message in the middle of the screen for pickups/status
    showPickupMessage(message) {
        this.pickupText.setText(message);
        this.pickupText.setX(this.scale.width / 2);
        this.pickupText.setFixedSize(this.scale.width, 0);
        this.pickupText.setAlign('center');
        this.pickupText.setOrigin(0.5, 0.5);
        this.pickupText.setVisible(true);
        this.pickupMessageTimer = 2000;
    }
}

