import { IComponent } from "./Component";

export enum EquipmentSlot {
    MAIN_HAND,
    OFF_HAND,

    COUNT,
}

export const EQUIPMENTSLOTSTRINGS: string[] = [
    "Main Hand",
    "Off Hand",
];

export class EquippableComponent implements IComponent {
    public id: number;
    public isActive: boolean = true;
    public readonly type: "EquippableComponent" = "EquippableComponent";

    constructor(public readonly ownerId: number,
                public readonly slot: EquipmentSlot,
                public readonly powerBonus: number,
                public readonly defenseBonus: number,
                public readonly maxHpBonus: number,
    ) { }
}
