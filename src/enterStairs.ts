import { Entity } from "./Entity";
import { Fighter } from "./Fighter";
import { GameMap } from "./GameMap";
import { CONSTANTS } from "./main";
import { IMapGenerator } from "./MapGenerator";
import { Message } from "./Message";
import { MessageLog } from "./MessageLog";
import { Stairs } from "./Stairs";
import { TutorialMapGenerator } from "./TutorialMapGenerator";

export function enterStairs(
    stairs: Stairs,
    player: Entity,
    maps: GameMap[],
    messageLog: MessageLog,
    generator: IMapGenerator = new TutorialMapGenerator(),
    currentFloor: number,
): [Entity[], number] {
    if (maps.some((m) => m.dungeonLevel === stairs.floor)) {
        const floor = maps.filter((m) => m.dungeonLevel === stairs.floor)[0];
        // TODO: Go to existing floor
        const entities = floor.entities;

        const downStairs = entities.filter((e) => e.stairs && e.stairs.floor === currentFloor);

        player.x = downStairs[0].x;
        player.y = downStairs[0].y;

        return [entities, stairs.floor - 1];
    } else {
        const entities = [player];

        maps.push(generator.generate(
            {
                height: CONSTANTS.MAP_HEIGHT,
                width: CONSTANTS.MAP_WIDTH,
            },
            player,
            entities,
            stairs.floor));

        player.fighter.currHp += Fighter.getMaxHp(player.fighter) / 2;
        if (player.fighter.currHp > Fighter.getMaxHp(player.fighter)) {
            player.fighter.currHp = Fighter.getMaxHp(player.fighter);
        }
        messageLog.addMessage(
            new Message("You rest for a moment, recovering your health.", "violet"),
        );

        return [entities, stairs.floor - 1];
    }
}
