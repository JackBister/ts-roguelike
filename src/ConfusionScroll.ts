import * as ROT from "rot-js";

import { ConfusedMonsterAi } from "./ConfusedMonsterAi";
import { Entity } from "./Entity";
import { IItem } from "./Item";
import { CONSTANTS } from "./main";
import { Message } from "./Message";
import { ITurnResult } from "./TurnResult";

export class ConfusionScroll implements IItem {
    public owner: Entity;
    public readonly name = "Confusion Scroll";
    public readonly requiresTarget = true;

    constructor(private numTurns: number) {}

    public use(user: Entity, entities: Entity[], fov: ROT.FOV, targetX?: number, targetY?: number) {
        const results: ITurnResult[] = [];
        let inFov = false;

        fov.compute(user.x, user.y, CONSTANTS.PLAYER_FOV, (x, y, r, vis) => {
            if (x === targetX && y === targetY) {
                inFov = true;
            }
        });

        if (!inFov) {
            results.push({
                consumed: false,
                message: new Message("You cannot target a tile outside your field of view.", "yellow"),
            });
            return results;
        }

        const targets = entities
            .filter((e) => e.ai && e.x === targetX && e.y === targetY)
            .sort((e) => e.renderOrder);

        if (targets.length < 1) {
            results.push({
                consumed: false,
                message: new Message("There is nothing to target at that location.", "yellow"),
            });
            return results;
        }

        const target = targets[targets.length - 1];
        const confusedAi = new ConfusedMonsterAi(target.ai, this.numTurns);
        confusedAi.owner = target;
        target.ai = confusedAi;

        results.push({
            consumed: true,
            message: new Message(
                `The eyes of the ${target.name} look vacant as it starts to stumble around.`,
                "lightgreen",
            ),
        });

        return results;
    }

    public toJSON() {
        const ret = { ...(this as any) };
        ret._ownerId = ret.owner.id;
        ret.owner = undefined;
        ret._type = "ConfusionScroll";
        return ret;
    }
}
