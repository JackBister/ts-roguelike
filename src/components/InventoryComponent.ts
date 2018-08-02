import { IComponent } from "./Component";

export class InventoryComponent implements IComponent {
    public id: number;
    public isActive: boolean = true;
    public readonly type: "InventoryComponent" = "InventoryComponent";

    // Entity IDs
    public items: number[] = [];

    constructor(public readonly ownerId: number, public readonly capacity: number) {}
}
