import * as ROT from "rot-js";

import { Entity } from "./Entity";
import { IItem } from "./Item";
import { CONSTANTS } from "./main";
import { Message } from "./Message";
import { FovService } from "./services/Fov.service";
import { ITurnResult } from "./TurnResult";

export class LightningScroll implements IItem {
    public owner: Entity;

    private _name: string = "Lightning Scroll";

    constructor(private damage: number, private maxRange: number, name?: string) {
        if (name) {
            this._name = name;
        }
    }

    public use(user: Entity, entities: Entity[], fovService: FovService) {
        let results: ITurnResult[] = [];

        let targets: Entity[] = [];
        fovService.computeFov(user.x, user.y, CONSTANTS.PLAYER_FOV, (x, y) => {
            targets = targets.concat(entities.filter((e) => e.fighter && e.x === x && e.y === y));
        });

        const targetsWithDist = targets
            .map((e, idx) => ({ idx: idx, dist: user.distanceTo(e) }))
            .filter((e) => e.dist < this.maxRange)
            .sort((e) => e.dist);

        if (targetsWithDist.length > 1) {
            const target = targets[targetsWithDist[1].idx];
            results.push({
                consumed: true,
                message: new Message(`A lightning bolt strikes ${target.name} for ${this.damage} damage.`, "white"),
                target: target,
            });
            results = results.concat(target.fighter.takeDamage(this.damage));
        } else {
            results.push({
                consumed: false,
                message: new Message("There are no targets in range.", "red"),
            });
        }

        return results;
    }

    public get name() {
        return this._name;
    }

    public toJSON() {
        const ret = { ...(this as any) };
        ret._ownerId = ret.owner.id;
        ret.owner = undefined;
        ret._type = "LightningScroll";
        return ret;
    }
}
