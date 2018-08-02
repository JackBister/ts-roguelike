import { ComponentService } from "../../components/Component.service";
import { ConfusedMonsterAiComponent } from "../../components/ConfusedMonsterAiComponent";
import { container } from "../../config/container";
import { EntityService } from "../../entities/Entity.service";
import { Entity } from "../../Entity";
import { EventResult } from "../../EventResult";
import { UseEvent } from "../../events/UseEvent";
import { CONSTANTS } from "../../main";
import { Message } from "../../Message";
import { FovService } from "../Fov.service";
import { UseFunctionsService } from "../UseFunctions.service";

const componentService = container.get<ComponentService>("ComponentService");
const entityService = container.get<EntityService>("EntityService");
const fovService = container.get<FovService>("FovService");

const CONFUSION_CONSTANTS = {
    NUMTURNS: 10,
};

function confusionScroll(entityId: number, event: UseEvent) {
    const results: EventResult[] = [];
    let inFov = false;

    const user = entityService.getEntityById(event.instigatorId);

    if (!user || event.targetX === undefined || !event.targetY === undefined) {
        return [];
    }

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

    const targets: Entity[] = [];

    const potentialTargets = entityService.getEntitiesAtPos(event.targetX, event.targetY);
    for (const t of potentialTargets) {
        const ais = componentService
            .getComponentsForEntityIdAndTypes(t.id, ["BasicMonsterAiComponent", "ConfusedMonsterAiComponent"]);
        if (ais.length > 0) {
            targets.push(t);
        }
    }

    if (targets.length < 1) {
        results.push({
            message: new Message("There is nothing to target at that location.", "yellow"),
            type: "message",
        });
        return results;
    }

    const target = targets[targets.length - 1];

    // TODO: Subtypes
    const previousAi = componentService
        .getComponentsForEntityIdAndTypes(target.id, ["BasicMonsterAiComponent", "ConfusedMonsterAiComponent"]);

    componentService.addComponent(
        new ConfusedMonsterAiComponent(
            target.id,
            CONFUSION_CONSTANTS.NUMTURNS,
            previousAi.length > 0 ? previousAi[0].id : null,
        ),
    );

    results.push({
        type: "consumed",
    });
    results.push({
        message: new Message(
            `The eyes of the ${target.name} look vacant as it starts to stumble around.`,
            "lightgreen",
        ),
        type: "message",
    });

    return results;
}

const useService = container.get<UseFunctionsService>("UseFunctionsService");
useService.addFunction("confusionScroll", confusionScroll);
