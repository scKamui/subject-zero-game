import createLevel1 from '../levels/level1.js';
export default class GameScene extends Phaser.Scene {

    // Basic setup for the game scene
    constructor() {
        super('GameScene');
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

        // Make the level wider than the screen so the camera can scroll sideways
        this.physics.world.setBounds(0, 0, 3600, 400);

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

        // R restarts the level, H returns to the home screen, and Enter dismisses the level briefing
        this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.homeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        // Keep track of the current level in case more levels are added later
        this.currentLevel = 1;

        // Player movement speed
        this.playerSpeed = 150;

        // Build the current level layout using the separate Level 1 file
        createLevel1(this);
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

        // Place all zombies at the start.
        // They only begin chasing when the player gets close.
        this.spawnWave('entrance');
        this.spawnWave('armory');
        this.spawnWave('corridor');
        this.spawnWave('testchamber');
        this.spawnWave('final');

        // Score starts at 0
        this.score = 0;

        // Only show the score in the top HUD.
        // Pickup messages will show in the middle for a short time.
        this.uiText = this.add.text(16, 16, 'Score: 0', {
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
            const heart = this.add.image(30 + i * 32, 58, 'hearts', this.heartFullFrame);
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
        // Keep the same position and pickup behavior.
        if (this.healthPickup) {
            const pickupX = this.healthPickup.x;
            const pickupY = this.healthPickup.y;
            this.healthPickup.destroy();
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
        }

        // Replace the placeholder damage boost pickup with the PNG version.
        // Keep the same position and pickup behavior.
        if (this.damagePickup) {
            const pickupX = this.damagePickup.x;
            const pickupY = this.damagePickup.y;
            this.damagePickup.destroy();
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
                    this.shootBullet();
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
        this.bulletDamage = 1;

        // Timer for the temporary damage boost
        this.damageBoostTimer = 0;

        // Keep track of whether the damage boost is active
        this.damageBoostActive = false;

        // Timer for pickup/status text shown in the middle of the screen
        this.pickupMessageTimer = 0;

        // Keep track of whether the game is paused
        this.isPaused = false;

        // Keep track of whether the game has ended
        this.gameEnded = false;
        this.deathPending = false;
        this.deathEvent = null;

        // Make the camera follow the player through the level
        this.cameras.main.setBounds(0, 0, 3600, 400);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

        // Pause message shown in the middle of the screen
        this.pauseText = this.add.text(this.scale.width / 2, 200, 'PAUSED\nPress P to Resume', {
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
        this.winText = this.add.text(this.scale.width / 2, 200, 'YOU ESCAPED!\nPress R to Restart\nPress H for Home', {
            fontSize: '36px',
            fill: '#00ff00',
            align: 'center'
        }).setOrigin(0.5, 0.5);
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

        this.levelIntroTitle = this.add.text(this.scale.width / 2, 75, 'LEVEL 1 BRIEFING', {
            fontSize: '34px',
            fill: '#ffff66',
            align: 'center'
        }).setOrigin(0.5, 0.5);
        this.levelIntroTitle.setScrollFactor(0);
        this.levelIntroTitle.setDepth(1101);

        this.levelIntroText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 + 8,
            'Goal: survive and reach the exit.\n\n' +
            'Move: WASD or Arrow Keys\n' +
            'Aim: Mouse Cursor\n' +
            'Shoot: Left Click or Spacebar\n\n' +
            'Health packs restore one heart.\n' +
            'Damage boosts increase bullet damage briefly.\n\n' +
            'AIM FOR THE HEAD.\n\n' +
            'Beware of tank zombies — they are slow, tough, and deal heavy damage.\n\n' +
            'Press ENTER when you are ready.',
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
            if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
                if (this.deathEvent) {
                    this.deathEvent.remove(false);
                    this.deathEvent = null;
                }
                this.scene.restart();
            }

            if (Phaser.Input.Keyboard.JustDown(this.homeKey)) {
                if (this.deathEvent) {
                    this.deathEvent.remove(false);
                    this.deathEvent = null;
                }
                this.scene.start('StartScene');
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
            }
            return;
        }

        // Press P to pause or unpause the game
        if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
            this.isPaused = !this.isPaused;
            this.pauseText.setVisible(this.isPaused);
        }

        // Stop gameplay updates while paused
        if (this.isPaused) {
            return;
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
        if (this.currentWeapon === 'pistol') {
            this.fireRate = 250;
        } else if (this.currentWeapon === 'ar') {
            this.fireRate = 100;
        }

        // Shooting works differently depending on the weapon.
        // Pistol fires one shot at a time, while the AR can be held down.
        if (this.currentWeapon === 'pistol') {
            if (Phaser.Input.Keyboard.JustDown(this.shootKey) && time > this.lastFired) {
                this.shootBullet();
                this.lastFired = time + this.fireRate;
            }
        } else if (this.currentWeapon === 'ar') {
            // AR keeps firing while spacebar or the mouse button is held
            if ((this.shootKey.isDown || this.input.activePointer.isDown) && time > this.lastFired) {
                this.shootBullet();
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
            if (bullet.x < -50 || bullet.x > 3650 || bullet.y < -50 || bullet.y > 450) {
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

                        // Add to the score when a zombie is defeated
                        this.score += 10;
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

        // Keep the player red for a brief moment after taking damage
        if (this.playerHitTimer > 0) {
            this.playerHitTimer -= delta;
            this.player.setTint(0xff0000);
        } else {
            // Return the player to normal color after the hit flash ends
            this.player.clearTint();
        }

        // Count down the damage boost timer and reset damage when it ends
        if (this.damageBoostTimer > 0) {
            this.damageBoostTimer -= delta;
            this.damageBoostActive = true;

            if (this.damageBoostTimer <= 0) {
                this.bulletDamage = 1;
                this.damageBoostTimer = 0;
                this.damageBoostActive = false;
                this.showPickupMessage('Boost Off');
            }
        } else {
            this.damageBoostActive = false;
        }

        // Hide pickup/status text after about 2 seconds
        if (this.pickupMessageTimer > 0) {
            this.pickupMessageTimer -= delta;

            if (this.pickupMessageTimer <= 0) {
                this.pickupMessageTimer = 0;
                this.pickupText.setVisible(false);
            }
        }

        // Only show the score in the top HUD
        this.uiText.setText('Score: ' + this.score);

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
                this.bulletDamage = 2;
                this.damageBoostTimer = 6000; // 6 seconds
                this.showPickupMessage('Boost On');

                // Remove the pickup after collecting it
                this.damagePickup.destroy();
                this.damagePickup = null;
            }
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
                this.winGame();
                return;
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

            // Only chase once activated
            if (zombie.activeChase && distance > 0) {
                velocityX = (dx / distance) * zombie.speed;
                velocityY = (dy / distance) * zombie.speed;
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
                            this.uiText.setText('Score: ' + this.score);

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
            if (zombie.x < -100 || zombie.x > 3700) {
                zombie.destroy();
                this.zombies.splice(i, 1);
            }
        }
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

    // Create a zombie at the given position, with option for big tank zombie
    spawnZombieAt(spawnX, spawnY, isBigZombie = false) {
        let zombie;

        // Use different visuals so the player can tell zombie types apart
        let zombieKey;
        let zombieAnim;

        if (isBigZombie) {
            // Tank zombie
            zombieKey = 'zombie_walk2';
            zombieAnim = 'zombie2_walk';
        } else {
            // Normal zombie
            zombieKey = 'zombie_walk1';
            zombieAnim = 'zombie1_walk';
        }

        if (isBigZombie) {
            // Create a bigger zombie that moves slower
            zombie = this.add.sprite(spawnX, spawnY, zombieKey);
            zombie.setScale(0.9); 
            zombie.setDepth(10);
            zombie.health = 5;
            zombie.speed = 35;
            zombie.isTankZombie = true; // used later so tank damage is handled separately
        } else {
            // Create a normal zombie
            zombie = this.add.sprite(spawnX, spawnY, zombieKey);
            zombie.setScale(0.9); // Slightly smaller zombie size for better fit
            zombie.setDepth(10);
            zombie.health = 1;
            zombie.speed = this.zombieSpeed;
            zombie.isTankZombie = false; // used later so normal zombies only remove one heart
        }

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

        this.gameOverText.setVisible(true);
        this.gameOverText.setText('GAME OVER\nPress R to Restart\nPress H for Home');
        this.gameOverText.setPosition(this.scale.width / 2, 200);
        this.gameOverText.setDepth(1000);
    }

    // Handle level completion - stop gameplay and show win screen
    winGame() {
        // Stop gameplay and show the win message
        this.isPaused = true;
        this.gameEnded = true;
        if (this.deathEvent) {
            this.deathEvent.remove(false);
            this.deathEvent = null;
        }
        this.pauseText.setVisible(false);

        // Clear the crosshair once the player wins so the win screen stays clean.
        if (this.aimMarker) {
            this.aimMarker.clear();
        }

        if (this.gameOverText) {
            this.gameOverText.setVisible(false);
        }

        this.winText.setVisible(true);
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