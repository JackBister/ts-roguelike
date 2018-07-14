import { Entity } from "./Entity";
import { IItem } from "./Item";
import { Message } from "./Message";
import { RenderOrder } from "./RenderOrder";
import { ITurnResult } from "./TurnResult";

export class Inventory {
    public owner: Entity;
    public items: IItem[];

    constructor(private capacity: number) {
        this.items = [];
    }

    public addItem(item: IItem) {
        const results: ITurnResult[] = [];

        if (this.items.length >= this.capacity) {
            results.push({ message: new Message("Your inventory is full.", "yellow") });
        } else {
            results.push({
                itemAdded: item.owner,
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
        if (!item.owner) {
            item.owner = new Entity(
                this.owner.x,
                this.owner.y,
                "violet",
                "?",
                false,
                item.name,
                RenderOrder.ITEM,
                null,
                null,
                item,
            );
        }
        item.owner.x = this.owner.x;
        item.owner.y = this.owner.y;
        this.items.splice(index, 1);
        results.push({
            itemDropped: item.owner,
            message: new Message(`You drop the ${item.name}.`, "yellow"),
        });

        return results;
    }

    public useItem(index: number, entities: Entity[]) {
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

        const itemUseResults = this.items[index].use(this.owner, entities);
        if (itemUseResults.some((r) => r.consumed)) {
            this.items.splice(index, 1);
        }

        results = results.concat(itemUseResults);

        return results;
    }
}
