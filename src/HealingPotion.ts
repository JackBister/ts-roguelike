import { Entity } from "./Entity";
import { Fighter } from "./Fighter";
import { IItem } from "./Item";
import { Message } from "./Message";
import { ITurnResult } from "./TurnResult";

export class HealingPotion implements IItem {
    public owner: Entity;

    constructor(private healAmount: number, public readonly name: string = "Healing Potion") {
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

        if (user.fighter.currHp >= Fighter.getMaxHp(user.fighter)) {
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
        if (user.fighter.currHp > Fighter.getMaxHp(user.fighter)) {
            user.fighter.currHp = Fighter.getMaxHp(user.fighter);
        }

        return results;
    }

    public toJSON() {
        const ret = { ...(this as any) };
        ret._ownerId = ret.owner.id;
        ret.owner = undefined;
        ret._type = "HealingPotion";
        return ret;
    }
}
