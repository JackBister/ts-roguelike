import * as ROT from "rot-js"

import { Ai } from "./Ai";
import { Entity } from "./Entity";
import { GameMap } from "./GameMap"
import { FightResult } from "./FightResult";

export class BasicMonsterAi implements Ai {
    public takeTurn(target: Entity, fov: ROT.FOV, map: GameMap, entities: Entity[]) {
        let results: FightResult[] = [];
        let monster = this.owner;

        let canSeeTarget = false;
        fov.compute(monster.x, monster.y, 10, (x, y, r, vis) => {
            if (x == target.x && y == target.y) {
                canSeeTarget = true;
            }
        });

        if (canSeeTarget) {
            if (monster.distanceTo(target) >= 2) {
                monster.moveAstar(target, map, entities);
            } else if (target.fighter && target.fighter.currHp > 0) {
                results = results.concat(monster.fighter.attack(target));
            }
        }

        return results;
    }

    public owner: Entity;
}
