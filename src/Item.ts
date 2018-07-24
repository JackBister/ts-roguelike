import * as ROT from "rot-js";

import { ConfusionScroll } from "./ConfusionScroll";
import { Entity } from "./Entity";
import { FireballScroll } from "./FireballScroll";
import { HealingPotion } from "./HealingPotion";
import { LightningScroll } from "./LightningScroll";
import { ITurnResult } from "./TurnResult";

export function itemFromObject(obj: any): IItem {
    switch (obj._type) {
        case "ConfusionScroll":
            return new ConfusionScroll(obj.numTurns);
        case "FireballScroll":
            return new FireballScroll(obj.damage, obj.radius);
        case "HealingPotion":
            return new HealingPotion(obj.healAmount, obj.name);
        case "LightningScroll":
            return new LightningScroll(obj.damage, obj.maxRange, obj.name);
    }
    return null;
}

export interface IItem {
    owner: Entity;
    readonly name: string;
    readonly requiresTarget?: boolean;

    use: (user: Entity, entities: Entity[], fov: ROT.FOV, targetX?: number, targetY?: number) => ITurnResult[];
}
