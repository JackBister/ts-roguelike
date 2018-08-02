import { IComponent } from "./Component";
import { EquipmentSlot } from "./EquippableComponent";

export class EquipmentComponent implements IComponent {
    public id: number;
    public isActive: boolean = true;
    public readonly type: "EquipmentComponent" = "EquipmentComponent";

    // contains entity IDs
    public equipped: number[] = new Array(EquipmentSlot.COUNT);

    constructor(public readonly ownerId: number) { }
}
