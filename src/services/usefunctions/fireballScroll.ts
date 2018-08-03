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

// TODO: Some way of parametrizing this
const FIREBALL_CONSTANTS = {
    DAMAGE: 25,
    RADIUS: 3,
};

function fireballScroll(entityId: number, event: UseEvent) {
    const user = entityService.getEntityById(event.instigatorId);

    if (!user || event.targetX === undefined || !event.targetY === undefined) {
        return [];
    }
    let results: EventResult[] = [];

    let inFov = false;
    fovService.computeFov(user.x, user.y, CONSTANTS.PLAYER_FOV, (x, y) => {
        if (x === event.targetX && y === event.targetY) {
            inFov = true;
        }
    });

    if (!inFov) {
        results.push({
            message: new Message("You cannot target a tile outside your field of view.", "yellow"),
            type: "message",
        });
        return results;
    }

    results.push({
        type: "consumed",
    });
    results.push({
        message: new Message(
            `The fireball explodes, burning everything with ${FIREBALL_CONSTANTS.RADIUS} tiles!`,
            "orange",
        ),
        type: "message",
    });

    const targets = entityService.entities
        .filter((e) =>
            Entity.distanceToPos(e.x, e.y, event.targetX, event.targetY) <= FIREBALL_CONSTANTS.RADIUS
            && componentService.entityHasComponentOfType(e.id, "FighterComponent"));

    for (const v of targets) {
        results.push({
            message: new Message(`The ${v.name} is burned for ${FIREBALL_CONSTANTS.DAMAGE} hit points.`, "orange"),
            type: "message",
        });
        results = results.concat(
            systemService.dispatchEvent(v.id, new TakeDamageEvent(FIREBALL_CONSTANTS.DAMAGE)),
        );
    }

    return results;
}

const useService = container.get<UseFunctionsService>("UseFunctionsService");
useService.addFunction("fireballScroll", fireballScroll);
