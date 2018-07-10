import { Entity } from "./Entity";
import { FightResult } from "./FightResult";
import { Message } from "./Message";

export class Fighter {
    constructor(hp: number, defense: number, power: number) {
        this.currHp = hp;
        this.maxHp = hp;

        this.defense = defense;
        this.power = power;
    }

    public attack(target: Entity) {
        let results: FightResult[] = [];

        if (!target || !target.fighter) {
            return results;
        }
        let damage = this.power - target.fighter.defense;

        if (damage > 0) {
            results.push({
                message: new Message(`${this.owner.name.capitalize()} attacks ${target.name} for ${damage} hit points.`, 'white')
            });
            results = results.concat(target.fighter.takeDamage(damage));
        } else {
            results.push({
                message: new Message(`${this.owner.name.capitalize()} attacks ${target.name} but does no damage.`, 'white')
            });
        }

        return results;
    }

    public takeDamage(amount: number) {
        let results: FightResult[] = [];

        this.currHp -= amount;

        if (this.currHp <= 0) {
            results.push({
                dead: this.owner
            });
        }

        return results;
    }

    public owner: Entity;

    public currHp: number;
    public maxHp: number;

    public defense: number;
    public power: number;
}
