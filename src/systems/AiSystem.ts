import { inject, injectable } from "inversify";
import { ComponentService } from "../components/Component.service";
import { ConfusedMonsterAiComponent } from "../components/ConfusedMonsterAiComponent";
import { FighterComponent } from "../components/FighterComponent";
import { EntityService } from "../entities/Entity.service";
import { Entity } from "../Entity";
import { EventResult } from "../EventResult";
import { AttackEvent } from "../events/AttackEvent";
import { REvent } from "../events/Event";
import { GetPropertyEvent } from "../events/GetPropertyEvent";
import { TakeDamageEvent } from "../events/TakeDamageEvent";
import { Message } from "../Message";
import { randomInt } from "../randomInt";
import { FovService } from "../services/Fov.service";
import { MapService } from "../services/Map.service";
import { sumPropertyEvents } from "../sumPropertyEvents";
import { ISystem } from "./System";
import { SystemService } from "./System.service";

@injectable()
export class AiSystem implements ISystem {

    private readonly AI_COMPONENT_TYPES = {
        BasicMonsterAiComponent: (entityId: number) => this.basicMonsterAiThink(entityId),
        ConfusedMonsterAiComponent: (entityId: number,
                                     ai: ConfusedMonsterAiComponent) => this.confusedMonsterAiThink(entityId, ai),
    };

    constructor(
        @inject("EntityService") private entities: EntityService,
        @inject("ComponentService") private components: ComponentService,
        @inject("FovService") private fov: FovService,
        @inject("MapService") private maps: MapService,
        @inject("SystemService") private systems: SystemService,
    ) { }

    public onEvent(entityId: number, event: REvent): EventResult[] {
        if (event.type !== "ThinkEvent") {
            return [];
        }

        const entityComponents = this.components
            .getComponentsForEntityId(entityId)
            .filter((c) => Object.keys(this.AI_COMPONENT_TYPES).includes(c.type));

        if (entityComponents.length === 0) {
            return [];
        }

        let results: EventResult[] = [];

        for (const ai of entityComponents) {
            if (!ai.isActive) {
                continue;
            }
            results = results.concat(this.AI_COMPONENT_TYPES[ai.type](entityId, ai));
        }

        return results;
    }

    private basicMonsterAiThink(entityId: number) {
        const target = this.entities.getEntityByName("Player");
        if (!target) {
            throw new Error("Player not found!");
        }

        let results: EventResult[] = [];

        const monster = this.entities.getEntityById(entityId);

        if (Entity.distanceTo(monster, target) > 10) {
            return results;
        }

        let canSeeTarget = false;
        this.fov.computeFov(monster.x, monster.y, 10, (x, y) => {
            if (x === target.x && y === target.y) {
                canSeeTarget = true;
            }
        });

        if (canSeeTarget) {
            const targetFighter = this.components
                .getComponentByEntityIdAndType(target.id, "FighterComponent") as FighterComponent;
            if (Entity.distanceTo(monster, target) >= 2) {
                Entity.moveAstar(monster, target, this.maps.getCurrentMap(), this.entities.entities);
            } else if (targetFighter && targetFighter.currHp > 0) {
                results = results.concat(
                    this.systems.dispatchEvent(target.id, new AttackEvent(monster.id)),
                );
            }
        }

        return results;
    }

    private confusedMonsterAiThink(entityId: number, ai: ConfusedMonsterAiComponent) {
        let results: EventResult[] = [];

        const monster = this.entities.getEntityById(entityId);

        if (ai.numTurns > 0) {
            const randX = monster.x + randomInt(0, 2) - 1;
            const randY = monster.y + randomInt(0, 2) - 1;

            if (randX !== monster.x && randY !== monster.y) {
                Entity.moveTowards(monster, randX, randY, this.maps.getCurrentMap(), this.entities.entities);
            }

            const hurtChance = randomInt(0, 100);
            const monsterFighter = this.components
                .getComponentByEntityIdAndType(monster.id, "FighterComponent") as FighterComponent;
            if (monsterFighter && hurtChance === 0) {
                results.push({
                    message: new Message(`The ${monster.name} hurt itself in its confusion!`, "red"),
                    type: "message",
                });
                const power = sumPropertyEvents(
                    this.systems.dispatchEvent(monster.id, new GetPropertyEvent("power")),
                );
                results = results.concat(
                    this.systems.dispatchEvent(monster.id, new TakeDamageEvent(power)),
                );
            }

            ai.numTurns--;
        } else {
            const previousAi = this.components.getComponentById(ai.previousAiId);
            previousAi.isActive = true;
            ai.isActive = false;
            results.push({
                message: new Message(`The ${monster.name} is no longer confused!`, "red"),
                type: "message",
            });
        }

        return results;
    }
}
