import { inject, injectable } from "inversify";
import { ComponentService } from "../components/Component.service";
import { FighterComponent } from "../components/FighterComponent";
import { EntityService } from "../entities/Entity.service";
import { Entity } from "../Entity";
import { AttackEvent } from "../events/AttackEvent";
import { REvent } from "../events/Event";
import { TakeDamageEvent } from "../events/TakeDamageEvent";
import { Message } from "../Message";
import { ITurnResult } from "../TurnResult";
import { ISystem } from "./System";
import { SystemService } from "./System.service";

@injectable()
export class FighterSystem implements ISystem {

    constructor(
        @inject("EntityService") private entities: EntityService,
        @inject("ComponentService") private components: ComponentService,
        @inject("SystemService") private systems: SystemService,
    ) { }

    public onEvent(entityId: number, event: REvent): ITurnResult[] {
        if (event.type !== "AttackEvent" && event.type !== "TakeDamageEvent") {
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
                return this.onAttack(entityId, event, target, targetFighter);
            case "TakeDamageEvent":
                return this.onTakeDamage(entityId, event, target, targetFighter);
        }
    }

    private onAttack(entityId, event: AttackEvent, target: Entity, targetFighter: FighterComponent): ITurnResult[] {
        let results: ITurnResult[] = [];

        const attacker = this.entities.getEntityById(event.attackerId);
        const attackerFighter = this.components
            .getComponentByEntityIdAndType(event.attackerId, "FighterComponent") as FighterComponent;

        if (!attacker || !attackerFighter) {
            return results;
        }

        // TODO: Proper calculation (dispatch and receive power/defense from ITurnResult renamed to EventResult)
        const damage = attackerFighter.basePower - targetFighter.baseDefense;
        // const damage = Fighter.getPower(this) - Fighter.getDefense(target.fighter);

        if (damage > 0) {
            results.push({
                message: new Message(
                    `${attacker.name.capitalize()} attacks ${target.name} for ${damage} hit points.`,
                    "white",
                ),
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
            });
        }

        return results;
    }

    private onTakeDamage(entityId: number, event: TakeDamageEvent, target: Entity, targetFighter: FighterComponent) {
        if (!target || !targetFighter) {
            return [];
        }

        const results: ITurnResult[] = [];

        targetFighter.currHp -= event.damage;

        if (targetFighter.currHp <= 0) {
            results.push({
                dead: target,
                xp: targetFighter.xp,
            });
        }

        return results;
    }
}
