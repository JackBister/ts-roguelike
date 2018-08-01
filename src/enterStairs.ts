import { ComponentService } from "./components/Component.service";
import { FighterComponent } from "./components/FighterComponent";
import { container } from "./config/container";
import { EntityService } from "./entities/Entity.service";
import { Entity } from "./Entity";
import { GameMap } from "./GameMap";
import { CONSTANTS } from "./main";
import { IMapGenerator } from "./MapGenerator";
import { Message } from "./Message";
import { MessageLog } from "./MessageLog";
import { Stairs } from "./Stairs";
import { TutorialMapGenerator } from "./TutorialMapGenerator";

const componentService = container.get<ComponentService>("ComponentService");
const entityService = container.get<EntityService>("EntityService");

export function enterStairs(
    stairs: Stairs,
    player: Entity,
    maps: GameMap[],
    messageLog: MessageLog,
    generator: IMapGenerator = new TutorialMapGenerator(entityService, componentService),
    currentFloor: number,
): number {
    if (maps.some((m) => m.dungeonLevel === stairs.floor)) {
        const floor = maps.filter((m) => m.dungeonLevel === stairs.floor)[0];
        // TODO: Go to existing floor
        /*
        const entities = floor.entities;

        const downStairs = entities.filter((e) => e.stairs && e.stairs.floor === currentFloor);

        player.x = downStairs[0].x;
        player.y = downStairs[0].y;
        */

        return stairs.floor - 1;
    } else {
        maps.push(generator.generate(
            {
                height: CONSTANTS.MAP_HEIGHT,
                width: CONSTANTS.MAP_WIDTH,
            },
            player,
            stairs.floor));

        const playerFighter = componentService
            .getComponentByEntityIdAndType(player.id, "FighterComponent") as FighterComponent;

        // TODO: proper hp calculation
        playerFighter.currHp += playerFighter.baseMaxHp / 2;
        if (playerFighter.currHp > playerFighter.baseMaxHp) {
            playerFighter.currHp = playerFighter.baseMaxHp;
        }
        /*
            player.fighter.currHp += Fighter.getMaxHp(player.fighter) / 2;
            if (player.fighter.currHp > Fighter.getMaxHp(player.fighter)) {
                player.fighter.currHp = Fighter.getMaxHp(player.fighter);
            }
        */
        messageLog.addMessage(
            new Message("You rest for a moment, recovering your health.", "violet"),
        );

        return stairs.floor - 1;
    }
}
