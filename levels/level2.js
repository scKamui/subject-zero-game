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

    // Top and bottom boundaries (extended for longer level)
    createSolidObject(2500, 18, 5000, 20, 0x8f99a6, -2);
    createSolidObject(2500, 372, 5000, 40, 0x8f99a6, -2);

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

    // Level 2 objective: the player must activate this power switch before escaping.
    scene.powerRestored = false;
    scene.powerSwitch = scene.add.rectangle(3350, 105, 28, 28, 0xffdd33);
    scene.powerSwitch.setDepth(12);
    scene.powerSwitch.setStrokeStyle(3, 0x000000);

    scene.powerSwitchLabel = scene.add.text(3310, 62, 'Power Switch', {
        fontSize: '16px',
        fill: '#ffdd33'
    });
    scene.powerSwitchLabel.setDepth(12);

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