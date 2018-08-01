import { Entity } from "./Entity";
import { Equipment } from "./Equipment";
import { Message } from "./Message";
import { ITurnResult } from "./TurnResult";

export function getDefense(f: any) {
    let ret = f.baseDefense;
    if (f.owner && f.owner.equipment) {
        ret += Equipment.getDefenseBonus(f.owner.equipment);
    }
    return ret;
}

export function getMaxHp(f: any) {
    let ret = f.baseMaxHp;
    if (f.owner && f.owner.equipment) {
        ret += Equipment.getMaxHpBonus(f.owner.equipment);
    }
    return ret;
}

export function getPower(f: any) {
    let ret = f.basePower;
    if (f.owner && f.owner.equipment) {
        ret += Equipment.getPowerBonus(f.owner.equipment);
    }
    return ret;
}
