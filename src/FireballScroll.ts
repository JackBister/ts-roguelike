import * as ROT from "rot-js";

import { Entity } from "./Entity";
import { IItem } from "./Item";
import { CONSTANTS } from "./main";
import { Message } from "./Message";
import { FovService } from "./services/Fov.service";
import { ITurnResult } from "./TurnResult";

export class FireballScroll implements IItem {
    public owner: Entity;
    public readonly requiresTarget: boolean = true;
    public readonly name: string = "Fireball Scroll";

    constructor(public damage: number, public radius: number) {}

    public use(user: Entity, entities: Entity[], fovService: FovService, targetX?: number, targetY?: number) {
        let results: ITurnResult[] = [];

        let inFov = false;
        fovService.computeFov(user.x, user.y, CONSTANTS.PLAYER_FOV, (x, y) => {
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

        results.push({
            consumed: true,
            message: new Message(`The fireball explodes, burning everything with ${this.radius} tiles!`, "orange"),
        });

        const targets = entities.filter((e) => e.fighter && e.distanceToPos(targetX, targetY) <= this.radius);

        for (const v of targets) {
            results.push({
                message: new Message(`The ${v.name} is burned for ${this.damage} hit points.`, "orange"),
            });
            results = results.concat(v.fighter.takeDamage(this.damage));
        }

        return results;
    }

    public toJSON() {
        const ret = { ...(this as any) };
        ret._ownerId = ret.owner.id;
        ret.owner = undefined;
        ret._type = "FireballScroll";
        return ret;
    }
}
