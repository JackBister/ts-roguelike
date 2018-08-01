import { Entity } from "./Entity";
import { Equipment } from "./Equipment";
import { Message } from "./Message";
import { ITurnResult } from "./TurnResult";

export function fighterFromObject(obj: any): Fighter {
    switch (obj._type) {
        case "Fighter":
            const ret = new Fighter(obj.baseMaxHp, obj.baseDefense, obj.basePower);
            ret.currHp = obj.currHp;
            return ret;
    }
    return null;
}

export class Fighter {
    public static getDefense(f: Fighter) {
        let ret = f.baseDefense;
        if (f.owner && f.owner.equipment) {
            ret += Equipment.getDefenseBonus(f.owner.equipment);
        }
        return ret;
    }

    public static getMaxHp(f: Fighter) {
        let ret = f.baseMaxHp;
        if (f.owner && f.owner.equipment) {
            ret += Equipment.getMaxHpBonus(f.owner.equipment);
        }
        return ret;
    }

    public static getPower(f: Fighter) {
        let ret = f.basePower;
        if (f.owner && f.owner.equipment) {
            ret += Equipment.getPowerBonus(f.owner.equipment);
        }
        return ret;
    }

    public owner: Entity;

    public currHp: number;
    public baseMaxHp: number;

    constructor(hp: number, public baseDefense: number, public basePower: number, public xp: number = 0) {
        this.currHp = hp;
        this.baseMaxHp = hp;
    }

    public attack(target: Entity) {
        let results: ITurnResult[] = [];

        if (!target || !target.fighter) {
            return results;
        }
        const damage = Fighter.getPower(this) - Fighter.getDefense(target.fighter);

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
        ret._ownerId = ret.owner.id;
        ret.owner = undefined;
        ret._type = "Fighter";
        return ret;
    }
}
