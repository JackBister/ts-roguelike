import { ComponentService } from "../../components/Component.service";
import { container } from "../../config/container";
import { EntityService } from "../../entities/Entity.service";
import { Entity } from "../../Entity";
import { EventResult } from "../../EventResult";
import { TakeDamageEvent } from "../../events/TakeDamageEvent";
import { UseEvent } from "../../events/UseEvent";
import { CONSTANTS } from "../../main";
import { Message } from "../../Message";
import { SystemService } from "../../systems/System.service";
import { FovService } from "../Fov.service";
import { UseFunctionsService } from "../UseFunctions.service";

const componentService = container.get<ComponentService>("ComponentService");
const entityService = container.get<EntityService>("EntityService");
const fovService = container.get<FovService>("FovService");
const systemService = container.get<SystemService>("SystemService");

const LIGHTNING_CONSTANTS = {
    DAMAGE: 40,
    MAX_RANGE: 5,
};

function lightningScroll(entityId: number, event: UseEvent) {
    const user = entityService.getEntityById(event.instigatorId);

    if (!user) {
        return [];
    }

    let results: EventResult[] = [];
    let targets: Entity[] = [];

    fovService.computeFov(user.x, user.y, CONSTANTS.PLAYER_FOV, (x, y) => {
        targets = targets.concat(
            entityService.entities.filter(
                (e) => e.x === x && e.y === y
                    && componentService.entityHasComponentOfType(e.id, "FighterComponent"),
            ),
        );
    });

    const targetsWithDist = targets
        .map((e, idx) => ({ idx: idx, dist: user.distanceTo(e) }))
        .filter((e) => e.dist < LIGHTNING_CONSTANTS.MAX_RANGE)
        .sort((e) => e.dist);

    if (targetsWithDist.length > 1) {
        const target = targets[targetsWithDist[1].idx];
        results.push({
            type: "consumed",
        });
        results.push({
            message: new Message(
                `A lightning bolt strikes ${target.name} for ${LIGHTNING_CONSTANTS.DAMAGE} damage.`,
                "white",
            ),
            type: "message",
        });
        results = results.concat(
            systemService.dispatchEvent(target.id, new TakeDamageEvent(LIGHTNING_CONSTANTS.DAMAGE)),
        );
    } else {
        results.push({
            message: new Message("There are no targets in range.", "red"),
            type: "message",
        });
    }

    return results;
}

const useService = container.get<UseFunctionsService>("UseFunctionsService");
useService.addFunction("lightningScroll", lightningScroll);
