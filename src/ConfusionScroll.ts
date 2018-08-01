import * as ROT from "rot-js";

import { ComponentService } from "./components/Component.service";
import { ConfusedMonsterAiComponent } from "./components/ConfusedMonsterAiComponent";
import { container } from "./config/container";
import { EntityService } from "./entities/Entity.service";
import { Entity } from "./Entity";
import { IItem } from "./Item";
import { CONSTANTS } from "./main";
import { Message } from "./Message";
import { FovService } from "./services/Fov.service";
import { ITurnResult } from "./TurnResult";

const componentService = container.get<ComponentService>("ComponentService");
const entityService = container.get<EntityService>("EntityService");

export class ConfusionScroll implements IItem {
    public owner: Entity;
    public readonly name = "Confusion Scroll";
    public readonly requiresTarget = true;

    constructor(private numTurns: number) { }

    public use(user: Entity, entities: Entity[], fovService: FovService, targetX?: number, targetY?: number) {
        const results: ITurnResult[] = [];
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

        const targets: Entity[] = [];

        const potentialTargets = entityService.getEntitiesAtPos(targetX, targetY);
        for (const t of potentialTargets) {
            const ais = componentService
                .getComponentsForEntityIdAndTypes(t.id, ["BasicMonsterAiComponent", "ConfusedMonsterAiComponent"]);
            if (ais.length > 0) {
                targets.push(t);
            }
        }

        if (targets.length < 1) {
            results.push({
                consumed: false,
                message: new Message("There is nothing to target at that location.", "yellow"),
            });
            return results;
        }

        const target = targets[targets.length - 1];

        // TODO: Subtypes
        const previousAi = componentService
            .getComponentsForEntityIdAndTypes(target.id, ["BasicMonsterAiComponent", "ConfusedMonsterAiComponent"]);

        componentService.addComponent(
            new ConfusedMonsterAiComponent(target.id, this.numTurns, previousAi.length > 0 ? previousAi[0].id : null),
        );

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
