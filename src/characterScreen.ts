import * as ROT from "rot-js";

import { Entity } from "./Entity";
import { Level } from "./Level";

export function characterScreen(display: ROT.Display,
                                entity: Entity,
                                width: number,
                                screenWidth: number,
                                screenHeight: number,
) {
    const winX = Math.floor(screenWidth / 2 - width / 2);
    let winY = Math.floor(screenHeight / 2 - 27 / 2);
    display.drawText(winX, winY, "Character information");
    if (entity.level) {
        winY++;
        display.drawText(winX, winY, `Level: ${entity.level.currentLevel}`);
        winY++;
        display.drawText(winX, winY, `Experience: ${entity.level.currentXp}/${Level.xpToLevel(entity.level)}`);
    }
    if (entity.fighter) {
        winY += 2;
        display.drawText(winX, winY, `Maximum HP: ${entity.fighter.maxHp}`);
        winY++;
        display.drawText(winX, winY, `Attack: ${entity.fighter.power}`);
        winY++;
        display.drawText(winX, winY, `Defense: ${entity.fighter.defense}`);
    }
}
