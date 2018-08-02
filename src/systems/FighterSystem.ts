import { inject, injectable } from "inversify";
import { ComponentService } from "../components/Component.service";
import { FighterComponent } from "../components/FighterComponent";
import { EntityService } from "../entities/Entity.service";
import { Entity } from "../Entity";
import { EventResult } from "../EventResult";
import { AttackEvent } from "../events/AttackEvent";
import { REvent } from "../events/Event";
import { GetPropertyEvent } from "../events/GetPropertyEvent";
import { TakeDamageEvent } from "../events/TakeDamageEvent";
import { Message } from "../Message";
import { sumPropertyEvents } from "../sumPropertyEvents";
import { ISystem } from "./System";
import { SystemService } from "./System.service";

@injectable()
export class FighterSystem implements ISystem {

    constructor(
        @inject("EntityService") private entities: EntityService,
        @inject("ComponentService") private components: ComponentService,
        @inject("SystemService") private systems: SystemService,
    ) { }

    public onEvent(entityId: number, event: REvent): EventResult[] {
        if (event.type !== "AttackEvent"
            && event.type !== "GetPropertyEvent"
            && event.type !== "TakeDamageEvent"
        ) {
            return [];
        }

        const target = this.entities.getEntityById(entityId);
        const targetFighter = this.components
            .getComponentByEntityIdAndType(entityId, "FighterComponent") as FighterComponent;

        if (!target || !targetFighter) {
            return [];
        }

        switch (event.type) {
            case "AttackEvent":
                return this.onAttack(event, target, targetFighter);
            case "GetPropertyEvent":
                return this.onGetProperty(event, targetFighter);
            case "TakeDamageEvent":
                return this.onTakeDamage(event, target, targetFighter);
        }
    }

    private onAttack(event: AttackEvent, target: Entity, targetFighter: FighterComponent): EventResult[] {
        let results: EventResult[] = [];

        const attacker = this.entities.getEntityById(event.attackerId);
        const attackerFighter = this.components
            .getComponentByEntityIdAndType(event.attackerId, "FighterComponent") as FighterComponent;

        if (!attacker || !attackerFighter) {
            return results;
        }

        const defense = sumPropertyEvents(
            this.systems.dispatchEvent(target.id, new GetPropertyEvent("defense")),
        );
        const power = sumPropertyEvents(
            this.systems.dispatchEvent(attacker.id, new GetPropertyEvent("power")),
        );
        const damage = power - defense;

        if (damage > 0) {
            results.push({
                message: new Message(
                    `${attacker.name.capitalize()} attacks ${target.name} for ${damage} hit points.`,
                    "white",
                ),
                type: "message",
            });
            results = results.concat(
                this.systems.dispatchEvent(target.id, new TakeDamageEvent(damage)),
            );
        } else {
            results.push({
                message: new Message(
                    `${attacker.name.capitalize()} attacks ${target.name} but does no damage.`,
                    "white",
                ),
                type: "message",
            });
        }

        return results;
    }

    private onGetProperty(event: GetPropertyEvent, targetFighter: FighterComponent) {
        const ret: EventResult = { type: "getProperty", value: null };
        switch (event.propertyName) {
            case "currHp":
                ret.value = targetFighter.currHp;
                break;
            case "defense":
                ret.value = targetFighter.baseDefense;
                break;
            case "maxHp":
                ret.value = targetFighter.baseMaxHp;
                break;
            case "power":
                ret.value = targetFighter.basePower;
                break;
            default:
                return [];
        }
        return [ret];
    }

    private onTakeDamage(event: TakeDamageEvent, target: Entity, targetFighter: FighterComponent) {
        if (!target || !targetFighter) {
            return [];
        }

        const results: EventResult[] = [];

        targetFighter.currHp -= event.damage;

        if (targetFighter.currHp <= 0) {
            results.push({
                dead: target,
                type: "dead",
            });
            results.push({
                type: "xp",
                xp: targetFighter.xp,
            });
        }

        return results;
    }
}
