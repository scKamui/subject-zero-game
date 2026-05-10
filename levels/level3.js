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

    // Top and bottom boundaries for the longer Level 3 map.
    createSolidObject(3000, 18, 6000, 20, 0x6f6575, -2);
    createSolidObject(3000, 372, 6000, 40, 0x6f6575, -2);

    // Start area: small amount of cover so the player can settle into the level.
    createSolidObject(260, 135, 70, 70, 0x5c5162, -1);
    createSolidObject(460, 270, 80, 60, 0x5c5162, -1);

    // Security area: staggered barricades make the player weave through the room.
    createSolidObject(780, 115, 130, 55, 0x7d3f4b, -1);
    createSolidObject(980, 285, 120, 65, 0x5c5162, -1);
    createSolidObject(1180, 150, 110, 75, 0x7d3f4b, -1);
    createSolidObject(1320, 300, 80, 60, 0x5c5162, -1);

    // Containment hall: alternating wall pieces create a different path from Level 2.
    createSolidObject(1650, 120, 24, 120, 0x7b6c82, -2);
    createSolidObject(1820, 285, 24, 120, 0x7b6c82, -2);
    createSolidObject(1990, 120, 24, 120, 0x7b6c82, -2);
    createSolidObject(2160, 285, 24, 120, 0x7b6c82, -2);
    createSolidObject(2330, 120, 24, 120, 0x7b6c82, -2);
    createSolidObject(1750, 210, 80, 70, 0x4f4656, -1);
    createSolidObject(2100, 205, 90, 70, 0x4f4656, -1);

    // Terminal area A: this space will be used later for the first hold objective.
    createSolidObject(2780, 125, 130, 70, 0x9a4754, -1);
    createSolidObject(3000, 290, 140, 70, 0x4f4656, -1);
    createSolidObject(3220, 135, 100, 100, 0x9a4754, -1);
    createSolidObject(3350, 255, 80, 80, 0x4f4656, -1);

    // Terminal area B: more cover and tighter spacing for a later hold objective.
    createSolidObject(3820, 280, 140, 70, 0x4f4656, -1);
    createSolidObject(4040, 120, 150, 65, 0x9a4754, -1);
    createSolidObject(4260, 285, 120, 65, 0x4f4656, -1);
    createSolidObject(4480, 135, 130, 80, 0x9a4754, -1);

    // Final escape route: longer final push with cover before the exit.
    createSolidObject(5000, 120, 150, 70, 0x7b6c82, -2);
    createSolidObject(5180, 290, 140, 70, 0x4f4656, -1);
    createSolidObject(5360, 150, 120, 90, 0x9a4754, -1);
    createSolidObject(5550, 290, 150, 70, 0x4f4656, -1);

    // Narrow wall before the exit to make the final approach feel tense.
    createSolidObject(5700, 200, 30, 260, 0x7b6c82, -2);

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