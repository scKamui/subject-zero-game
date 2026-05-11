/*
 survivalArena.js

 This file sets up the Survival Mode arena for Subject Zero.
 It reuses the darker Level 3 visual style, but removes story objectives and creates a contained combat arena for endless waves.
*/

export function createSurvivalArena(scene) {
    // Set the background color for the level
    scene.cameras.main.setBackgroundColor('#0d141c');

    // Survival Mode uses a smaller arena than story levels.
    scene.levelWidth = 3600;
    scene.levelFloor = scene.add.rectangle(1800, 200, 3600, 400, 0x1b2633);
    scene.levelFloor.setDepth(-5);

    // Arena sections. These create visual zones without story objectives.
    scene.leftArenaArea = scene.add.rectangle(600, 200, 1200, 360, 0x223140, 0.96);
    scene.leftArenaArea.setDepth(-4);

    scene.centerArenaArea = scene.add.rectangle(1800, 200, 1200, 360, 0x1f2d38, 0.96);
    scene.centerArenaArea.setDepth(-4);

    scene.rightArenaArea = scene.add.rectangle(3000, 200, 1200, 360, 0x2b3742, 0.96);
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

    // Creates a stack of crates with one simple collision box.
    const createCrateStack = (x, y) => {
        createSolidObject(x, y, 130, 65, 0x3e4650, -1);

        const crateColors = [0x8b5a2b, 0x9a6a35, 0x6f4a28];
        scene.add.rectangle(x - 35, y - 8, 48, 38, crateColors[0]).setStrokeStyle(2, 0x2a1b0f).setDepth(3);
        scene.add.rectangle(x + 18, y - 8, 48, 38, crateColors[1]).setStrokeStyle(2, 0x2a1b0f).setDepth(3);
        scene.add.rectangle(x - 8, y + 20, 58, 28, crateColors[2]).setStrokeStyle(2, 0x2a1b0f).setDepth(3);

        // Small plank lines on the crates.
        scene.add.rectangle(x - 35, y - 8, 3, 36, 0x2a1b0f).setDepth(4);
        scene.add.rectangle(x + 18, y - 8, 3, 36, 0x2a1b0f).setDepth(4);
        scene.add.rectangle(x - 8, y + 20, 56, 3, 0x2a1b0f).setDepth(4);
    };

    // Creates a small group of barrels with one collision box.
    const createBarrelCluster = (x, y) => {
        createSolidObject(x, y, 130, 65, 0x3e4650, -1);

        const barrelData = [
            { x: x - 35, y: y - 5, color: 0x8f2d2d },
            { x: x, y: y + 4, color: 0x2d5f8f },
            { x: x + 35, y: y - 5, color: 0x6b6f75 }
        ];

        for (let i = 0; i < barrelData.length; i++) {
            const barrel = barrelData[i];
            scene.add.ellipse(barrel.x, barrel.y, 30, 42, barrel.color).setStrokeStyle(2, 0x111111).setDepth(3);
            scene.add.rectangle(barrel.x, barrel.y - 8, 24, 3, 0x111111).setDepth(4);
            scene.add.rectangle(barrel.x, barrel.y + 8, 24, 3, 0x111111).setDepth(4);
        }
    };

    // Creates a broken wall/barricade shape with detail pieces.
    const createBrokenWall = (x, y, direction) => {
        if (direction === 'vertical') {
            createSolidObject(x, y, 90, 90, 0x3e4650, -1);
            scene.add.rectangle(x - 18, y, 22, 78, 0x6f6575).setStrokeStyle(2, 0x1a1f26).setDepth(3);
            scene.add.rectangle(x + 18, y - 12, 22, 55, 0x6f6575).setStrokeStyle(2, 0x1a1f26).setDepth(3);
            scene.add.rectangle(x + 20, y + 26, 34, 16, 0x4b5360).setStrokeStyle(2, 0x1a1f26).setDepth(3);
        } else {
            createSolidObject(x, y, 90, 90, 0x3e4650, -1);
            scene.add.rectangle(x, y - 20, 78, 22, 0x6f6575).setStrokeStyle(2, 0x1a1f26).setDepth(3);
            scene.add.rectangle(x - 12, y + 18, 55, 22, 0x6f6575).setStrokeStyle(2, 0x1a1f26).setDepth(3);
            scene.add.rectangle(x + 28, y + 18, 16, 34, 0x4b5360).setStrokeStyle(2, 0x1a1f26).setDepth(3);
        }
    };

    // Creates a supply table/desk with small objects on top.
    const createSupplyTable = (x, y) => {
        createSolidObject(x, y, 120, 70, 0x3e4650, -1);
        scene.add.rectangle(x, y, 112, 48, 0x7a5533).setStrokeStyle(2, 0x2a1b0f).setDepth(3);
        scene.add.rectangle(x - 38, y + 28, 10, 22, 0x2a1b0f).setDepth(4);
        scene.add.rectangle(x + 38, y + 28, 10, 22, 0x2a1b0f).setDepth(4);
        scene.add.rectangle(x - 25, y - 8, 28, 16, 0x9aa6b2).setStrokeStyle(1, 0x111111).setDepth(4);
        scene.add.circle(x + 24, y - 5, 9, 0xffdd33).setStrokeStyle(1, 0x111111).setDepth(4);
    };

    // Creates a medical station crate to visually explain health/supplies.
    const createMedicalStation = (x, y) => {
        createSolidObject(x, y, 150, 70, 0x3e4650, -1);
        scene.add.rectangle(x, y, 120, 45, 0xd9d9d9).setStrokeStyle(2, 0x222222).setDepth(3);
        scene.add.rectangle(x, y, 16, 34, 0xff3333).setDepth(4);
        scene.add.rectangle(x, y, 42, 12, 0xff3333).setDepth(4);
        scene.add.rectangle(x - 58, y + 24, 18, 18, 0x7a5533).setStrokeStyle(1, 0x2a1b0f).setDepth(4);
        scene.add.rectangle(x + 58, y + 24, 18, 18, 0x7a5533).setStrokeStyle(1, 0x2a1b0f).setDepth(4);
    };

    // Creates a generator unit with a warning light.
    const createGeneratorUnit = (x, y) => {
        createSolidObject(x, y, 120, 70, 0x3e4650, -1);
        scene.add.rectangle(x, y, 100, 52, 0x27313a).setStrokeStyle(2, 0x91a1ad).setDepth(3);
        scene.add.rectangle(x - 22, y - 8, 32, 18, 0xffdd33).setStrokeStyle(1, 0x111111).setDepth(4);
        scene.add.circle(x + 30, y - 10, 7, 0xff3333).setStrokeStyle(1, 0x111111).setDepth(4);
        scene.add.rectangle(x + 22, y + 16, 44, 6, 0x111111).setDepth(4);
        scene.add.rectangle(x + 22, y + 2, 44, 6, 0x111111).setDepth(4);
    };

    // Creates a pipe barrier instead of a plain thin rectangle.
    const createPipeBarrier = (x, y) => {
        createSolidObject(x, y, 24, 120, 0x3e4650, -1);
        scene.add.rectangle(x - 5, y, 8, 110, 0x7b6c82).setStrokeStyle(1, 0x1a1f26).setDepth(3);
        scene.add.rectangle(x + 7, y, 8, 110, 0x9aa6b2).setStrokeStyle(1, 0x1a1f26).setDepth(3);
        scene.add.circle(x + 1, y - 48, 8, 0x4b5360).setStrokeStyle(1, 0x1a1f26).setDepth(4);
        scene.add.circle(x + 1, y + 48, 8, 0x4b5360).setStrokeStyle(1, 0x1a1f26).setDepth(4);
    };

    // Top, bottom, left, and right boundaries for the survival arena.
    createSolidObject(1800, 18, 3600, 20, 0x6f6575, -2);
    createSolidObject(1800, 372, 3600, 40, 0x6f6575, -2);
    createSolidObject(15, 200, 30, 360, 0x6f6575, -2);
    createSolidObject(3585, 200, 30, 360, 0x6f6575, -2);

    // Left side cover.
    // These are still simple collision objects, but the visual details make them look like real barricades.
    createCrateStack(520, 120);
    createBarrelCluster(760, 285);
    createBrokenWall(1000, 170, 'vertical');

    // Center cover. The middle stays open enough for movement, but has objects to break up enemy paths.
    createSupplyTable(1450, 135);
    createMedicalStation(1800, 280);
    createGeneratorUnit(2150, 135);

    // Right side cover.
    createBrokenWall(2600, 170, 'horizontal');
    createBarrelCluster(2840, 285);
    createCrateStack(3080, 120);

    // Small lane dividers to create lanes without trapping the player.
    createPipeBarrier(1250, 220);
    createPipeBarrier(2350, 180);

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