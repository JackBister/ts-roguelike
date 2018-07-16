import * as ROT from "rot-js";

import { IAi } from "./Ai";
import { Entity } from "./Entity";
import { GameMap } from "./GameMap";
import { Message } from "./Message";
import { randomInt } from "./randomInt";
import { ITurnResult } from "./TurnResult";

export class ConfusedMonsterAi implements IAi {
    public owner: Entity;

    constructor(private previousAi: IAi, private numTurns: number) {}

    public takeTurn(target: Entity, fov: ROT.FOV, map: GameMap, entities: Entity[]): ITurnResult[] {
        let results: ITurnResult[] = [];

        if (this.numTurns > 0) {
            const randX = this.owner.x + randomInt(0, 2) - 1;
            const randY = this.owner.y + randomInt(0, 2) - 1;

            if (randX !== this.owner.x && randY !== this.owner.y) {
                this.owner.moveTowards(randX, randY, map, entities);
            }

            const hurtChance = randomInt(0, 100);
            if (this.owner.fighter && hurtChance === 0) {
                results.push({
                    message: new Message(`The ${this.owner.name} hurt itself in its confusion!`, "red"),
                });
                results = results.concat(this.owner.fighter.takeDamage(this.owner.fighter.power));
            }

            this.numTurns--;
        } else {
            this.owner.ai = this.previousAi;
            results.push({
                message: new Message(`The ${this.owner.name} is no longer confused!`, "red"),
            });
        }

        return results;
    }
}
