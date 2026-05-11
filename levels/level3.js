/*
 level3.js

 This file sets up Level 3 for Subject Zero.
 It creates a longer containment sector with a darker layout, more cover, terminals, walls, pickups, and the exit.
*/

export default function createLevel3(scene) {
    // Set the background color for the level
    scene.cameras.main.setBackgroundColor('#151019');

    // Create a floor that covers the whole Level 3 map.
    // Level 3 is longer than Level 2 so the player has a bigger final sector to clear.
    scene.levelFloor = scene.add.rectangle(3000, 200, 6000, 400, 0x241923);
    scene.levelFloor.setDepth(-5);

    // Different sections of Level 3.
    // The colors are darker so this level feels like a containment sector instead of the power area.
    scene.startArea = scene.add.rectangle(300, 200, 600, 360, 0x342536, 0.96);
    scene.startArea.setDepth(-4);

    scene.securityArea = scene.add.rectangle(1050, 200, 700, 360, 0x3c2b3f, 0.96);
    scene.securityArea.setDepth(-4);

    scene.containmentHall = scene.add.rectangle(1950, 200, 900, 360, 0x2f2638, 0.96);
    scene.containmentHall.setDepth(-4);

    scene.terminalAreaA = scene.add.rectangle(3050, 200, 900, 360, 0x422d34, 0.96);
    scene.terminalAreaA.setDepth(-4);

    scene.terminalAreaB = scene.add.rectangle(4200, 200, 1000, 360, 0x352a45, 0.96);
    scene.terminalAreaB.setDepth(-4);

    scene.finalArea = scene.add.rectangle(5400, 200, 1200, 360, 0x4a2d30, 0.96);
    scene.finalArea.setDepth(-4);

    scene.exitZone = scene.add.rectangle(5850, 200, 220, 360, 0x9bad4f, 0.96);
    scene.exitZone.setDepth(-4);

    scene.exitLabel = scene.add.text(5800, 40, 'Exit', {
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

    // Creates a stack of crates with one simple collision box.
    const createCrateStack = (x, y, width = 130, height = 70) => {
        createSolidObject(x, y, width, height, 0x3b3340, -1);

        scene.add.rectangle(x - 35, y - 10, 48, 36, 0x8b5a2b).setStrokeStyle(2, 0x2a1b0f).setDepth(3);
        scene.add.rectangle(x + 18, y - 10, 48, 36, 0x9a6a35).setStrokeStyle(2, 0x2a1b0f).setDepth(3);
        scene.add.rectangle(x - 8, y + 19, 58, 28, 0x6f4a28).setStrokeStyle(2, 0x2a1b0f).setDepth(3);

        scene.add.rectangle(x - 35, y - 10, 3, 34, 0x2a1b0f).setDepth(4);
        scene.add.rectangle(x + 18, y - 10, 3, 34, 0x2a1b0f).setDepth(4);
        scene.add.rectangle(x - 8, y + 19, 56, 3, 0x2a1b0f).setDepth(4);
    };

    // Creates a group of barrels with one collision box.
    const createBarrelCluster = (x, y, width = 130, height = 65) => {
        createSolidObject(x, y, width, height, 0x3b3340, -1);

        const barrels = [
            { x: x - 34, y: y - 3, color: 0x8f2d2d },
            { x: x, y: y + 5, color: 0x2d5f8f },
            { x: x + 34, y: y - 3, color: 0x6b6f75 }
        ];

        for (let i = 0; i < barrels.length; i++) {
            const barrel = barrels[i];
            scene.add.ellipse(barrel.x, barrel.y, 30, 42, barrel.color).setStrokeStyle(2, 0x111111).setDepth(3);
            scene.add.rectangle(barrel.x, barrel.y - 8, 24, 3, 0x111111).setDepth(4);
            scene.add.rectangle(barrel.x, barrel.y + 8, 24, 3, 0x111111).setDepth(4);
        }
    };

    // Creates broken containment wall pieces.
    const createBrokenWall = (x, y, direction = 'vertical') => {
        createSolidObject(x, y, 90, 90, 0x3b3340, -1);

        if (direction === 'vertical') {
            scene.add.rectangle(x - 18, y, 22, 78, 0x7b6c82).setStrokeStyle(2, 0x1a1f26).setDepth(3);
            scene.add.rectangle(x + 18, y - 12, 22, 55, 0x7b6c82).setStrokeStyle(2, 0x1a1f26).setDepth(3);
            scene.add.rectangle(x + 20, y + 25, 34, 16, 0x4b5360).setStrokeStyle(2, 0x1a1f26).setDepth(3);
        } else {
            scene.add.rectangle(x, y - 20, 78, 22, 0x7b6c82).setStrokeStyle(2, 0x1a1f26).setDepth(3);
            scene.add.rectangle(x - 12, y + 18, 55, 22, 0x7b6c82).setStrokeStyle(2, 0x1a1f26).setDepth(3);
            scene.add.rectangle(x + 28, y + 18, 16, 34, 0x4b5360).setStrokeStyle(2, 0x1a1f26).setDepth(3);
        }
    };

    // Creates a lab desk with small equipment on it.
    const createLabDesk = (x, y, width = 130, height = 65) => {
        createSolidObject(x, y, width, height, 0x3b3340, -1);
        scene.add.rectangle(x, y, width - 16, height - 22, 0x26313b).setStrokeStyle(2, 0x91a1ad).setDepth(3);
        scene.add.rectangle(x - 35, y - 6, 26, 16, 0x9aa6b2).setStrokeStyle(1, 0x111111).setDepth(4);
        scene.add.rectangle(x + 12, y - 7, 34, 18, 0xffdd33).setStrokeStyle(1, 0x111111).setDepth(4);
        scene.add.circle(x + 43, y + 12, 8, 0xff3333).setStrokeStyle(1, 0x111111).setDepth(4);
    };

    // Creates a containment pod/sci-fi machine.
    const createContainmentPod = (x, y, width = 110, height = 90) => {
        createSolidObject(x, y, width, height, 0x3b3340, -1);
        scene.add.rectangle(x, y, width - 18, height - 18, 0x1c222b).setStrokeStyle(3, 0x6f7f92).setDepth(3);
        scene.add.rectangle(x, y - 10, width - 42, 28, 0x2d5f8f, 0.8).setStrokeStyle(2, 0x00ffcc).setDepth(4);
        scene.add.circle(x - 32, y + 25, 6, 0xff3333).setDepth(4);
        scene.add.circle(x + 32, y + 25, 6, 0xffdd33).setDepth(4);
    };

    // Creates a generator unit with wires and warning lights.
    const createGeneratorUnit = (x, y, width = 130, height = 70) => {
        createSolidObject(x, y, width, height, 0x3b3340, -1);
        scene.add.rectangle(x, y, width - 22, height - 18, 0x27313a).setStrokeStyle(2, 0x91a1ad).setDepth(3);
        scene.add.rectangle(x - 28, y - 8, 32, 18, 0xffdd33).setStrokeStyle(1, 0x111111).setDepth(4);
        scene.add.circle(x + 35, y - 11, 7, 0xff3333).setStrokeStyle(1, 0x111111).setDepth(4);
        scene.add.rectangle(x + 20, y + 14, 50, 5, 0x111111).setDepth(4);
        scene.add.rectangle(x + 20, y + 2, 50, 5, 0x111111).setDepth(4);
    };

    // Creates a pipe barrier instead of a plain thin wall.
    const createPipeBarrier = (x, y, height = 120) => {
        createSolidObject(x, y, 24, height, 0x3b3340, -1);
        scene.add.rectangle(x - 5, y, 8, height - 10, 0x7b6c82).setStrokeStyle(1, 0x1a1f26).setDepth(3);
        scene.add.rectangle(x + 7, y, 8, height - 10, 0x9aa6b2).setStrokeStyle(1, 0x1a1f26).setDepth(3);
        scene.add.circle(x + 1, y - ((height - 24) / 2), 8, 0x4b5360).setStrokeStyle(1, 0x1a1f26).setDepth(4);
        scene.add.circle(x + 1, y + ((height - 24) / 2), 8, 0x4b5360).setStrokeStyle(1, 0x1a1f26).setDepth(4);
    };

    // Creates a medical/supply station.
    const createMedicalStation = (x, y, width = 140, height = 70) => {
        createSolidObject(x, y, width, height, 0x3b3340, -1);
        scene.add.rectangle(x, y, width - 30, height - 24, 0xd9d9d9).setStrokeStyle(2, 0x222222).setDepth(3);
        scene.add.rectangle(x, y, 15, 32, 0xff3333).setDepth(4);
        scene.add.rectangle(x, y, 40, 12, 0xff3333).setDepth(4);
        scene.add.rectangle(x - 52, y + 22, 18, 18, 0x7a5533).setStrokeStyle(1, 0x2a1b0f).setDepth(4);
        scene.add.rectangle(x + 52, y + 22, 18, 18, 0x7a5533).setStrokeStyle(1, 0x2a1b0f).setDepth(4);
    };

    // Top and bottom boundaries for the longer Level 3 map.
    createSolidObject(3000, 18, 6000, 20, 0x6f6575, -2);
    createSolidObject(3000, 372, 6000, 40, 0x6f6575, -2);

    // Start area: small amount of cover so the player can settle into the level.
    createCrateStack(260, 135, 80, 70);
    createBarrelCluster(460, 270, 90, 60);

    // Security area: staggered barricades make the player weave through the room.
    createLabDesk(780, 115, 130, 55);
    createCrateStack(980, 285, 120, 65);
    createGeneratorUnit(1180, 150, 110, 75);
    createBrokenWall(1320, 300, 'horizontal');

    // Containment hall: alternating pipe barriers create a different path from Level 2.
    createPipeBarrier(1650, 120, 120);
    createPipeBarrier(1820, 285, 120);
    createPipeBarrier(1990, 120, 120);
    createPipeBarrier(2160, 285, 120);
    createPipeBarrier(2330, 120, 120);
    createBrokenWall(1750, 210, 'horizontal');
    createContainmentPod(2100, 205, 90, 70);

    // Terminal area A: mixed lab equipment and cover around the first hold objective.
    createLabDesk(2780, 125, 130, 70);
    createMedicalStation(3000, 290, 140, 70);
    createContainmentPod(3220, 135, 100, 100);
    createBarrelCluster(3350, 255, 90, 80);

    // Terminal area B: more cover and tighter spacing for the second hold objective.
    createCrateStack(3820, 280, 140, 70);
    createGeneratorUnit(4040, 120, 150, 65);
    createMedicalStation(4260, 285, 120, 65);
    createLabDesk(4480, 135, 130, 80);

    // Final escape route: longer final push with varied cover before the exit.
    createBrokenWall(5000, 120, 'horizontal');
    createBarrelCluster(5180, 290, 140, 70);
    createGeneratorUnit(5360, 150, 120, 90);
    createCrateStack(5550, 290, 150, 70);

    // Narrow pipe barrier before the exit to make the final approach feel tense.
    createPipeBarrier(5700, 200, 260);

    // Level 3 terminal objectives.
    // Each terminal has a console body, glowing screen, and upload zone so it looks more like an objective station.

    // Terminal A upload zone
    scene.terminalAZone = scene.add.circle(3050, 205, 58, 0xffdd33, 0.12);
    scene.terminalAZone.setStrokeStyle(2, 0xffdd33, 0.6);
    scene.terminalAZone.setDepth(11);

    // Terminal A console body
    scene.terminalABase = scene.add.rectangle(3050, 205, 76, 52, 0x1c222b);
    scene.terminalABase.setStrokeStyle(3, 0x6f7f92);
    scene.terminalABase.setDepth(12);

    // Terminal A glowing screen. This is the object GameScene uses for terminal activation.
    scene.terminalA = scene.add.rectangle(3050, 198, 48, 24, 0xffdd33);
    scene.terminalA.setDepth(13);
    scene.terminalA.setStrokeStyle(2, 0x000000);

    scene.terminalALabel = scene.add.text(2995, 145, 'Terminal A', {
        fontSize: '16px',
        fill: '#ffdd33'
    });
    scene.terminalALabel.setDepth(13);

    // Terminal B upload zone
    scene.terminalBZone = scene.add.circle(4200, 205, 58, 0xffdd33, 0.12);
    scene.terminalBZone.setStrokeStyle(2, 0xffdd33, 0.6);
    scene.terminalBZone.setDepth(11);

    // Terminal B console body
    scene.terminalBBase = scene.add.rectangle(4200, 205, 76, 52, 0x1c222b);
    scene.terminalBBase.setStrokeStyle(3, 0x6f7f92);
    scene.terminalBBase.setDepth(12);

    // Terminal B glowing screen. This is the object GameScene uses for terminal activation.
    scene.terminalB = scene.add.rectangle(4200, 198, 48, 24, 0xffdd33);
    scene.terminalB.setDepth(13);
    scene.terminalB.setStrokeStyle(2, 0x000000);

    scene.terminalBLabel = scene.add.text(4145, 145, 'Terminal B', {
        fontSize: '16px',
        fill: '#ffdd33'
    });
    scene.terminalBLabel.setDepth(13);

    // Pickups in the level
    // AR pickup placed earlier in the level
    scene.arPickup = scene.add.rectangle(850, 210, 30, 30, 0x0000ff);
    scene.arPickup.setDepth(10);

    scene.healthPickup = scene.add.rectangle(2500, 110, 30, 30, 0x00ff00);
    scene.healthPickup.setDepth(10);

    // Damage boost placed in the middle where more fighting happens
    scene.damagePickup = scene.add.rectangle(4700, 200, 30, 30, 0xff00ff);
    scene.damagePickup.setDepth(10);
}