import { ComponentService } from "./components/Component.service";
import { FighterComponent } from "./components/FighterComponent";
import { container } from "./config/container";
import { Entity } from "./Entity";
import { IItem } from "./Item";
import { Message } from "./Message";
import { ITurnResult } from "./TurnResult";

const componentService = container.get<ComponentService>("ComponentService");

export class HealingPotion implements IItem {
    public owner: Entity;

    constructor(private healAmount: number, public readonly name: string = "Healing Potion") {
    }

    public use(user: Entity, entities: Entity[]) {
        const results: ITurnResult[] = [];

        const userFighter = componentService
            .getComponentByEntityIdAndType(user.id, "FighterComponent") as FighterComponent;

        if (!userFighter) {
            results.push({
                consumed: false,
                message: new Message(`${user.name} tries to use a healing potion, but realizes it can't do so.`, "red"),
            });
            return results;
        }

        // TODO: calculation
        if (userFighter.currHp >= userFighter.baseMaxHp) {
            // if (userFighter.currHp >= Fighter.getMaxHp(user.fighter)) {
            results.push({
                consumed: false,
                message: new Message("You are already at full health.", "yellow"),
            });
            return results;
        }

        if (userFighter.currHp <= 0) {
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
        userFighter.currHp += this.healAmount;
        // TODO: calculation
        if (userFighter.currHp > userFighter.baseMaxHp) {
            // if (user.fighter.currHp > Fighter.getMaxHp(user.fighter)) {
            userFighter.currHp = userFighter.baseMaxHp;
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
