import * as ROT from "rot-js";

import { Entity } from "./Entity";
import { Equipment } from "./Equipment";
import { IItem, itemFromObject } from "./Item";
import { Message } from "./Message";
import { RenderOrder } from "./RenderOrder";
import { FovService } from "./services/Fov.service";
import { ITurnResult } from "./TurnResult";

export function inventoryFromObject(obj: any): Inventory {
    switch (obj._type) {
        case "Inventory":
            const ret = new Inventory(obj.capacity);
            for (const v of obj.items) {
                ret.items.push(itemFromObject(v));
            }
            return ret;
    }
    return null;
}

export class Inventory {
    public owner: Entity;
    public items: Entity[];

    constructor(private capacity: number) {
        this.items = [];
    }

    public addItem(item: Entity) {
        const results: ITurnResult[] = [];

        if (this.items.length >= this.capacity) {
            results.push({ message: new Message("Your inventory is full.", "yellow") });
        } else {
            results.push({
                itemAdded: item,
                message: new Message(`You pick up the ${item.name}!`, "blue"),
            });
            this.items.push(item);
        }

        return results;
    }

    public dropItem(index: number, entities: Entity[]) {
        const results: ITurnResult[] = [];
        if (index >= this.items.length || index < 0) {
            results.push({
                message: new Message(
                    `${this.owner.name} tries to drop an item that they don't have. How silly!`,
                    "red",
                ),
            });
            return results;
        }

        const item = this.items[index];

        if (this.owner.equipment
            && item.equippable
            && this.owner.equipment.equipped.includes(item.equippable)
        ) {
            Equipment.toggleEquip(this.owner.equipment, item.equippable);
        }

        item.x = this.owner.x;
        item.y = this.owner.y;
        this.items.splice(index, 1);
        results.push({
            itemDropped: item,
            message: new Message(`You drop the ${item.name}.`, "yellow"),
        });

        return results;
    }

    public useItem(index: number, entities: Entity[], fovService: FovService, targetX?: number, targetY?: number) {
        let results: ITurnResult[] = [];

        if (index >= this.items.length || index < 0) {
            results.push({
                message: new Message(
                    `${this.owner.name} tries to use an item that they don't have. How silly!`,
                    "red",
                ),
            });
            return results;
        }

        if (!this.items[index].item) {
           if (this.items[index].equippable) {
               results.push({ equip: this.items[index] });
           } else {
               results.push({ message: new Message(`The ${this.items[index].name} cannot be used.`, "yellow") });
           }
           return results;
        }

        if (this.items[index].item.requiresTarget && targetX === undefined && targetY === undefined) {
            results.push({ targeting: this.items[index] });
            return results;
        }

        const itemUseResults = this.items[index].item.use(this.owner, entities, fovService, targetX, targetY);
        if (itemUseResults.some((r) => r.consumed)) {
            this.items.splice(index, 1);
        }

        results = results.concat(itemUseResults);

        return results;
    }

    public toJSON() {
        const ret = { ...(this as any) };
        ret._ownerId = ret.owner.id;
        ret.owner = undefined;
        ret._type = "Inventory";
        return ret;
    }
}
