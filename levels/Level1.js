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

    // Top and bottom boundaries
    createSolidObject(1800, 18, 3600, 20, 0x8f99a6, -2);
    createSolidObject(1800, 372, 3600, 40, 0x8f99a6, -2);

    // Entrance area (more open for easier start)
    createSolidObject(280, 140, 60, 60, 0x58616c, -1);
    createSolidObject(430, 260, 60, 60, 0x58616c, -1);

    // Armory area (player gets AR here, more space to move)
    createSolidObject(620, 120, 110, 50, 0x3f8fe6, -1);
    createSolidObject(880, 120, 110, 50, 0x3f8fe6, -1);
    createSolidObject(750, 250, 120, 70, 0x3f8fe6, -1);
    createSolidObject(600, 310, 60, 60, 0x58616c, -1);
    createSolidObject(900, 310, 60, 60, 0x58616c, -1);

    // Corridor area (narrow path where player has to move carefully)
    createSolidObject(1100, 125, 20, 100, 0x707a86, -2);
    createSolidObject(1240, 275, 20, 100, 0x707a86, -2);
    createSolidObject(1380, 125, 20, 100, 0x707a86, -2);
    createSolidObject(1520, 275, 20, 100, 0x707a86, -2);
    createSolidObject(1660, 125, 20, 100, 0x707a86, -2);

    createSolidObject(1180, 210, 60, 60, 0x58616c, -1);
    createSolidObject(1460, 210, 60, 60, 0x58616c, -1);

    // Test chamber (main combat area)
    createSolidObject(1850, 130, 90, 90, 0x3f8fe6, -1);
    createSolidObject(2050, 280, 90, 90, 0x3f8fe6, -1);
    createSolidObject(2250, 160, 90, 90, 0x3f8fe6, -1);
    createSolidObject(2450, 280, 90, 90, 0x3f8fe6, -1);

    createSolidObject(1950, 210, 70, 70, 0x58616c, -1);
    createSolidObject(2350, 220, 70, 70, 0x58616c, -1);

    // Center cover to break up the space a bit
    createSolidObject(2150, 200, 150, 30, 0x707a86, -2);

    // Final area (hardest part before exit)
    createSolidObject(2720, 130, 20, 110, 0x707a86, -2);
    createSolidObject(2870, 270, 20, 110, 0x707a86, -2);
    createSolidObject(3020, 130, 20, 110, 0x707a86, -2);
    createSolidObject(3170, 270, 20, 110, 0x707a86, -2);
    createSolidObject(3320, 130, 20, 110, 0x707a86, -2);

    createSolidObject(2800, 210, 120, 120, 0x3f8fe6, -1);
    createSolidObject(3050, 120, 80, 80, 0x3f8fe6, -1);
    createSolidObject(3250, 290, 80, 80, 0x3f8fe6, -1);

    createSolidObject(2930, 300, 70, 70, 0x58616c, -1);
    createSolidObject(3160, 180, 70, 70, 0x58616c, -1);
    createSolidObject(3380, 240, 70, 70, 0x58616c, -1);

    // Wall before the exit
    createSolidObject(3400, 200, 30, 260, 0x707a86, -2);

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