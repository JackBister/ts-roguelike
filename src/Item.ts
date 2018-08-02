import * as ROT from "rot-js";

import { Entity } from "./Entity";
import { FovService } from "./services/Fov.service";
import { ITurnResult } from "./TurnResult";

/*
export function itemFromObject(obj: any): Entity {
    switch (obj.name) {
        case "Confusion Scroll":
            return new Entity(
                obj.id,
                0,
                0,
                "lightpink",
                "#",
                false,
                "Confusion Scroll",
                RenderOrder.ITEM,
                new ConfusionScroll(obj.item.numTurns),
            );
        case "Fireball Scroll":
            return new Entity(
                obj.id,
                0,
                0,
                "red",
                "#",
                false,
                "Fireball Scroll",
                RenderOrder.ITEM,
                new FireballScroll(obj.item.damage, obj.item.radius),
            );
        case "Healing Potion":
            return new Entity(
                obj.id,
                0,
                0,
                "violet",
                "!",
                false,
                "Healing Potion",
                RenderOrder.ITEM,
                new HealingPotion(obj.item.healAmount),
            );
        case "Lightning Scroll":
            return new Entity(
                obj.id,
                0,
                0,
                "yellow",
                "#",
                false,
                "Lightning Scroll",
                RenderOrder.ITEM,
                new LightningScroll(obj.item.damage, obj.item.maxRange),
            );
        case "Shield":
            return new Entity(
                obj.id,
                0,
                0,
                "darkorange",
                "[",
                false,
                "Shield",
                RenderOrder.ITEM,
                null,
                null,
                null,
                null,
                new Equippable(EquipmentSlot.OFF_HAND, 0, 1, 0),
            );
        case "Sword":
            return new Entity(
                obj.id,
                0,
                0,
                "skyblue",
                "刀",
                false,
                "Sword",
                RenderOrder.ITEM,
                null,
                null,
                null,
                null,
                new Equippable(EquipmentSlot.MAIN_HAND, 3, 0, 0),
            );
    }
    return null;
}
*/
export interface IItem {
    owner: Entity;
    readonly name: string;
    readonly requiresTarget?: boolean;

    use: (user: Entity,
          entities: Entity[],
          fovService: FovService,
          targetX?: number,
          targetY?: number,
    ) => ITurnResult[];
}
