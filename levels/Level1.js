/*
 level1.js

 This file sets up Level 1 for Subject Zero.
 It creates the background areas, walls, pickups, and the exit.

 Notes:
 - This level uses simple rectangles instead of tilemaps.
 - Everything is placed manually for more control over layout.
 - The armory is placed earlier so the player can get the AR sooner.
*/

export default function createLevel1(scene) {
    // Set the background color for the level
    scene.cameras.main.setBackgroundColor('#1b2026');

    // Create a floor that covers the whole level
    scene.levelFloor = scene.add.rectangle(1800, 200, 3600, 400, 0x222830);
    scene.levelFloor.setDepth(-5);

    // Different sections of the level
    scene.startArea = scene.add.rectangle(250, 200, 500, 360, 0x2f4152, 0.96);
    scene.startArea.setDepth(-4);

    scene.armoryArea = scene.add.rectangle(750, 200, 500, 360, 0x465463, 0.96);
    scene.armoryArea.setDepth(-4);

    scene.corridorArea = scene.add.rectangle(1350, 200, 700, 360, 0x3b424c, 0.96);
    scene.corridorArea.setDepth(-4);

    scene.testChamberArea = scene.add.rectangle(2150, 200, 900, 360, 0x4a515c, 0.96);
    scene.testChamberArea.setDepth(-4);

    scene.finalArea = scene.add.rectangle(3100, 200, 1000, 360, 0x555d68, 0.96);
    scene.finalArea.setDepth(-4);

    scene.exitZone = scene.add.rectangle(3500, 200, 200, 360, 0x9bad4f, 0.96);
    scene.exitZone.setDepth(-4);


    scene.exitLabel = scene.add.text(3450, 40, 'Exit', {
        fontSize: '18px',
        fill: '#000000'
    });
    scene.exitLabel.setDepth(-3);

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

    // Creates stacked supply crates.
    const createCrateStack = (x, y, width = 120, height = 70) => {
        createSolidObject(x, y, width, height, 0x35414d, -1);

        scene.add.rectangle(x - 32, y - 10, 44, 34, 0x8b5a2b).setStrokeStyle(2, 0x2a1b0f).setDepth(3);
        scene.add.rectangle(x + 16, y - 10, 44, 34, 0x9a6a35).setStrokeStyle(2, 0x2a1b0f).setDepth(3);
        scene.add.rectangle(x - 8, y + 18, 54, 26, 0x6f4a28).setStrokeStyle(2, 0x2a1f0f).setDepth(3);

        scene.add.rectangle(x - 32, y - 10, 3, 32, 0x2a1b0f).setDepth(4);
        scene.add.rectangle(x + 16, y - 10, 3, 32, 0x2a1b0f).setDepth(4);
        scene.add.rectangle(x - 8, y + 18, 52, 3, 0x2a1b0f).setDepth(4);
    };

    // Creates a barrel group.
    const createBarrelCluster = (x, y, width = 120, height = 70) => {
        createSolidObject(x, y, width, height, 0x35414d, -1);

        const barrels = [
            { x: x - 30, y: y - 2, color: 0x8f2d2d },
            { x: x, y: y + 5, color: 0x2d5f8f },
            { x: x + 30, y: y - 2, color: 0x6b6f75 }
        ];

        for (let i = 0; i < barrels.length; i++) {
            const barrel = barrels[i];
            scene.add.ellipse(barrel.x, barrel.y, 28, 40, barrel.color).setStrokeStyle(2, 0x111111).setDepth(3);
            scene.add.rectangle(barrel.x, barrel.y - 8, 22, 3, 0x111111).setDepth(4);
            scene.add.rectangle(barrel.x, barrel.y + 8, 22, 3, 0x111111).setDepth(4);
        }
    };

    // Creates armory shelves and weapon storage.
    const createArmoryRack = (x, y, width = 120, height = 60) => {
        createSolidObject(x, y, width, height, 0x35414d, -1);

        scene.add.rectangle(x, y, width - 12, height - 18, 0x27313a).setStrokeStyle(2, 0x91a1ad).setDepth(3);

        for (let i = -36; i <= 36; i += 24) {
            scene.add.rectangle(x + i, y - 8, 6, 24, 0x111111).setDepth(4);
            scene.add.rectangle(x + i + 4, y + 8, 18, 4, 0x555555).setDepth(4);
        }
    };

    // Creates broken wall barricades.
    const createBrokenWall = (x, y, direction = 'vertical') => {
        createSolidObject(x, y, 90, 90, 0x35414d, -1);

        if (direction === 'vertical') {
            scene.add.rectangle(x - 18, y, 22, 78, 0x707a86).setStrokeStyle(2, 0x1a1f26).setDepth(3);
            scene.add.rectangle(x + 18, y - 12, 22, 55, 0x707a86).setStrokeStyle(2, 0x1a1f26).setDepth(3);
            scene.add.rectangle(x + 20, y + 25, 34, 16, 0x4b5360).setStrokeStyle(2, 0x1a1f26).setDepth(3);
        } else {
            scene.add.rectangle(x, y - 20, 78, 22, 0x707a86).setStrokeStyle(2, 0x1a1f26).setDepth(3);
            scene.add.rectangle(x - 12, y + 18, 55, 22, 0x707a86).setStrokeStyle(2, 0x1a1f26).setDepth(3);
            scene.add.rectangle(x + 28, y + 18, 16, 34, 0x4b5360).setStrokeStyle(2, 0x1a1f26).setDepth(3);
        }
    };

    // Creates metal pipe barriers.
    const createPipeBarrier = (x, y, height = 120) => {
        createSolidObject(x, y, 24, height, 0x35414d, -1);
        scene.add.rectangle(x - 5, y, 8, height - 10, 0x707a86).setStrokeStyle(1, 0x1a1f26).setDepth(3);
        scene.add.rectangle(x + 7, y, 8, height - 10, 0x9aa6b2).setStrokeStyle(1, 0x1a1f26).setDepth(3);
        scene.add.circle(x + 1, y - ((height - 24) / 2), 8, 0x4b5360).setStrokeStyle(1, 0x1a1f26).setDepth(4);
        scene.add.circle(x + 1, y + ((height - 24) / 2), 8, 0x4b5360).setStrokeStyle(1, 0x1a1f26).setDepth(4);
    };

    // Creates combat/test chamber equipment.
    const createTestMachine = (x, y, width = 100, height = 90) => {
        createSolidObject(x, y, width, height, 0x35414d, -1);
        scene.add.rectangle(x, y, width - 16, height - 18, 0x1c222b).setStrokeStyle(3, 0x6f7f92).setDepth(3);
        scene.add.rectangle(x, y - 10, width - 38, 26, 0x2d5f8f, 0.8).setStrokeStyle(2, 0x00ffcc).setDepth(4);
        scene.add.circle(x - 28, y + 24, 6, 0xff3333).setDepth(4);
        scene.add.circle(x + 28, y + 24, 6, 0xffdd33).setDepth(4);
    };

    // Creates generators/power units.
    const createGeneratorUnit = (x, y, width = 120, height = 70) => {
        createSolidObject(x, y, width, height, 0x35414d, -1);
        scene.add.rectangle(x, y, width - 18, height - 18, 0x27313a).setStrokeStyle(2, 0x91a1ad).setDepth(3);
        scene.add.rectangle(x - 24, y - 8, 28, 16, 0xffdd33).setStrokeStyle(1, 0x111111).setDepth(4);
        scene.add.circle(x + 30, y - 10, 7, 0xff3333).setStrokeStyle(1, 0x111111).setDepth(4);
        scene.add.rectangle(x + 18, y + 14, 42, 5, 0x111111).setDepth(4);
        scene.add.rectangle(x + 18, y + 2, 42, 5, 0x111111).setDepth(4);
    };

    // Top and bottom boundaries
    createSolidObject(1800, 18, 3600, 20, 0x8f99a6, -2);
    createSolidObject(1800, 372, 3600, 40, 0x8f99a6, -2);

    // Entrance area (more open for easier start)
    createCrateStack(280, 140, 60, 60);
    createBarrelCluster(430, 260, 60, 60);

    // Armory area (player gets AR here, more space to move)
    createArmoryRack(620, 120, 110, 50);
    createArmoryRack(880, 120, 50, 50);
    createGeneratorUnit(750, 250, 120, 70);
    createCrateStack(600, 310, 60, 60);
    createBarrelCluster(900, 310, 60, 60);

    // Corridor area (narrow path where player has to move carefully)
    createPipeBarrier(1100, 125, 100);
    createPipeBarrier(1240, 275, 100);
    createPipeBarrier(1380, 125, 100);
    createPipeBarrier(1520, 275, 100);
    createPipeBarrier(1660, 125, 100);

    createBrokenWall(1180, 210, 'horizontal');
    createBrokenWall(1460, 210, 'vertical');

    // Test chamber (main combat area)
    createTestMachine(1850, 130, 90, 90);
    createTestMachine(2050, 280, 90, 90);
    createTestMachine(2250, 160, 90, 90);
    createTestMachine(2450, 280, 90, 90);

    createGeneratorUnit(1950, 210, 70, 70);
    createGeneratorUnit(2350, 220, 70, 70);

    // Center cover to break up the space a bit
    createPipeBarrier(2150, 200, 150);

    // Final area (hardest part before exit)
    createPipeBarrier(2720, 130, 110);
    createPipeBarrier(2870, 270, 110);
    createPipeBarrier(3020, 130, 110);
    createPipeBarrier(3170, 270, 110);
    createPipeBarrier(3320, 130, 110);

    createTestMachine(2800, 210, 120, 120);
    createGeneratorUnit(3050, 120, 80, 80);
    createCrateStack(3250, 290, 80, 80);

    createBrokenWall(2930, 300, 'horizontal');
    createBrokenWall(3160, 180, 'vertical');
    createBrokenWall(3380, 240, 'horizontal');

    // Wall before the exit
    createPipeBarrier(3400, 200, 260);

    // Pickups in the level
    // AR pickup placed earlier in the level
    scene.arPickup = scene.add.rectangle(750, 200, 30, 30, 0x0000ff);
    scene.arPickup.setDepth(10);

    scene.healthPickup = scene.add.rectangle(1180, 110, 30, 30, 0x00ff00);
    scene.healthPickup.setDepth(10);

    // Damage boost placed in the middle where more fighting happens
    scene.damagePickup = scene.add.rectangle(2150, 200, 30, 30, 0xff00ff);
    scene.damagePickup.setDepth(10);
}