import { Entity } from "./Entity";
import { IItem } from "./Item";
import { Message } from "./Message";
import { ITurnResult } from "./TurnResult";

export class HealingPotion implements IItem {
    public owner: Entity;

    private _name = "Healing Potion";

    constructor(private healAmount: number, name?: string) {
        if (name) {
            this._name = name;
        }
    }

    public use(user: Entity, entities: Entity[]) {
        const results: ITurnResult[] = [];

        if (!user.fighter) {
            results.push({
                consumed: false,
                message: new Message(`${user.name} tries to use a healing potion, but realizes it can't do so.`, "red"),
            });
            return results;
        }

        if (user.fighter.currHp >= user.fighter.maxHp) {
            results.push({
                consumed: false,
                message: new Message("You are already at full health.", "yellow"),
            });
            return results;
        }

        if (user.fighter.currHp <= 0) {
            results.push({
                consumed: false,
                message: new Message("You are dead. The potion doesn't really help.", "yellow"),
            });
            return results;
        }
        results.push({
            consumed: true,
            message: new Message("Your wounds start to feel better!", "green"),
        });
        user.fighter.currHp += this.healAmount;
        if (user.fighter.currHp > user.fighter.maxHp) {
            user.fighter.currHp = user.fighter.maxHp;
        }

        return results;
    }

    public get name() {
        return this._name;
    }

    public toJSON() {
        const ret = { ...(this as any) };
        ret.owner = undefined;
        ret._type = "HealingPotion";
        return ret;
    }
}
