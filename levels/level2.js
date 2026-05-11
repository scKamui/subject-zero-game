/*
 level2.js

 This file sets up Level 2 for Subject Zero.
 It creates a longer map, a power room objective, walls, pickups, and the exit.
*/

export default function createLevel2(scene) {
    // Set the background color for the level
    scene.cameras.main.setBackgroundColor('#1b2026');

    // Create a floor that covers the whole level (extended for Level 2)
    scene.levelFloor = scene.add.rectangle(2500, 200, 5000, 400, 0x222830);
    scene.levelFloor.setDepth(-5);

    // Different sections of the level (spread further apart for a longer level)
    scene.startArea = scene.add.rectangle(250, 200, 500, 360, 0x2f4152, 0.96);
    scene.startArea.setDepth(-4);

    scene.armoryArea = scene.add.rectangle(900, 200, 500, 360, 0x465463, 0.96);
    scene.armoryArea.setDepth(-4);

    scene.corridorArea = scene.add.rectangle(1700, 200, 800, 360, 0x3b424c, 0.96);
    scene.corridorArea.setDepth(-4);

    scene.testChamberArea = scene.add.rectangle(2700, 200, 1000, 360, 0x4a515c, 0.96);
    scene.testChamberArea.setDepth(-4);

    // Power room area (new section for Level 2 objective)
    scene.powerRoomArea = scene.add.rectangle(3350, 200, 600, 360, 0x2d3a44, 0.96);
    scene.powerRoomArea.setDepth(-4);

    scene.finalArea = scene.add.rectangle(4200, 200, 1300, 360, 0x555d68, 0.96);
    scene.finalArea.setDepth(-4);

    scene.exitZone = scene.add.rectangle(4850, 200, 220, 360, 0x9bad4f, 0.96);
    scene.exitZone.setDepth(-4);

    scene.exitLabel = scene.add.text(4800, 40, 'Exit', {
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
        scene.add.rectangle(x - 8, y + 18, 54, 26, 0x6f4a28).setStrokeStyle(2, 0x2a1b0f).setDepth(3);

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

    // Top and bottom boundaries (extended for longer level)
    createSolidObject(2500, 18, 5000, 20, 0x8f99a6, -2);
    createSolidObject(2500, 372, 5000, 40, 0x8f99a6, -2);

    // Entrance area (more open for easier start)
    createCrateStack(280, 140, 70, 70);
    createBarrelCluster(430, 260, 70, 70);

    // Armory area (player gets AR here, more space to move)
    createArmoryRack(620, 120, 110, 50);
    createArmoryRack(880, 120, 110, 50);
    createGeneratorUnit(750, 250, 120, 70);
    createCrateStack(600, 310, 70, 70);
    createBarrelCluster(900, 310, 70, 70);

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

    // Walls and obstacles after the power room so the last section is not empty.
    // These objects use the extra width of Level 2 and make the ending feel like a final push.
    createGeneratorUnit(3620, 120, 120, 70);
    createCrateStack(3780, 290, 140, 70);
    createTestMachine(3980, 185, 90, 130);
    createArmoryRack(4140, 120, 140, 60);
    createBarrelCluster(4350, 280, 140, 70);
    createBrokenWall(4500, 125, 'horizontal');
    createGeneratorUnit(4650, 280, 130, 65);

    // Narrow wall before the exit to make the final approach feel more tense.
    createPipeBarrier(4720, 200, 260);

    // Power room obstacles around the switch objective.
    createGeneratorUnit(3300, 150, 90, 50);
    createArmoryRack(3500, 260, 100, 60);
    createTestMachine(3380, 235, 80, 80);

    // Walls and obstacles after the power room so the last section is not empty.
    // These objects use the extra width of Level 2 and make the ending feel like a final push.
    createSolidObject(3620, 120, 120, 70, 0x707a86, -2);
    createSolidObject(3780, 290, 140, 70, 0x707a86, -2);
    createSolidObject(3980, 185, 90, 130, 0x58616c, -2);
    createSolidObject(4140, 120, 140, 60, 0x3f8fe6, -1);
    createSolidObject(4350, 280, 140, 70, 0x707a86, -2);
    createSolidObject(4500, 125, 120, 70, 0x58616c, -2);
    createSolidObject(4650, 280, 130, 65, 0x3f8fe6, -1);

    // Narrow wall before the exit to make the final approach feel more tense.
    createSolidObject(4720, 200, 30, 260, 0x707a86, -2);

    // Power room obstacles around the switch objective.
    createSolidObject(3300, 150, 90, 50, 0x3f8fe6, -1);
    createSolidObject(3500, 260, 100, 60, 0x3f8fe6, -1);
    createSolidObject(3380, 235, 80, 80, 0x58616c, -1);

    // Level 2 objective: the player must activate this power console before escaping.
    // This uses a console body, screen, warning light, and small interaction zone so it looks less like a pickup square.
    scene.powerRestored = false;

    // Soft glow around the power console so the objective stands out.
    scene.powerSwitchGlow = scene.add.circle(3400, 120, 32, 0xffdd33, 0.12);
    scene.powerSwitchGlow.setDepth(11);

    // Main console body.
    scene.powerSwitchBase = scene.add.rectangle(3400, 127, 62, 44, 0x1c222b);
    scene.powerSwitchBase.setDepth(12);
    scene.powerSwitchBase.setStrokeStyle(2, 0x6f7f92);

    // Yellow screen/activation panel. GameScene uses this object for the pickup/activation check.
    scene.powerSwitch = scene.add.rectangle(3400, 119, 36, 18, 0xffdd33);
    scene.powerSwitch.setDepth(13);
    scene.powerSwitch.setStrokeStyle(2, 0x000000);

    // Small red warning light to make the console look powered down.
    scene.powerSwitchLight = scene.add.circle(3423, 137, 4, 0xff3333, 1);
    scene.powerSwitchLight.setDepth(14);
    scene.powerSwitchLight.setStrokeStyle(1, 0x000000);

    // Small lever/detail on the console.
    scene.powerSwitchLever = scene.add.rectangle(3381, 137, 6, 16, 0x9aa6b2);
    scene.powerSwitchLever.setDepth(14);
    scene.powerSwitchLever.setStrokeStyle(1, 0x000000);
    scene.powerSwitchLever.setAngle(-20);

    scene.powerSwitchLabel = scene.add.text(3345, 72, 'Power Console', {
        fontSize: '15px',
        fill: '#ffdd33'
    });
    scene.powerSwitchLabel.setDepth(14);

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