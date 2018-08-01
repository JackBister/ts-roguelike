import * as ROT from "rot-js";

import { ComponentService } from "./components/Component.service";
import { FighterComponent } from "./components/FighterComponent";
import { container } from "./config/container";
import { Entity } from "./Entity";
import { Level } from "./Level";

const componentService: ComponentService = container.get<ComponentService>("ComponentService");

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

    const entityFighter = componentService
        .getComponentByEntityIdAndType(entity.id, "FighterComponent") as FighterComponent;

    if (entityFighter) {
        winY += 2;
        display.drawText(winX, winY, `Maximum HP: ${entityFighter.baseMaxHp}`);
        winY++;
        display.drawText(winX, winY, `Attack: ${entityFighter.basePower}`);
        winY++;
        display.drawText(winX, winY, `Defense: ${entityFighter.baseDefense}`);
        // TODO: calculations
        /*
        display.drawText(winX, winY, `Maximum HP: ${Fighter.getMaxHp(entity.fighter)}`);
        winY++;
        display.drawText(winX, winY, `Attack: ${Fighter.getPower(entity.fighter)}`);
        winY++;
        display.drawText(winX, winY, `Defense: ${Fighter.getDefense(entity.fighter)}`);
        */
    }
}
