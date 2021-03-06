import { ComponentService } from "../../components/Component.service";
import { FighterComponent } from "../../components/FighterComponent";
import { container } from "../../config/container";
import { EntityService } from "../../entities/Entity.service";
import { EventResult } from "../../EventResult";
import { UseEvent } from "../../events/UseEvent";
import { Message } from "../../Message";
import { UseFunctionsService } from "../UseFunctions.service";

const componentService = container.get<ComponentService>("ComponentService");
const entityService = container.get<EntityService>("EntityService");

const HEALING_POTION_CONSTANTS = {
    HEAL_AMOUNT: 40,
};

function healingPotion(entityId: number, event: UseEvent) {
    const user = entityService.getEntityById(event.instigatorId);
    const userFighter = componentService
        .getComponentByEntityIdAndType(event.instigatorId, "FighterComponent") as FighterComponent;

    const results: EventResult[] = [];

    if (!user || !userFighter) {
        results.push({
            message: new Message(`${user.name} tries to use a healing potion, but realizes it can't do so.`, "red"),
            type: "message",
        });
        return results;
    }

    // TODO: calculation
    if (userFighter.currHp >= userFighter.baseMaxHp) {
        // if (userFighter.currHp >= Fighter.getMaxHp(user.fighter)) {
        results.push({
            message: new Message("You are already at full health.", "yellow"),
            type: "message",
        });
        return results;
    }

    if (userFighter.currHp <= 0) {
        results.push({
            message: new Message("You are dead. The potion doesn't really help.", "yellow"),
            type: "message",
        });
        return results;
    }
    results.push({
        type: "consumed",
    });
    results.push({
        message: new Message("Your wounds start to feel better!", "green"),
        type: "message",
    });
    userFighter.currHp += HEALING_POTION_CONSTANTS.HEAL_AMOUNT;
    // TODO: calculation
    if (userFighter.currHp > userFighter.baseMaxHp) {
        // if (user.fighter.currHp > Fighter.getMaxHp(user.fighter)) {
        userFighter.currHp = userFighter.baseMaxHp;
    }

    return results;
}

const useService = container.get<UseFunctionsService>("UseFunctionsService");
useService.addFunction("healingPotion", healingPotion);
