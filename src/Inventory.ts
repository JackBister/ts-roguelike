import { Entity } from "./Entity";
import { Item } from "./Item";
import { Message } from "./Message";
import { ITurnResult } from "./TurnResult";

export class Inventory {
    public owner: Entity;
    public items: any[];

    constructor(private capacity: number) {
        this.items = [];
    }

    public addItem(item: Item) {
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
}
