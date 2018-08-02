import { IComponent } from "./Component";

export class PickupableComponent implements IComponent {
    public id: number;
    public isActive: boolean = true;
    public readonly type: "PickupableComponent" = "PickupableComponent";

    constructor(public readonly ownerId: number, public readonly name: string) {}
}
