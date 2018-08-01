import { IComponent } from "./Component";

export class BasicMonsterAiComponent implements IComponent {
    public id: number;
    public isActive: boolean = true;
    public readonly type: "BasicMonsterAiComponent" = "BasicMonsterAiComponent";

    constructor(public readonly ownerId: number) {}
}
