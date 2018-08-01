import { Entity } from "./Entity";

export enum EquipmentSlot {
    MAIN_HAND,
    OFF_HAND,

    COUNT,
}

export const EQUIPMENTSLOTSTRINGS: string[] = [
    "Main Hand",
    "Off Hand",
];

export class Equippable {
    public static fromOtherEquippable(eq: Equippable) {
        return new Equippable(eq.slot, eq.powerBonus, eq.defenseBonus, eq.maxHpBonus);
    }

    public owner: Entity;

    constructor(public slot: EquipmentSlot,
                public powerBonus: number,
                public defenseBonus: number,
                public maxHpBonus: number,
    ) { }

    public toJSON() {
        const ret = { ...(this as any) };
        ret._ownerId = ret.owner.id;
        ret.owner = undefined;
        ret._type = "Equippable";
        return ret;
    }
}
