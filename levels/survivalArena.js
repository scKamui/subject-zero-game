/*
 survivalArena.js

 This file sets up the Survival Mode arena for Subject Zero.
 It reuses the darker Level 3 visual style, but removes story objectives and creates a contained combat arena for endless waves.
*/

export function createSurvivalArena(scene) {
    // Set the background color for the level
    scene.cameras.main.setBackgroundColor('#151019');

    // Survival Mode uses a smaller arena than story levels.
    scene.levelWidth = 3600;
    scene.levelFloor = scene.add.rectangle(1800, 200, 3600, 400, 0x241923);
    scene.levelFloor.setDepth(-5);

    // Arena sections. These create visual zones without story objectives.
    scene.leftArenaArea = scene.add.rectangle(600, 200, 1200, 360, 0x342536, 0.96);
    scene.leftArenaArea.setDepth(-4);

    scene.centerArenaArea = scene.add.rectangle(1800, 200, 1200, 360, 0x2f2638, 0.96);
    scene.centerArenaArea.setDepth(-4);

    scene.rightArenaArea = scene.add.rectangle(3000, 200, 1200, 360, 0x422d34, 0.96);
    scene.rightArenaArea.setDepth(-4);

    // Survival does not use an exit zone.
    scene.exitZone = null;
    scene.exitLabel = null;

    // Store all walls so we can use them for collisions
    scene.labWalls = [];
    scene.labWallGroup = scene.physics.add.staticGroup();

    // Helper function to create walls/obstacles
    const createSolidObject = (x, y, width, height, color, depth) => {
        const object = scene.add.rectangle(x, y, width, height, color);
        object.setDepth(depth);
        object.setStrokeStyle(2, 0x1a1f26);
        object.setAlpha(0.97);

        scene.physics.add.existing(object, true);

        // Make sure the physics body matches the rectangle size
        object.body.updateFromGameObject();

        scene.labWallGroup.add(object);
        scene.labWalls.push(object);

        return object;
    };

    // Top, bottom, left, and right boundaries for the survival arena.
    createSolidObject(1800, 18, 3600, 20, 0x6f6575, -2);
    createSolidObject(1800, 372, 3600, 40, 0x6f6575, -2);
    createSolidObject(15, 200, 30, 360, 0x6f6575, -2);
    createSolidObject(3585, 200, 30, 360, 0x6f6575, -2);

    // Left side cover.
    createSolidObject(520, 120, 130, 65, 0x7d3f4b, -1);
    createSolidObject(760, 285, 130, 65, 0x5c5162, -1);
    createSolidObject(1000, 170, 90, 90, 0x4f4656, -1);

    // Center cover. The middle stays open enough for movement, but has objects to break up enemy paths.
    createSolidObject(1450, 135, 120, 70, 0x9a4754, -1);
    createSolidObject(1800, 280, 150, 70, 0x4f4656, -1);
    createSolidObject(2150, 135, 120, 70, 0x9a4754, -1);

    // Right side cover.
    createSolidObject(2600, 170, 90, 90, 0x4f4656, -1);
    createSolidObject(2840, 285, 130, 65, 0x5c5162, -1);
    createSolidObject(3080, 120, 130, 65, 0x7d3f4b, -1);

    // Small vertical wall pieces to create lanes without trapping the player.
    createSolidObject(1250, 220, 24, 120, 0x7b6c82, -2);
    createSolidObject(2350, 180, 24, 120, 0x7b6c82, -2);

    // Survival Mode does not use terminals or power objectives.
    scene.powerSwitch = null;
    scene.powerRestored = true;
    scene.terminalA = null;
    scene.terminalB = null;

    // Survival starts without guaranteed pickups.
    // Pickups and the AK are spawned by GameScene during waves.
    scene.arPickup = null;
    scene.healthPickup = null;
    scene.damagePickup = null;

    // Player starts near the center of the survival arena.
    scene.playerStartX = 1800;
    scene.playerStartY = 200;

    // Survival safe zone platform.
    // Player returns here between waves to safely start the next round.
    const safeZoneX = scene.playerStartX;
    const safeZoneY = scene.playerStartY - 22;

    // Main floor platform.
    scene.survivalStartZone = scene.add.rectangle(
        safeZoneX,
        safeZoneY,
        190,
        110,
        0x2f3e46,
        0.9
    );
    scene.survivalStartZone.setStrokeStyle(4, 0x00ff88, 0.9);
    scene.survivalStartZone.setDepth(8);

    // Inner glowing panel.
    scene.survivalStartZoneInner = scene.add.rectangle(
        safeZoneX,
        safeZoneY,
        150,
        72,
        0x1f6f78,
        0.45
    );
    scene.survivalStartZoneInner.setStrokeStyle(2, 0x00ffcc, 0.8);
    scene.survivalStartZoneInner.setDepth(9);

    // Corner lights to make the zone feel more like a sci-fi checkpoint.
    const cornerOffsets = [
        [-82, -42],
        [82, -42],
        [-82, 42],
        [82, 42]
    ];

    scene.safeZoneLights = [];

    for (let i = 0; i < cornerOffsets.length; i++) {
        const light = scene.add.circle(
            safeZoneX + cornerOffsets[i][0],
            safeZoneY + cornerOffsets[i][1],
            5,
            0x00ff88,
            1
        );

        light.setDepth(10);
        scene.safeZoneLights.push(light);
    }

    // Floating label above the safe zone.
    scene.safeZoneLabel = scene.add.text(
        safeZoneX,
        safeZoneY - 78,
        'SAFE ZONE',
        {
            fontSize: '18px',
            fill: '#66ffcc',
            fontStyle: 'bold'
        }
    ).setOrigin(0.5);

    scene.safeZoneLabel.setDepth(10);
}