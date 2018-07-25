import { Entity } from "./Entity";
import { Message } from "./Message";
import { ITurnResult } from "./TurnResult";

export function fighterFromObject(obj: any): Fighter {
    switch (obj._type) {
        case "Fighter":
            const ret = new Fighter(obj.maxHp, obj.defense, obj.power);
            ret.currHp = obj.currHp;
            return ret;
    }
    return null;
}

export class Fighter {
    public owner: Entity;

    public currHp: number;
    public maxHp: number;

    constructor(hp: number, public defense: number, public power: number, public xp: number = 0) {
        this.currHp = hp;
        this.maxHp = hp;
    }

    public attack(target: Entity) {
        let results: ITurnResult[] = [];

        if (!target || !target.fighter) {
            return results;
        }
        const damage = this.power - target.fighter.defense;

        if (damage > 0) {
            results.push({
                message: new Message(
                    `${this.owner.name.capitalize()} attacks ${target.name} for ${damage} hit points.`,
                    "white",
                ),
            });
            results = results.concat(target.fighter.takeDamage(damage));
        } else {
            results.push({
                message: new Message(
                    `${this.owner.name.capitalize()} attacks ${target.name} but does no damage.`,
                    "white",
                ),
            });
        }

        return results;
    }

    public takeDamage(amount: number) {
        const results: ITurnResult[] = [];

        this.currHp -= amount;

        if (this.currHp <= 0) {
            results.push({
                dead: this.owner,
                xp: this.xp,
            });
        }

        return results;
    }

    public toJSON() {
        const ret = { ...(this as any) };
        ret.owner = undefined;
        ret._type = "Fighter";
        return ret;
    }
}
