import { IComponent } from "./Component";

export class StairComponent implements IComponent {
    public id: number;
    public isActive: boolean = true;
    public readonly type: "StairComponent" = "StairComponent";

    constructor(public readonly mapId: number, public readonly ownerId: number) {}
}
