import { Entity } from "./Entity";
import { EquipmentSlot, Equippable } from "./Equippable";
import { ITurnResult } from "./TurnResult";

export class Equipment {
    public static getMaxHpBonus(eq: Equipment) {
        return eq.equipped.reduce((a, b) => a + (b ? b.maxHpBonus : 0), 0);
    }

    public static getPowerBonus(eq: Equipment) {
        return eq.equipped.reduce((a, b) => a + (b ? b.powerBonus : 0), 0);
    }

    public static getDefenseBonus(eq: Equipment) {
        return eq.equipped.reduce((a, b) => a + (b ? b.defenseBonus : 0), 0);
    }

    public static toggleEquip(eq: Equipment, val: Equippable) {
        const results: ITurnResult[] = [];

        if (eq.equipped[val.slot] === val) {
            eq.equipped[val.slot] = null;
            results.push({
                dequipped: val.owner,
            });
        } else {
            if (eq.equipped[val.slot]) {
                results.push({
                    dequipped: eq.equipped[val.slot].owner,
                });
            }
            eq.equipped[val.slot] = val;
            results.push({
                equipped: val.owner,
            });
        }

        return results;
    }

    public owner: Entity;

    public equipped: Equippable[] = new Array(EquipmentSlot.COUNT);

    public toJSON() {
        const ret = { ...(this as any) };
        ret._ownerId = ret.owner.id;
        ret.owner = undefined;
        ret._type = "Equipment";
        return ret;
    }
}
