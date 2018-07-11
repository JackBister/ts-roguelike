import * as ROT from "rot-js";

import { IAi } from "./Ai";
import { Entity } from "./Entity";
import { IFightResult } from "./FightResult";
import { GameMap } from "./GameMap";

export class BasicMonsterAi implements IAi {
    public owner: Entity;

    public takeTurn(target: Entity, fov: ROT.FOV, map: GameMap, entities: Entity[]) {
        let results: IFightResult[] = [];
        const monster = this.owner;

        let canSeeTarget = false;
        fov.compute(monster.x, monster.y, 10, (x, y, r, vis) => {
            if (x === target.x && y === target.y) {
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
}
